const express = require('express');
const ExcelJS = require('exceljs');
const moment = require('moment-timezone');
const Duty = require('../models/Duty');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/excel/:monthYear - Generate Excel report for duties
router.get('/excel/:monthYear', auth, async (req, res) => {
  try {
    const monthYear = req.params.monthYear; // Format: MM-YYYY

    if (!/^\d{2}-\d{4}$/.test(monthYear)) {
      return res.status(400).json({ message: 'Invalid monthYear format. Use MM-YYYY' });
    }

    const [month, year] = monthYear.split('-');
    const startDate = moment.tz(`${year}-${month}-01`, 'YYYY-MM-DD', 'Asia/Kolkata').startOf('month');
    const endDate = moment(startDate).endOf('month');

    // Get all duties for the month
    const duties = await Duty.find({
      date: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate()
      }
    }).populate('employee', 'employeeId name gender').sort({ date: 1, shiftTime: 1 });

    // Get all employees for summary
    const employees = await Employee.find({})
      .select('employeeId name gender totalDutiesCount monthlyDuties')
      .sort({ employeeId: 1 });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Employee Duty Management System';
    workbook.created = new Date();

    // Sheet 1: Duty Schedule
    const scheduleSheet = workbook.addWorksheet('Duty Schedule');

    // Header
    scheduleSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Day', key: 'day', width: 10 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'name', width: 20 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Shift Time', key: 'shiftTime', width: 15 },
      { header: 'Scheduled', key: 'isScheduled', width: 12 },
      { header: 'Completed', key: 'isCompleted', width: 12 }
    ];

    // Style header
    scheduleSheet.getRow(1).font = { bold: true };
    scheduleSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add duty data
    duties.forEach(duty => {
      scheduleSheet.addRow({
        date: moment(duty.date).format('DD/MM/YYYY'),
        day: moment(duty.date).format('dddd'),
        employeeId: duty.employee.employeeId,
        name: duty.employee.name,
        gender: duty.employee.gender,
        shiftTime: duty.shiftTime,
        isScheduled: duty.isScheduled ? 'Yes' : 'No',
        isCompleted: duty.isCompleted ? 'Yes' : 'No'
      });
    });

    // Sheet 2: Employee Summary
    const summarySheet = workbook.addWorksheet('Employee Summary');

    summarySheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'name', width: 20 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Total Duties', key: 'totalDutiesCount', width: 15 },
      { header: 'Monthly Duties', key: 'monthlyCount', width: 15 },
      { header: 'Completion Rate', key: 'completionRate', width: 18 }
    ];

    // Style header
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Calculate monthly stats
    const monthlyStats = {};
    duties.forEach(duty => {
      const empId = duty.employee.employeeId;
      if (!monthlyStats[empId]) {
        monthlyStats[empId] = { scheduled: 0, completed: 0 };
      }
      if (duty.isScheduled) monthlyStats[empId].scheduled++;
      if (duty.isCompleted) monthlyStats[empId].completed++;
    });

    // Add employee summary data
    employees.forEach(employee => {
      const monthlyData = employee.monthlyDuties.find(d => d.monthYear === monthYear);
      const monthlyCount = monthlyData ? monthlyData.count : 0;
      const monthlyScheduled = monthlyStats[employee.employeeId]?.scheduled || 0;
      const completionRate = monthlyScheduled > 0 ? ((monthlyCount / monthlyScheduled) * 100).toFixed(1) : '0.0';

      summarySheet.addRow({
        employeeId: employee.employeeId,
        name: employee.name,
        gender: employee.gender,
        totalDutiesCount: employee.totalDutiesCount,
        monthlyCount: monthlyCount,
        completionRate: `${completionRate}%`
      });
    });

    // Sheet 3: Shift-wise Summary
    const shiftSheet = workbook.addWorksheet('Shift Summary');

    shiftSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: '6am-2pm', key: 'shift1', width: 15 },
      { header: '2pm-10pm', key: 'shift2', width: 15 },
      { header: '9am-6pm', key: 'shift3', width: 15 },
      { header: 'Total Scheduled', key: 'totalScheduled', width: 18 },
      { header: 'Total Completed', key: 'totalCompleted', width: 18 }
    ];

    // Style header
    shiftSheet.getRow(1).font = { bold: true };
    shiftSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Group duties by date
    const dutiesByDate = {};
    duties.forEach(duty => {
      const dateKey = moment(duty.date).format('DD/MM/YYYY');
      if (!dutiesByDate[dateKey]) {
        dutiesByDate[dateKey] = {
          '6am-2pm': { scheduled: 0, completed: 0 },
          '2pm-10pm': { scheduled: 0, completed: 0 },
          '9am-6pm': { scheduled: 0, completed: 0 }
        };
      }
      if (duty.isScheduled) dutiesByDate[dateKey][duty.shiftTime].scheduled++;
      if (duty.isCompleted) dutiesByDate[dateKey][duty.shiftTime].completed++;
    });

    // Add shift summary data
    Object.keys(dutiesByDate).sort().forEach(date => {
      const dayData = dutiesByDate[date];
      const totalScheduled = dayData['6am-2pm'].scheduled + dayData['2pm-10pm'].scheduled + dayData['9am-6pm'].scheduled;
      const totalCompleted = dayData['6am-2pm'].completed + dayData['2pm-10pm'].completed + dayData['9am-6pm'].completed;

      shiftSheet.addRow({
        date: date,
        shift1: `${dayData['6am-2pm'].completed}/${dayData['6am-2pm'].scheduled}`,
        shift2: `${dayData['2pm-10pm'].completed}/${dayData['2pm-10pm'].scheduled}`,
        shift3: `${dayData['9am-6pm'].completed}/${dayData['9am-6pm'].scheduled}`,
        totalScheduled: totalScheduled,
        totalCompleted: totalCompleted
      });
    });

    // Set response headers
    const fileName = `Duty_Report_${monthYear}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Excel generation error:', error);
    res.status(500).json({ message: 'Server error generating report', error: error.message });
  }
});

module.exports = router;