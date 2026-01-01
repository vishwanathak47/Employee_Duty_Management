const express = require('express');
const moment = require('moment-timezone');
const Duty = require('../models/Duty');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/duties/schedule - Bulk schedule or mark leave for employees
router.post('/schedule', auth, async (req, res) => {
  try {
    const { duties } = req.body; // Array of { employeeId, date, shiftTime, isScheduled }

    if (!Array.isArray(duties) || duties.length === 0) {
      return res.status(400).json({ message: 'Duties array is required' });
    }

    const createdDuties = [];
    const errors = [];

    for (const dutyData of duties) {
      try {
        const { employeeId, date, shiftTime, isScheduled = true } = dutyData;

        // Validate required fields
        if (!employeeId || !date || !shiftTime) {
          errors.push({ dutyData, error: 'Missing required fields: employeeId, date, shiftTime' });
          continue;
        }

        // Check if employee exists
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
          errors.push({ dutyData, error: 'Employee not found' });
          continue;
        }

        // Parse date in IST
        const dutyDate = moment.tz(date, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day');

        // Check if duty already exists for this employee on this date
        const existingDuty = await Duty.findOne({
          employee: employee._id,
          date: dutyDate.toDate()
        });

        if (existingDuty) {
          // Update existing duty
          existingDuty.shiftTime = shiftTime;
          existingDuty.isScheduled = isScheduled;
          await existingDuty.save();
          createdDuties.push(existingDuty);
        } else {
          // Create new duty
          const newDuty = new Duty({
            employee: employee._id,
            date: dutyDate.toDate(),
            shiftTime,
            isScheduled
          });
          await newDuty.save();
          createdDuties.push(newDuty);
        }
      } catch (error) {
        errors.push({ dutyData, error: error.message });
      }
    }

    res.status(201).json({
      message: `Processed ${duties.length} duties`,
      created: createdDuties.length,
      errors: errors.length,
      duties: createdDuties,
      errors: errors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/duties/complete/:id - Mark duty as finished and increment employee's monthly count
router.put('/complete/:id', auth, async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.id).populate('employee');
    if (!duty) {
      return res.status(404).json({ message: 'Duty not found' });
    }

    if (duty.isCompleted) {
      return res.status(400).json({ message: 'Duty already completed' });
    }

    // Mark duty as completed
    duty.isCompleted = true;
    await duty.save();

    // Increment employee's monthly duties count
    const monthYear = moment(duty.date).format('MM-YYYY');
    const employee = await Employee.findById(duty.employee._id);

    let monthlyDuty = employee.monthlyDuties.find(d => d.monthYear === monthYear);
    if (monthlyDuty) {
      monthlyDuty.count += 1;
    } else {
      employee.monthlyDuties.push({ monthYear, count: 1 });
    }

    employee.totalDutiesCount += 1;
    await employee.save();

    res.json({
      message: 'Duty marked as completed',
      duty,
      employee: {
        id: employee._id,
        name: employee.name,
        totalDutiesCount: employee.totalDutiesCount,
        monthlyCount: monthlyDuty ? monthlyDuty.count : 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/duties/status/:date - Data for home page status (Green/Red indicators)
router.get('/status/:date', auth, async (req, res) => {
  try {
    const dateParam = req.params.date; // Expected format: YYYY-MM-DD
    const queryDate = moment.tz(dateParam, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day');

    if (!queryDate.isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get all duties for the specified date
    const duties = await Duty.find({
      date: queryDate.toDate()
    }).populate('employee', 'employeeId name gender photoUrl');

    // Group by shift time
    const statusByShift = {
      '6am-2pm': { scheduled: 0, completed: 0, employees: [] },
      '2pm-10pm': { scheduled: 0, completed: 0, employees: [] },
      '9am-6pm': { scheduled: 0, completed: 0, employees: [] }
    };

    duties.forEach(duty => {
      const shift = duty.shiftTime;
      if (duty.isScheduled) {
        statusByShift[shift].scheduled += 1;
        statusByShift[shift].employees.push({
          id: duty.employee._id,
          employeeId: duty.employee.employeeId,
          name: duty.employee.name,
          gender: duty.employee.gender,
          photoUrl: duty.employee.photoUrl,
          isCompleted: duty.isCompleted
        });
      }
      if (duty.isCompleted) {
        statusByShift[shift].completed += 1;
      }
    });

    // Calculate overall status
    const totalScheduled = Object.values(statusByShift).reduce((sum, shift) => sum + shift.scheduled, 0);
    const totalCompleted = Object.values(statusByShift).reduce((sum, shift) => sum + shift.completed, 0);

    res.json({
      date: dateParam,
      totalScheduled,
      totalCompleted,
      completionRate: totalScheduled > 0 ? (totalCompleted / totalScheduled * 100).toFixed(1) : 0,
      shifts: statusByShift
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/duties - Get all duties with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, employeeId, shiftTime, completed } = req.query;

    let query = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = moment.tz(startDate, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('day').toDate();
      }
      if (endDate) {
        query.date.$lte = moment.tz(endDate, 'YYYY-MM-DD', 'Asia/Kolkata').endOf('day').toDate();
      }
    }

    // Employee filter
    if (employeeId) {
      const employee = await Employee.findOne({ employeeId });
      if (employee) {
        query.employee = employee._id;
      }
    }

    // Shift time filter
    if (shiftTime) {
      query.shiftTime = shiftTime;
    }

    // Completion status filter
    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }

    const duties = await Duty.find(query)
      .populate('employee', 'employeeId name gender photoUrl')
      .sort({ date: -1, shiftTime: 1 });

    res.json(duties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;