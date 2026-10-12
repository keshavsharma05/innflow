import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { useHotel } from '../../services/HotelContext';
import { 
  RiArrowLeftLine, 
  RiShieldCheckLine, 
  RiUser3Line, 
  RiLockPasswordLine, 
  RiEyeLine, 
  RiEyeOffLine, 
  RiSparklingLine,
  RiErrorWarningLine,
  RiBuilding4Line,
  RiKey2Line
} from 'react-icons/ri';
import './AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAsAdmin } = useAuth();
  const { currentHotel } = useHotel();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from a private route, preserve the redirect target
  const from = location.state?.from?.pathname || `/admin`;

  const handleChange = (e) => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleAutofillDemo = () => {
    setCredentials({ username: 'admin', password: '123' });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginAsAdmin(credentials.username, credentials.password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  const hotelName = currentHotel?.name || 'Cozy Inn';

  return (
    <div className="admin-auth-page">
      {/* Top Floating Utility Navigation (No User-Side Navbar) */}
      <header className="admin-auth-topbar">
        <Link to="/" className="admin-back-btn" title="Return to Live Guest Site">
          <RiArrowLeftLine className="back-icon" />
          <span>Back to Live Site</span>
        </Link>
        <div className="admin-security-indicator">
          <span className="security-status-beacon" />
          <RiShieldCheckLine className="security-icon" />
          <span className="security-label">Staff Terminal • 256-Bit SSL Encrypted</span>
        </div>
      </header>

      {/* Main Split Authentication Stage */}
      <div className="admin-auth-stage">
        
        {/* Left Side: Editorial Hospitality Brand Showcase */}
        <div className="admin-auth-showcase">
          <div className="showcase-backdrop-image" />
          <div className="showcase-gradient-overlay" />
          <div className="showcase-content">
            
            <div className="showcase-brand-header">
              <div className="showcase-emblem">
                <img 
                  src="/images/hotel-property/logo.png" 
                  alt="Hotel Emblem" 
                  className="showcase-logo-img" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <RiBuilding4Line className="showcase-fallback-icon" />
              </div>
              <div className="showcase-brand-titles">
                <span className="brand-supertitle">HOSPITALITY MANAGEMENT</span>
                <span className="brand-primary-name">{hotelName.toUpperCase()}</span>
              </div>
            </div>

            <div className="showcase-editorial-block">
              <div className="editorial-kicker">
                <RiSparklingLine className="sparkle-icon" />
                <span>Executive Command Suite</span>
              </div>
              <h1 className="editorial-quote">
                Elegance in Hospitality. <br />
                <em>Precision in Operations.</em>
              </h1>
              <p className="editorial-description">
                Administrative portal for property reservation dispatch, room availability control, and contactless guest verification.
              </p>
            </div>

            <div className="showcase-stats-panel">
              <div className="stats-panel-item">
                <span className="stats-num">PMS 2.4</span>
                <span className="stats-tag">Engine Version</span>
              </div>
              <div className="stats-panel-divider" />
              <div className="stats-panel-item">
                <span className="stats-num">Live</span>
                <span className="stats-tag">Session Security</span>
              </div>
              <div className="stats-panel-divider" />
              <div className="stats-panel-item">
                <span className="stats-num">Real-Time</span>
                <span className="stats-tag">Room Sync</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="admin-auth-form-panel">
          <div className="admin-auth-card">
            
            <div className="card-header">
              <div className="auth-access-pill">
                <RiKey2Line className="pill-icon" />
                <span>RESTRICTED STAFF ACCESS</span>
              </div>
              <h2 className="card-headline">Manager Authentication</h2>
              <p className="card-subheadline">
                Sign in with authorized supervisor credentials to access property management.
              </p>
            </div>

            {error && (
              <div className="auth-alert-banner">
                <RiErrorWarningLine className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
              
              <div className="admin-input-group">
                <label htmlFor="admin-username">Manager Username or ID</label>
                <div className="input-field-wrapper">
                  <RiUser3Line className="input-lead-icon" />
                  <input
                    id="admin-username"
                    type="text"
                    name="username"
                    placeholder="Enter manager username"
                    value={credentials.username}
                    onChange={handleChange}
                    autoComplete="username"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <div className="label-row">
                  <label htmlFor="admin-password">Secure Password</label>
                </div>
                <div className="input-field-wrapper">
                  <RiLockPasswordLine className="input-lead-icon" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className={`admin-submit-btn ${loading ? 'is-loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading-state">
                    <span className="btn-spinner" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <span className="btn-text">Authenticate & Enter Portal</span>
                )}
              </button>

            </form>

            {/* Quick Demo Credentials Helper */}
            <div className="auth-demo-helper">
              <div className="helper-label">
                <span>Developer / Demo Access</span>
              </div>
              <button 
                type="button" 
                className="autofill-demo-chip"
                onClick={handleAutofillDemo}
                title="Click to quickly fill admin credentials"
              >
                <span>Autofill credentials:</span>
                <code>admin</code> / <code>123</code>
              </button>
            </div>

            <div className="auth-card-footer">
              <p>
                Strictly for authorized hotel personnel. All sessions, IP addresses, and actions are securely logged.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;


