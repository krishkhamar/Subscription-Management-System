// Placeholder - Person 2 & 3 will build the Dashboard
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user?.name || 'User'} ({user?.role})</span>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--primary)' }}>Products</h3>
          <p>Manage your products and variants</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--secondary)' }}>Subscriptions</h3>
          <p>View and manage subscriptions</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--success)' }}>Invoices</h3>
          <p>Track invoices and payments</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--warning)' }}>Reports</h3>
          <p>View analytics and reports</p>
        </div>
      </div>

      <p style={{ marginTop: '2rem', color: 'var(--gray-500)', textAlign: 'center' }}>
        🚧 Person 2: Build out the full dashboard with sidebar navigation, charts, and module pages.
      </p>
    </div>
  );
};

export default Dashboard;
