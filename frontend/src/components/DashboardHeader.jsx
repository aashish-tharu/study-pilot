import { useState } from 'react';

export default function DashboardHeader({
  user,
  workspaceCount,
  todayTaskCount,
  activeProgress,
  theme,
  onToggleTheme,
  onLogout,
  onChangePassword,
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  const fullName = user?.fullName || 'Study Pilot User';
  const userName = user?.username || 'study_pilot';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'SP';

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError('Please enter both passwords');
      return;
    }

    try {
      await onChangePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordForm({ oldPassword: '', newPassword: '' });
      setShowPasswordForm(false);
      setProfileMenuOpen(false);
    } catch (error) {
      setPasswordError(error.message);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="brand-group">
        <span className="brand-mark">✈</span>
        <span className="brand-name">Study-Pilot</span>
      </div>

      <div className="header-stats">
        <div className="stat-pill">
          <div className="stat-number">{workspaceCount}</div>
          <div className="stat-label">workspaces</div>
        </div>
        <div className="stat-pill">
          <div className="stat-number">{todayTaskCount}</div>
          <div className="stat-label">tasks today</div>
        </div>
        <div className="stat-pill highlight">
          <div className="stat-number">{activeProgress}%</div>
          <div className="stat-label">on track</div>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="profile-box-wrapper">
          <button type="button" className="profile-box" onClick={() => setProfileMenuOpen((open) => !open)}>
            <div className="profile-copy">
              <div className="profile-name">{fullName}</div>
              <div className="profile-handle">@{userName}</div>
            </div>
            <div className="profile-avatar">{initials}</div>
          </button>

          {profileMenuOpen && (
            <div className="profile-popover">
              <div className="profile-card">
                <div className="profile-card-avatar">{initials}</div>
                <div className="profile-card-name">{fullName}</div>
                <div className="profile-card-email">{user?.email || 'user@example.com'}</div>
              </div>

              <button type="button" className="profile-option" onClick={() => setShowPasswordForm((prev) => !prev)}>
                <span className="profile-option-icon">🔒</span>
                <span>Passwords and autofill</span>
              </button>

              {showPasswordForm && (
                <form className="password-form" onSubmit={handlePasswordSubmit}>
                  {passwordError && <div className="error-message">{passwordError}</div>}
                  <input
                    type="password"
                    placeholder="Current password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="form-input"
                  />
                  <button type="submit" className="primary-btn dark">Update password</button>
                </form>
              )}

              <button type="button" className="profile-option logout-option" onClick={onLogout}>
                <span className="profile-option-icon">↩</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}