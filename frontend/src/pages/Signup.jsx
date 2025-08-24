import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    if (!displayName.trim()) {
      return setError('Display name is required');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName.trim());
      navigate('/profile-setup');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/profile-setup');
    } catch (error) {
      setError('Failed to sign up with Google: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="signup-container">
      {/* Animated Background */}
      <div className="signup-background">
        <div className="signup-bg-circle"></div>
        <div className="signup-bg-circle"></div>
        <div className="signup-bg-circle"></div>
      </div>

      <div className="signup-content">
        {/* Header */}
        <div className="signup-header">
          <div className="signup-logo">
            <Sparkles />
          </div>
          <h1 className="signup-title">
            Join MemeX
          </h1>
          <p className="signup-subtitle">
            Create your account and start sharing
          </p>
        </div>

        {/* Main Card */}
        <div className="signup-card">
          {/* Error Message */}
          {error && (
            <div className="signup-error">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Display Name Field */}
            <div className="signup-field">
              <label className="signup-label">
                Username
              </label>
              <div className="signup-input-wrapper">
                <User className="signup-icon" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="signup-input"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="signup-field">
              <label className="signup-label">
                Email
              </label>
              <div className="signup-input-wrapper">
                <Mail className="signup-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="signup-input"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="signup-field">
              <label className="signup-label">
                Password
              </label>
              <div className="signup-input-wrapper">
                <Lock className="signup-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="signup-input"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="signup-toggle-password"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="signup-field">
              <label className="signup-label">
                Confirm Password
              </label>
              <div className="signup-input-wrapper">
                <Lock className="signup-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="signup-input"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="signup-toggle-password"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="signup-submit"
            >
              {loading ? (
                <div className="signup-loading"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="signup-divider">
            <span className="signup-divider-text">
              or continue with
            </span>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="signup-google"
          >
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="signup-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}