import { useState, useEffect } from 'react';
import { getSubscriptionsAPI, getInvoicesAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiFileText, FiEye, FiSettings, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Account = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, invRes] = await Promise.all([
        getSubscriptionsAPI(),
        getInvoicesAPI()
      ]);
      setSubscriptions(subRes.data);
      setInvoices(invRes.data);
    } catch (error) {
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading your account...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your subscriptions and billing history.</p>
        </div>
        <Link to="/profile" className="btn btn-secondary" style={{ gap: '8px' }}>
          <FiSettings /> Profile Settings
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
        
        {/* Active Subscriptions Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <FiBriefcase size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Active Subscriptions</h2>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {subscriptions.length === 0 ? (
              <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active subscriptions yet.
              </div>
            ) : subscriptions.map((sub) => (
              <div key={sub._id} className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{sub.subscriptionNumber}</h3>
                    <span className={`badge badge-${sub.status}`} style={{ fontSize: '0.65rem' }}>{sub.status}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    {sub.plan?.planName} • Billed {sub.plan?.billingPeriod}
                  </p>
                </div>
                <Link to={`/subscriptions/${sub._id}`} className="btn" style={{ padding: '10px', color: 'var(--primary)' }}>
                  <FiEye size={20} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Invoice History Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <FiFileText size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Invoice History</h2>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {invoices.length === 0 ? (
              <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No invoices found.
              </div>
            ) : invoices.map((inv) => (
              <div key={inv._id} className="card glass-panel" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px', 
                    background: inv.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', 
                    color: inv.status === 'paid' ? 'var(--success)' : 'var(--warning)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {inv.status === 'paid' ? <FiCheckCircle /> : <FiClock />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{inv.invoiceNumber}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      ${inv.totalAmount?.toFixed(2)} • {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link to={`/invoices/${inv._id}`} className="btn" style={{ padding: '10px', color: 'var(--primary)' }}>
                  <FiEye size={20} />
                </Link>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Account;
