import React, { useState, useEffect } from 'react';
import { employeesAPI } from '../utils/api';

const Register = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    gender: 'Male',
    photoUrl: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMessage('Failed to load employees');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editingEmployee) {
        await employeesAPI.update(editingEmployee._id, formData);
        setMessage('Employee updated successfully');
      } else {
        await employeesAPI.create(formData);
        setMessage('Employee added successfully');
      }

      setFormData({
        employeeId: '',
        name: '',
        gender: 'Male',
        photoUrl: ''
      });
      setShowForm(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      gender: employee.gender,
      photoUrl: employee.photoUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await employeesAPI.delete(employeeId);
      setMessage('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      setMessage('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Employee Register</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Manage employee profiles and information
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingEmployee(null);
            setFormData({
              employeeId: '',
              name: '',
              gender: 'Male',
              photoUrl: ''
            });
          }}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          {showForm ? '✕ Cancel' : '➕ Add Employee'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: 'var(--border-radius)',
          backgroundColor: message.includes('Failed') || message.includes('Error') ? 'var(--danger-color)' : 'var(--success-color)',
          color: 'white',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="input"
                  required
                  placeholder="Enter unique employee ID"
                  disabled={!!editingEmployee} // Can't change ID when editing
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  Photo URL
                </label>
                <input
                  type="url"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                ) : (
                  editingEmployee ? '💾 Update Employee' : '➕ Add Employee'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
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

      {/* Employee List */}
      <div style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        {filteredEmployees.map((employee) => {
          const borderColor = employee.gender === 'Female' ? '#87CEEB' : '#FFA500';

          return (
            <div
              key={employee.employeeId}
              className="card"
              style={{
                padding: '1.5rem',
                position: 'relative',
                border: `3px solid ${borderColor}`
              }}
            >
              {/* Employee Photo */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
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
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
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
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  Gender: {employee.gender}
                </p>
                <p style={{
                  margin: '0',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  Total Duties: {employee.totalDutiesCount || 0}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => handleEdit(employee)}
                  className="btn"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    padding: '0.5rem'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(employee._id)}
                  className="btn"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--danger-color)',
                    color: 'white',
                    padding: '0.5rem'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3>No employees found</h3>
          <p>
            {searchTerm ? 'Try adjusting your search terms.' : 'Add your first employee to get started.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              ➕ Add First Employee
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Register;