import { useState, useEffect } from 'react';
import { 
  getSubscriptionsAPI, 
  updateSubscriptionStatusAPI, 
  deleteSubscriptionAPI
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiEye, FiCheckCircle, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Subscriptions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const subRes = await getSubscriptionsAPI();
      setSubscriptions(subRes?.data || []);
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateSubscriptionStatusAPI(id, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await deleteSubscriptionAPI(id);
        toast.success('Subscription deleted');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Subscriptions...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Subscriptions</h1>
        <button className="btn btn-primary" onClick={() => navigate('/subscriptions/new')}>
          <FiPlus /> New Subscription
        </button>
      </div>

      <div className="card glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(241, 245, 249, 0.5)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>SUB #</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Plan</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Total</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No subscriptions found.
                </td>
              </tr>
            ) : subscriptions.map((sub) => (
              <tr key={sub._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }}>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>{sub.subscriptionNumber}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ fontWeight: 500 }}>{sub.customer?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.customer?.email}</div>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>{sub.plan?.planName}</td>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700 }}>₹{sub.totalAmount?.toFixed(2)}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span className={`badge badge-${sub.status}`}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn" style={{ padding: '0.4rem', color: 'var(--primary)' }} onClick={() => navigate(`/subscriptions/${sub._id}`)}>
                      <FiEye size={18} />
                    </button>
                    {user?.role !== 'portal' && sub.status === 'draft' && (
                      <button className="btn" style={{ padding: '0.4rem', color: 'initial' }} onClick={() => navigate(`/subscriptions/${sub._id}`)}>
                        <FiEdit2 size={18} />
                      </button>
                    )}
                    {user?.role !== 'portal' && (
                      <>
                        {sub.status === 'confirmed' && (
                          <button 
                            className="btn"
                            style={{ padding: '0.4rem', color: 'var(--success)' }} 
                            title="Activate"
                            onClick={() => handleStatusUpdate(sub._id, 'active')}
                          >
                            <FiCheckCircle size={18} />
                          </button>
                        )}
                        {(sub.status === 'draft' || sub.status === 'quotation') && (
                          <button 
                            className="btn"
                            style={{ padding: '0.4rem', color: 'var(--primary)' }} 
                            title="Process"
                            onClick={() => handleStatusUpdate(sub._id, sub.status === 'draft' ? 'quotation' : 'confirmed')}
                          >
                            <FiCheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          className="btn"
                          onClick={() => handleDelete(sub._id)}
                          style={{ padding: '0.4rem', color: '#ef4444' }} 
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </>
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
