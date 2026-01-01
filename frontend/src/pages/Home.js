import React, { useState, useEffect } from 'react';
import { employeesAPI, dutiesAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayStatus, setTodayStatus] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchEmployees();
    fetchTodayStatus();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      setError('Failed to load employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await dutiesAPI.getStatus(today);
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeStatus = (employeeId) => {
    // Check if employee has a duty scheduled for today
    const employeeDuties = todayStatus.shifts || {};
    for (const [, data] of Object.entries(employeeDuties)) {
      const employee = data.employees.find(emp => emp.employeeId === employeeId);
      if (employee) {
        return employee.isCompleted ? 'completed' : 'scheduled';
      }
    }
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#28a745'; // Green
      case 'scheduled': return '#ffc107'; // Yellow/Orange
      case 'completed': return '#6c757d'; // Gray
      default: return '#28a745';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'scheduled': return 'On Duty';
      case 'completed': return 'Duty Done';
      default: return 'Available';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div style={{
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'var(--text-color)',
          marginBottom: '0.5rem',
          fontSize: '1.5rem'
        }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Manage your team's duties and schedules
        </p>
      </div>

      {/* Today's Status Summary */}
      {todayStatus.totalScheduled > 0 && (
        <div className="card" style={{
          marginBottom: '1.5rem',
          padding: '1rem'
        }}>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: 'var(--text-color)',
            fontSize: '1.1rem'
          }}>
            Today's Overview
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--primary-color)'
              }}>
                {todayStatus.totalScheduled}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                Scheduled
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--success-color)'
              }}>
                {todayStatus.totalCompleted}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                Completed
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--warning-color)'
              }}>
                {todayStatus.completionRate}%
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                Rate
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Search Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'var(--bg-color)',
        padding: '1rem 0',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          position: 'relative',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <input
            type="text"
            placeholder="Search employees by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              fontSize: '1rem'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '1.2rem'
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: 'var(--danger-color)',
          color: 'white',
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Employee List */}
      <div style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
      }}>
        {filteredEmployees.map((employee) => {
          const status = getEmployeeStatus(employee.employeeId);
          const statusColor = getStatusColor(status);
          const borderColor = employee.gender === 'Female' ? '#87CEEB' : '#FFA500'; // Sky Blue for Female, Orange for Male

          return (
            <div
              key={employee.employeeId}
              className="card"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                border: `3px solid ${borderColor}`,
                position: 'relative'
              }}
              onClick={(event) => {
                // Add tap animation
                const card = event.currentTarget;
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                  card.style.transform = 'scale(1)';
                }, 150);
              }}
            >
              {/* Status Indicator */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: statusColor,
                border: '2px solid var(--bg-color)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />

              {/* Employee Photo */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: `3px solid ${borderColor}`,
                  overflow: 'hidden'
                }}>
                  {employee.photoUrl ? (
                    <img
                      src={employee.photoUrl}
                      alt={employee.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    employee.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Employee Info */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-color)',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  {employee.name}
                </h3>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  ID: {employee.employeeId}
                </p>
                <p style={{
                  margin: '0 0 1rem 0',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  Gender: {employee.gender}
                </p>

                {/* Status Button */}
                <button
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: statusColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add tap animation
                    const btn = e.currentTarget;
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                      btn.style.transform = 'scale(1)';
                    }, 150);
                  }}
                >
                  {getStatusText(status)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3>No employees found</h3>
          <p>Try adjusting your search terms or add new employees.</p>
        </div>
      )}
    </div>
  );
};

export default Home;