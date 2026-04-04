import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card glass-panel profile-header-card" style={{ padding: '8px 16px', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role} Account</p>
              </div>
            </div>
          </Link>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
