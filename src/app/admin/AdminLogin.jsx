
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { useHotel } from '../../services/HotelContext';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import './AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAsAdmin } = useAuth();
  const { currentHotel } = useHotel();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';
  const hotelName = currentHotel?.name || 'Cozy Inn';

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginAsAdmin(
        credentials.username,
        credentials.password
      );

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid username or password.');
        setLoading(false);
      }
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="admin-login">
      <Link to="/" className="login-back">
        ← Back to site
      </Link>

      <section className="login-card">
        <div className="login-brand">
          <img
            src="/images/hotel-property/logo.png"
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span>{hotelName}</span>
        </div>

        <h1>Admin Login</h1>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Enter username"
            value={credentials.username}
            onChange={handleChange}
            autoComplete="username"
            autoFocus
            required
          />

          <label htmlFor="password">Password</label>
          <div className="login-password">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="login-demo">
            <div className="login-demo-heading">
              <span className="login-demo-dot" />
              <span>DEMO ACCESS</span>
            </div>

            <p>Use these credentials to explore the admin dashboard.</p>

            <div className="login-demo-credentials">
              <div>
                <span>USERNAME</span>
                <strong>admin</strong>
              </div>

              <div>
                <span>PASSWORD</span>
                <strong>123</strong>
              </div>
            </div>

            <button
              type="button"
              className="login-demo-fill"
              onClick={() => {
                setCredentials({ username: 'admin', password: '123' });
                setError('');
              }}
            >
              Fill demo credentials <span>↗</span>
            </button>
          </div>

        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
