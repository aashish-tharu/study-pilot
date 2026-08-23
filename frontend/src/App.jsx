import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #020617, #0f172a 50%, #111827)',
      }}>
        <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
          <h2>Loading...</h2>
          <p>Checking your session</p>
        </div>
      </div>
    );
  }

  const authPage = ['/login', '/'].includes(location.pathname) && !user;
  const dashboardPage = location.pathname === '/dashboard' && user;

  const routes = (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );

  if (authPage || dashboardPage) {
    return routes;
  }

  return <Layout>{routes}</Layout>;
}

export default App;
