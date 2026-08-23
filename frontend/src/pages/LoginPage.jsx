import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, setMessage } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ identifier: '', fullName: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        if (!form.identifier || !form.password) {
          throw new Error('Please fill in all fields');
        }
        await login({ username: form.identifier, email: form.identifier, password: form.password });
        setMessage({ type: 'success', text: 'Signed in successfully.' });
      } else {
        if (!form.fullName || !form.username || !form.email || !form.password) {
          throw new Error('Please fill in all fields');
        }
        if (form.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register({
          username: form.username.trim(),
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        });
        setMessage({ type: 'success', text: 'Account created successfully.' });
      }

      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(error.message);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((currentMode) => (currentMode === 'login' ? 'signup' : 'login'));
    setForm({ identifier: '', fullName: '', username: '', email: '', password: '' });
    setError('');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <aside className="auth-visual">
          <div className="brand-row">
            <span className="brand-mark">✈</span>
            <span className="brand-name">Study-Pilot</span>
          </div>

          <div className="journey-row" aria-hidden="true">
            <span className="journey-pill active">↑</span>
            <span className="journey-line"></span>
            <span className="journey-pill">✦</span>
            <span className="journey-line"></span>
            <span className="journey-pill">☰</span>
            <span className="journey-line"></span>
            <span className="journey-pill">✓</span>
          </div>

          <div className="visual-copy">
            <h2>
              {mode === 'login'
                ? 'Upload a syllabus.\nLand on exam day ready.'
                : 'Every course gets\nits own flight plan.'}
            </h2>
            <p>
              {mode === 'login'
                ? 'Study-Pilot turns any syllabus into a day-by-day flight plan for your exams.'
                : 'Create independent workspaces for each syllabus and track them side by side.'}
            </p>
          </div>

          <div className="brand-footer">CHITKARA UNIVERSITY &middot; BATCH 2028</div>
        </aside>

        <main className="auth-panel">
          <div className="auth-header">
            <p className="eyebrow">
              {mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
            </p>
            <h1>
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h1>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            {mode === 'signup' && (
              <>
                <label>
                  <span>Full name</span>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Aashish Tharu"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>Username</span>
                  <input
                    type="text"
                    name="username"

                    value={form.username}
                    onChange={handleChange}
                  />
                </label>
              </>
            )}

            {mode === 'login' ? (
              <label>
                <span>username</span>
                <input
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                />
              </label>
            ) : (
              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </label>
            )}

            {mode === 'login' && (
              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
              </label>
            )}

            {mode === 'signup' && (
              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                />
              </label>
            )}

            {mode === 'login' && (
              <div className="helper-row">
                <button type="button" className="link-button">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="primary-auth-button" disabled={loading}>
              {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            <div className="switch-row">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button type="button" className="switch-button" onClick={toggleMode}>
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
