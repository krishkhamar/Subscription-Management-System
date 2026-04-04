import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMeAPI } from '../services/api';
import API from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiShield, FiCalendar, FiLock, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [showPwModal, setShowPwModal] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMeAPI();
        setProfile(data);
      } catch (error) {
        // fallback to stored user
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 9) {
      toast.error('Password must be more than 8 characters');
      return;
    }
    setPwLoading(true);
    try {
      // Verify current password by trying to login
      await API.post('/auth/login', { email: user.email, password: pwForm.currentPassword });
      // Use forgot-password flow to update (since there's no dedicated change-password endpoint)
      // Instead, we'll update via the user update endpoint
      await API.put(`/users/${user._id}`, { password: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setShowPwModal(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setPwLoading(false);
    }
  };

  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Loading...';

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
              <FiCalendar color="var(--primary)" /> {memberSince}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Account Security</h3>
          <button 
            className="btn" 
            onClick={() => setShowPwModal(true)}
            style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--text-main)', padding: '10px 20px' }}
          >
            <FiLock style={{ marginRight: '6px' }} /> Change Password
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Change Password</h3>
              <button onClick={() => setShowPwModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type={showPw ? 'text' : 'password'} 
                    value={pwForm.currentPassword} 
                    onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} 
                    required 
                    style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%', padding: '10px 40px 10px 40px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>New Password</label>
                <input 
                  type={showPw ? 'text' : 'password'} 
                  value={pwForm.newPassword} 
                  onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} 
                  required 
                  placeholder="Min 9 chars, upper, lower, special"
                  style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>Confirm New Password</label>
                <input 
                  type={showPw ? 'text' : 'password'} 
                  value={pwForm.confirmPassword} 
                  onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} 
                />
              </div>

              <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
