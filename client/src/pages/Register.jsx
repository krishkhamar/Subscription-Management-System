import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'portal' // Default role for portal users
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerAPI(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '3rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Get Started
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Create your free subscription account</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser size={14} /> Full Name
            </label>
            <input 
              name="name"
              type="text" 
              placeholder="John Doe"
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMail size={14} /> Email Address
            </label>
            <input 
              name="email"
              type="email" 
              placeholder="name@company.com"
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLock size={14} /> Role (Demo Only)
            </label>
            <select 
              name="role"
              value={formData.role} 
              onChange={handleChange}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white' }}
            >
              <option value="portal">Portal User (Customer)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '1rem', 
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            {loading ? 'Creating Account...' : (
              <>
                Create Account <FiArrowRight style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
