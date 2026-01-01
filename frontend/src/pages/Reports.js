import React, { useState } from 'react';
import { reportsAPI } from '../utils/api';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDownloadReport = async () => {
    if (!selectedMonth) {
      setMessage('Please select a month');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const [year, month] = selectedMonth.split('-');
      const monthYear = `${month}-${year}`;

      const response = await reportsAPI.downloadExcel(monthYear);

      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Duty_Report_${monthYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      setMessage('Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthYear) => {
    if (!monthYear) return '';
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Reports</h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Generate and download comprehensive reports of employee duties and performance.
      </p>

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

      <div className="card" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>📊 Excel Report Generator</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Download detailed Excel reports containing duty schedules, employee summaries, and shift-wise statistics.
        </p>

        {/* Month Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: 'var(--text-color)',
            fontSize: '1.1rem'
          }}>
            Select Month
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              fontSize: '1rem',
              minWidth: '200px'
            }}
          />
          {selectedMonth && (
            <p style={{
              marginTop: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              Generating report for: <strong>{getMonthName(selectedMonth)}</strong>
            </p>
          )}
        </div>

        {/* Report Features */}
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>📋 Report Contents</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>📅 Duty Schedule</h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, paddingLeft: '1rem' }}>
                <li>Detailed duty assignments</li>
                <li>Employee information</li>
                <li>Completion status</li>
                <li>Date and shift details</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>👥 Employee Summary</h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, paddingLeft: '1rem' }}>
                <li>Total duties count</li>
                <li>Monthly performance</li>
                <li>Completion rates</li>
                <li>Individual statistics</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>⏰ Shift Analysis</h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, paddingLeft: '1rem' }}>
                <li>Daily shift breakdown</li>
                <li>Completion statistics</li>
                <li>Shift-wise summaries</li>
                <li>Performance metrics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownloadReport}
          disabled={loading || !selectedMonth}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            backgroundColor: loading ? 'var(--text-secondary)' : 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseDown={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              Generating Report...
            </>
          ) : (
            <>
              📊 Download Excel Report
            </>
          )}
        </button>

        {/* Instructions */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>💡 How to Use</h4>
          <ol style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, paddingLeft: '1.5rem' }}>
            <li>Select the desired month from the date picker above</li>
            <li>Click the "Download Excel Report" button</li>
            <li>The report will be automatically downloaded to your device</li>
            <li>Open the Excel file to view detailed duty information</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Reports;