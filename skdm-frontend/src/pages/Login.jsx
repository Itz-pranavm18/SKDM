import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/profile';

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('student'); // student | faculty | admin

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail.trim() || !formData.password) {
      setError('Please enter both email/username and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await login(formData.usernameOrEmail, formData.password, formData.rememberMe);
      const roles = res?.data?.user?.roles || [];
      const isAdmin = roles.some((r) => r === 'ROLE_ADMIN' || r === 'ADMIN') || userType === 'admin';
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from === '/profile' ? '/profile' : from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          {/* Left Hero Side */}
          <div className="auth-banner">
            <div className="auth-banner-content">
              <span className="eyebrow-badge">SKM Portal</span>
              <h2>Welcome to Shiv Kumari Mahavidyalaya</h2>
              <p className="motto">"सा विद्या या विमुक्तये"</p>
              <p className="desc">
                Access student portal, course records, fee structures, notices, and academic performance tracking.
              </p>
              <div className="auth-features">
                <div className="feature-item">
                  <Icon name="check" />
                  <span>Student & Faculty Portal Access</span>
                </div>
                <div className="feature-item">
                  <Icon name="check" />
                  <span>Online Admission & Application Tracking</span>
                </div>
                <div className="feature-item">
                  <Icon name="check" />
                  <span>Exam Schedules & Results Notification</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="auth-form-container">
            <div className="auth-header">
              <h3>Account Login</h3>
              <p>Sign in to your SKM account to continue</p>
            </div>

            {/* Role selector tab */}
            <div className="user-type-selector">
              <button
                type="button"
                className={`type-btn ${userType === 'student' ? 'active' : ''}`}
                onClick={() => setUserType('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`type-btn ${userType === 'admin' ? 'active' : ''}`}
                onClick={() => setUserType('admin')}
              >
                Administration
              </button>
            </div>

            {userType === 'student' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#166534' }}>
                💡 <strong>Student Note:</strong> Log in using your assigned <strong>Student ID</strong> (e.g. <code>BA000019</code>) as Username, and your <strong>Date of Birth (DOB)</strong> as Password.
              </div>
            )}

            {error && (
              <div className="auth-alert error">
                <Icon name="alert-circle" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="usernameOrEmail">{userType === 'student' ? 'Student ID / Email' : 'Username / Email'}</label>
                <div className="input-icon-wrapper">
                  <Icon name="user" />
                  <input
                    type="text"
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    placeholder={userType === 'student' ? 'e.g. BA000019' : 'Enter username or email'}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">{userType === 'student' ? 'Password (DOB)' : 'Password'}</label>
                <div className="input-icon-wrapper">
                  <Icon name="lock" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={userType === 'student' ? 'e.g. YYYY-MM-DD' : 'Enter password'}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} />
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-sm"></span> Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
