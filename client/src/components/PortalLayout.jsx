import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiPackage, FiHome } from 'react-icons/fi';

const PortalLayout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="portal-container" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Top Navigation */}
      <header className="portal-header card glass-panel" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        padding: '0.8rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderRadius: '0 0 20px 20px',
        margin: '0 auto',
        maxWidth: '1400px',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/shop" style={{ textDecoration: 'none' }}>
            <h2 style={{ 
              fontSize: '1.4rem', 
              fontWeight: 800, 
              background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              STOREFRONT
            </h2>
          </Link>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/shop" className="portal-nav-link" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiPackage size={16} /> Shop
            </Link>
            <Link to="/dashboard" className="portal-nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiHome size={16} /> Dashboard
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
            <div className="cart-icon" style={{ color: 'var(--text-main)', padding: '8px' }}>
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-2px', 
                  right: '-2px', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  fontSize: '0.65rem', 
                  padding: '2px 6px', 
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--danger)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px'
            }}
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }}>
        <Outlet />
      </main>

      <footer style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.9rem' }}>© 2026 Subscription Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PortalLayout;
