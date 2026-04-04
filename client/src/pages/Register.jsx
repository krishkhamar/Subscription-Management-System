import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerAPI({ ...formData, role: 'portal' });
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
              <FiUser size={16} color="var(--primary)" /> Full Name
            </label>
            <input 
              name="name"
              type="text" 
              placeholder="John Doe"
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={{ height: '48px', padding: '0 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: 'var(--text-main)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
              <FiMail size={16} color="var(--primary)" /> Email Address
            </label>
            <input 
              name="email"
              type="email" 
              placeholder="name@company.com"
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={{ height: '48px', padding: '0 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: 'var(--text-main)' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
              <FiLock size={16} color="var(--primary)" /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                name="password"
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={formData.password} 
                onChange={handleChange} 
                required 
                style={{ height: '48px', width: '100%', padding: '0 45px 0 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: 'var(--text-main)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
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
              boxShadow: '0 4px 20px rgba(79, 70, 229, 0.2)'
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
