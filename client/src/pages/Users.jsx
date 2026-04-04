import { useState, useEffect } from 'react';
import { getUsersAPI, createInternalUserAPI, updateUserAPI, deleteUserAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiShield, FiMoreVertical, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'internal' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsersAPI();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users. Only Admins can access this.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'internal' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingId(user._id);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUserAPI(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData = { name: formData.name, email: formData.email };
        if (formData.password) updateData.password = formData.password;
        await updateUserAPI(editingId, updateData);
        toast.success('User updated!');
      } else {
        await createInternalUserAPI(formData);
        toast.success('User created!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', email: '', password: '', role: 'internal' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading User Directory...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>User Management</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Create Internal User
        </button>
      </div>

      <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>NAME</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ROLE</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiUser />
                    </div>
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-muted)' }}>{user.email}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '4px', 
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                    background: user.role === 'admin' ? '#f5f3ff' : user.role === 'internal' ? '#ecfdf5' : '#f1f5f9',
                    color: user.role === 'admin' ? '#7c3aed' : user.role === 'internal' ? '#059669' : '#475569',
                    border: user.role === 'admin' ? '1px solid #ddd6fe' : user.role === 'internal' ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                  }}>
                    <FiShield size={12} /> {user.role}
                  </span>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span className="badge badge-active">Active</span>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(user)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)' }} title="Edit">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(user._id)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Delete">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{editingId ? 'Edit User' : 'Create Internal User'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Password {editingId && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(leave blank to keep current)</span>}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingId} placeholder={editingId ? '••••••••' : ''} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
              </div>
              {!editingId && (
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }}>
                    <option value="internal">Staff (Internal)</option>
                  </select>
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>{editingId ? 'Update User' : 'Create User'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
