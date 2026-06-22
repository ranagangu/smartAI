import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const { login, register } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-view-container">
      <div className="auth-card glass-panel">
        <div className="auth-card-header">
          <div className="auth-logo">✨</div>
          <h2 className="gradient-text">SmartAI Prep Portal</h2>
          <p>{isLoginView ? 'Sign in to access your mock simulations' : 'Create an account to build customized roadmaps'}</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body">
          {!isLoginView && (
            <div className="auth-input-group">
              <label htmlFor="auth-name">Name</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="auth-name"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="auth-email"
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="auth-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isLoginView ? <LogIn size={18} /> : <UserPlus size={18} />}
            <span>{isSubmitting ? 'Authenticating...' : isLoginView ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>



        <div className="auth-toggle-link">
          {isLoginView ? (
            <p>
              New to the platform?{' '}
              <button type="button" onClick={() => { setIsLoginView(false); setError(''); }}>
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => { setIsLoginView(true); setError(''); }}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
