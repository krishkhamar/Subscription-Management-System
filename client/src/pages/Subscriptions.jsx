import { useState, useEffect } from 'react';
import { getSubscriptionsAPI, updateSubscriptionStatusAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await getSubscriptionsAPI();
      setSubscriptions(data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateSubscriptionStatusAPI(id, { status: newStatus });
      toast.success(`Subscription ${newStatus} successfully!`);
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Subscriptions...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Subscriptions</h1>
        <button className="btn btn-primary">+ New Subscription</button>
      </div>

      <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>NUMBER</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUSTOMER</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>PLAN</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AMOUNT</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No subscriptions found. Create your first one to get started!
                </td>
              </tr>
            ) : subscriptions.map((sub) => (
              <tr key={sub._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }} className="table-row-hover">
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>{sub.subscriptionNumber}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ fontWeight: 500 }}>{sub.customer?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.customer?.email}</div>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>{sub.plan?.planName}</td>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700 }}>${sub.totalAmount?.toFixed(2)}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span className={`badge badge-${sub.status}`}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="View Details">
                      <FiEye size={18} />
                    </button>
                    {sub.status === 'confirmed' && (
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }} 
                        title="Activate"
                        onClick={() => handleStatusUpdate(sub._id, 'active')}
                      >
                        <FiCheckCircle size={18} />
                      </button>
                    )}
                    {(sub.status === 'draft' || sub.status === 'quotation') && (
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} 
                        title="Confirm"
                        onClick={() => handleStatusUpdate(sub._id, sub.status === 'draft' ? 'quotation' : 'confirmed')}
                      >
                        <FiCheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
