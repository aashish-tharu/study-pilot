import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, signOut, message, setMessage } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      setMessage({ type: 'success', text: 'You have been logged out.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Study Pilot</p>
          <h1>Turn your syllabus into a focused study plan.</h1>
          <p className="hero-copy">
            Organize your learning, create workspaces, and stay consistent with a guided daily workflow.
          </p>
        </div>
        <nav className="top-nav">
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <button type="button" className="ghost-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="primary-btn">
              Sign in
            </Link>
          )}
        </nav>
      </header>

      {message.text ? <div className={`message ${message.type}`}>{message.text}</div> : null}
      <main>{children}</main>
    </div>
  );
}
