import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import Icon from '../components/Icons';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP & new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authApi.forgotPassword(email.trim());
      setMessage('OTP sent to your email address! Please check your inbox/spam folder.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(newPassword)) {
      setError('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      setMessage('Password reset successful! You can now log in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check the OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card forgot-card">
          <div className="auth-form-container full-width">
            <div className="auth-header text-center">
              <span className="eyebrow-badge">Security Portal</span>
              <h3>Reset Your Password</h3>
              <p>
                {step === 1
                  ? 'Enter your registered email address to receive a password reset OTP'
                  : `Enter the OTP sent to ${email} and your new password`}
              </p>
            </div>

            {error && (
              <div className="auth-alert error">
                <Icon name="alert-circle" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="auth-alert success">
                <Icon name="check" />
                <span>{message}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Registered Email Address</label>
                  <div className="input-icon-wrapper">
                    <Icon name="mail" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@skmahavidyalaya.ac.in"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-sm"></span> Sending OTP...
                    </>
                  ) : (
                    'Send Password Reset OTP'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="otp">6-Digit OTP Code</label>
                  <div className="input-icon-wrapper">
                    <Icon name="lock" />
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-icon-wrapper">
                    <Icon name="lock" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 chars)"
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

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-icon-wrapper">
                    <Icon name="lock" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div className="password-hint">
                  Must contain 8+ characters, uppercase & lowercase letters, number & special character (e.g. @$!%*?&).
                </div>

                <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-sm"></span> Resetting Password...
                    </>
                  ) : (
                    'Reset Password & Sign In'
                  )}
                </button>
              </form>
            )}

            <div className="auth-footer-text text-center">
              Remember your password?{' '}
              <Link to="/login" className="signup-link">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
