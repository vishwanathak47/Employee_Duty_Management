const express = require('express');
const moment = require('moment-timezone');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all employees with current month count, sorted by availability
router.get('/', auth, async (req, res) => {
  try {
    const currentMonthYear = moment().format('MM-YYYY');
    
    const employees = await Employee.find({})
      .select('employeeId name gender photoUrl totalDutiesCount monthlyDuties')
      .lean();

    // Add current month count and sort by availability (assuming no duty means available)
    const employeesWithCurrentCount = employees.map(emp => {
      const currentMonthDuty = emp.monthlyDuties.find(d => d.monthYear === currentMonthYear);
      const currentMonthCount = currentMonthDuty ? currentMonthDuty.count : 0;
      
      return {
        ...emp,
        currentMonthCount,
        // For now, assume available if current month count < some threshold, say 30
        isAvailable: currentMonthCount < 30
      };
    });

    // Sort by availability (available first)
    employeesWithCurrentCount.sort((a, b) => b.isAvailable - a.isAvailable);

    res.json(employeesWithCurrentCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create employee
router.post('/', auth, async (req, res) => {
  try {
    const { employeeId, name, gender, photoUrl } = req.body;

    // Check if employeeId already exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const employee = new Employee({
      employeeId,
      name,
      gender,
      photoUrl: photoUrl || ''
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Employee ID already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Update employee
router.put('/:id', auth, async (req, res) => {
  try {
    const { employeeId, name, gender, photoUrl } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if new employeeId conflicts with another employee
    if (employeeId && employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    employee.employeeId = employeeId || employee.employeeId;
    employee.name = name || employee.name;
    employee.gender = gender || employee.gender;
    employee.photoUrl = photoUrl !== undefined ? photoUrl : employee.photoUrl;

    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;