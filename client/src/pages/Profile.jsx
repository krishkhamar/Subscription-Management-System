import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiShield, FiCalendar } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>My Profile</h1>
      
      <div className="card glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'var(--primary-glow)', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 700,
            border: '2px solid var(--primary)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{user?.name}</h2>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              background: '#f1f5f9', 
              color: '#475569', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              textTransform: 'capitalize',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FiShield size={14} /> {user?.role} Account
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>EMAIL ADDRESS</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
              <FiMail color="var(--primary)" /> {user?.email}
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>MEMBER SINCE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
              <FiCalendar color="var(--primary)" /> {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Account Security</h3>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--text-main)', padding: '10px 20px' }}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
