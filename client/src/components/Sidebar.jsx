import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiPackage, 
  FiCalendar, 
  FiBriefcase, 
  FiFileText, 
  FiCreditCard, 
  FiUser, 
  FiLogOut 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
    { name: 'Products', icon: <FiPackage />, path: '/products' },
    { name: 'Plans', icon: <FiCalendar />, path: '/plans' },
    { name: 'Subscriptions', icon: <FiBriefcase />, path: '/subscriptions' },
    { name: 'Invoices', icon: <FiFileText />, path: '/invoices' },
    { name: 'Payments', icon: <FiCreditCard />, path: '/payments' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'User Management', icon: <FiUser />, path: '/users' });
  }

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SUBSCRIPTION
        </h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>MANAGEMENT SYSTEM</p>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item) => (
            <li key={item.name} style={{ marginBottom: '0.5rem' }}>
              <NavLink 
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
                  transition: 'all 0.3s ease'
                })}
              >
                {item.icon}
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button 
        onClick={logout}
        className="btn"
        style={{ 
          marginTop: 'auto', 
          width: '100%', 
          justifyContent: 'flex-start',
          color: 'var(--danger)',
          background: 'rgba(244, 63, 94, 0.05)',
          border: '1px solid rgba(244, 63, 94, 0.1)'
        }}
      >
        <FiLogOut />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
