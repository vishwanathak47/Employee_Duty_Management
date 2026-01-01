import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await signup(formData.name, formData.email, formData.password);

      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-color)',
      padding: '1rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem'
      }}>
        <div className="text-center mb-4">
          <h2 style={{
            color: 'var(--primary-color)',
            marginBottom: '0.5rem',
            fontSize: '1.75rem'
          }}>
            Duty Manager
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label htmlFor="name" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: 'var(--text-color)'
              }}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                value={formData.name || ''}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-color)'
            }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--text-color)'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: 'var(--border-radius)',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', name: '' });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;