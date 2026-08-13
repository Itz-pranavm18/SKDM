import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icons';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      return 'First name must be at least 2 characters.';
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      return 'Last name must be at least 2 characters.';
    }
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(formData.username)) {
      return 'Username must be 3-50 characters (letters, numbers, underscores only).';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Please enter a valid email address.';
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      return 'Phone number must be a valid 10-digit Indian mobile number starting with 6-9.';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(formData.password)) {
      return 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    try {
      const res = await signup(payload);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card signup-card">
          {/* Left Banner */}
          <div className="auth-banner">
            <div className="auth-banner-content">
              <span className="eyebrow-badge">SKM Student Account</span>
              <h2>Join Shiv Kumari Mahavidyalaya</h2>
              <p className="motto">"सा विद्या या विमुक्तये"</p>
              <p className="desc">
                Create an account to apply for degree courses, access online study materials, and manage student registration.
              </p>
              <div className="auth-info-box">
                <h4>Registration Requirements</h4>
                <ul>
                  <li>Valid Email & Mobile Number for verification</li>
                  <li>Official Name as per 10th/12th Marks Sheet</li>
                  <li>Password with minimum 8 characters & special symbol</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="auth-form-container">
            <div className="auth-header">
              <h3>New Student Registration</h3>
              <p>Fill in your details to create your portal account</p>
            </div>

            {error && (
              <div className="auth-alert error">
                <Icon name="alert-circle" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert success">
                <Icon name="check" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Sharma"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. ramesh_2026"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Mobile Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-icon-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                    >
                      <Icon name={showPassword ? 'eye-off' : 'eye'} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div className="password-hint">
                Must contain 8+ characters, uppercase & lowercase letters, number & special character (e.g. @$!%*?&).
              </div>

              <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-sm"></span> Registering...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="auth-footer-text">
                Already have an account?{' '}
                <Link to="/login" className="signup-link">
                  Sign In Here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
