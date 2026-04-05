import { useLocation, Link, Navigate } from 'react-router-dom';
import { FiCheckCircle, FiPrinter, FiArrowRight, FiShoppingBag } from 'react-icons/fi';

const OrderConfirmation = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  if (!orderId) return <Navigate to="/shop" />;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
      
      <div className="card glass-panel" style={{ padding: '4rem 2rem', borderTop: '4px solid var(--success)' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(34, 197, 94, 0.1)', 
          color: 'var(--success)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <FiCheckCircle size={48} />
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Subscription Confirmed!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Your transaction was verified and your subscription is now active.
        </p>

        <div style={{ 
          background: 'rgba(0,0,0,0.03)', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          display: 'inline-block', 
          marginBottom: '3rem',
          border: '1px dashed var(--glass-border)'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>ORDER NUMBER</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px' }}>{orderId}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <button 
            onClick={handlePrint}
            className="btn btn-secondary" 
            style={{ padding: '0.8rem 1.5rem', gap: '10px' }}
          >
            <FiPrinter /> Print Receipt
          </button>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', gap: '10px' }}>
             Continue Shopping <FiArrowRight />
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link to="/account" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <FiShoppingBag /> Manage your subscriptions in Account Dashboard
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .portal-header, footer, .btn-primary, .btn-secondary, .cart-icon { display: none !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; }
        }
      `}} />
    </div>
  );
};

export default OrderConfirmation;
