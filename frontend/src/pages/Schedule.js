import React, { useState, useEffect, useCallback } from 'react';
import { employeesAPI, dutiesAPI } from '../utils/api';

const Schedule = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('6am-2pm');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // For attendance marking
  const [todayDuties, setTodayDuties] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const shifts = ['6am-2pm', '2pm-10pm', '9am-6pm'];

  const fetchTodayDuties = useCallback(async () => {
    try {
      setAttendanceLoading(true);
      const response = await dutiesAPI.getStatus(selectedDate);
      // Transform the data to get individual duties
      const duties = [];
      Object.entries(response.data.shifts || {}).forEach(([shift, data]) => {
        data.employees.forEach(employee => {
          duties.push({
            ...employee,
            shiftTime: shift,
            isCompleted: employee.isCompleted
          });
        });
      });
      setTodayDuties(duties);
    } catch (error) {
      console.error('Error fetching today duties:', error);
    } finally {
      setAttendanceLoading(false);
    }
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    if (activeTab === 'attendance') {
      fetchTodayDuties();
    }
  }, [activeTab, selectedDate, fetchTodayDuties]);

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleBulkSchedule = async () => {
    if (selectedEmployees.length === 0) {
      setMessage('Please select at least one employee');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const dutiesData = selectedEmployees.map(employeeId => ({
        employeeId,
        date: selectedDate,
        shiftTime: selectedShift,
        isScheduled: true
      }));

      const response = await dutiesAPI.schedule(dutiesData);

      setMessage(`Successfully scheduled ${response.data.created} duties`);
      setSelectedEmployees([]);
      // Refresh today's status if we're on the same date
      if (selectedDate === new Date().toISOString().split('T')[0]) {
        // This would trigger a refresh of the home page data
      }
    } catch (error) {
      setMessage('Failed to schedule duties');
      console.error('Error scheduling duties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (employeeId, shiftTime) => {
    try {
      // Find the duty to complete
      const response = await dutiesAPI.getAll({
        employeeId,
        date: selectedDate,
        shiftTime
      });

      if (response.data.length > 0) {
        const dutyId = response.data[0]._id;
        await dutiesAPI.complete(dutyId);
        setMessage('Attendance marked successfully');
        fetchTodayDuties(); // Refresh the list
      }
    } catch (error) {
      setMessage('Failed to mark attendance');
      console.error('Error marking attendance:', error);
    }
  };

  const availableEmployees = employees.filter(emp => emp.isAvailable !== false);

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Duty Scheduler</h1>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => setActiveTab('schedule')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            backgroundColor: activeTab === 'schedule' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'schedule' ? 'white' : 'var(--text-color)',
            borderBottom: activeTab === 'schedule' ? '2px solid var(--primary-color)' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'var(--transition)'
          }}
        >
          📅 Schedule Duties
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            backgroundColor: activeTab === 'attendance' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'attendance' ? 'white' : 'var(--text-color)',
            borderBottom: activeTab === 'attendance' ? '2px solid var(--primary-color)' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'var(--transition)'
          }}
        >
          ✅ Mark Attendance
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: 'var(--border-radius)',
          backgroundColor: message.includes('Failed') ? 'var(--danger-color)' : 'var(--success-color)',
          color: 'white',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div>
          {/* Date and Shift Selection */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Select Date & Shift</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  Shift
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="input"
                >
                  {shifts.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
              Select Employees ({selectedEmployees.length} selected)
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {availableEmployees.map(employee => (
                <div
                  key={employee.employeeId}
                  onClick={() => handleEmployeeToggle(employee.employeeId)}
                  style={{
                    padding: '1rem',
                    border: `2px solid ${selectedEmployees.includes(employee.employeeId) ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    backgroundColor: selectedEmployees.includes(employee.employeeId) ? 'rgba(0, 123, 255, 0.1)' : 'var(--bg-color)',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.employeeId)}
                    onChange={() => {}} // Handled by parent onClick
                    style={{ margin: 0 }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                      {employee.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {employee.employeeId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Button */}
          <button
            onClick={handleBulkSchedule}
            disabled={loading || selectedEmployees.length === 0}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : '📅 Schedule Duties'}
          </button>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div>
          {/* Date Selection for Attendance */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Select Date</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Attendance List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
              Mark Attendance - {new Date(selectedDate).toLocaleDateString()}
            </h3>

            {attendanceLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner"></div>
              </div>
            ) : todayDuties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p>No duties scheduled for this date</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
              }}>
                {todayDuties.map((duty, index) => (
                  <div
                    key={`${duty.employeeId}-${duty.shiftTime}-${index}`}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: duty.isCompleted ? 'var(--success-color)' : 'var(--bg-color)',
                      color: duty.isCompleted ? 'white' : 'var(--text-color)'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600' }}>{duty.name}</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        {duty.employeeId} • {duty.shiftTime}
                      </div>
                    </div>

                    {duty.isCompleted ? (
                      <div style={{
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 'var(--border-radius)',
                        textAlign: 'center',
                        fontWeight: '500'
                      }}>
                        ✅ Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkAttendance(duty.employeeId, duty.shiftTime)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--border-radius)',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'var(--transition)'
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        ✅ Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;