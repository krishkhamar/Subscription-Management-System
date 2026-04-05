import { useState, useEffect } from 'react';
import { getInvoicesAPI, createInvoiceAPI, getSubscriptionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiEye, FiPlus, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [createFormData, setCreateFormData] = useState({ subscriptionId: '', dueDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchInvoices();
    if (user?.role !== 'portal') {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await getSubscriptionsAPI();
      setSubscriptions(data.filter(s => s.status !== 'cancelled' && s.status !== 'closed'));
    } catch (err) {}
  };

  const fetchInvoices = async () => {
    try {
      const { data } = await getInvoicesAPI();
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createInvoiceAPI(createFormData);
      toast.success('Invoice created successfully!');
      setShowCreateModal(false);
      setCreateFormData({ subscriptionId: '', dueDate: new Date().toISOString().split('T')[0] });
      navigate(`/invoices/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Invoices...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Invoices & Billing</h1>
        {user?.role !== 'portal' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Invoice
          </button>
        )}
      </div>

      <div className="card glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(241, 245, 249, 0.5)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Invoice #</th>
              {user?.role !== 'portal' && <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Customer</th>}
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Due Date</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={user?.role !== 'portal' ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No invoices found.
                </td>
              </tr>
            ) : invoices.map((inv) => (
              <tr key={inv._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.2s' }}>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>{inv.invoiceNumber}</td>
                {user?.role !== 'portal' && (
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{inv.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.customer?.email}</div>
                  </td>
                )}
                <td style={{ padding: '1.2rem 1.5rem' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700 }}>₹{inv.totalAmount?.toFixed(2)}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span className={`badge badge-${inv.status}`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn" 
                      style={{ padding: '0.4rem', color: 'var(--primary)' }} 
                      onClick={() => navigate(`/invoices/${inv._id}`)}
                    >
                      <FiEye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Create Invoice Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Invoice</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Active Subscription</label>
                <select 
                  value={createFormData.subscriptionId} 
                  onChange={(e) => setCreateFormData({...createFormData, subscriptionId: e.target.value})}
                  required 
                  className="form-control"
                >
                  <option value="">Select a subscription to invoice...</option>
                  {subscriptions.map(s => (
                    <option key={s._id} value={s._id}>{s.subscriptionNumber} - {s.customer?.name}</option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>
                  This will generate an invoice directly from the selected subscription lines.
                </small>
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Due Date</label>
                <input 
                  type="date" 
                  value={createFormData.dueDate} 
                  onChange={(e) => setCreateFormData({...createFormData, dueDate: e.target.value})}
                  required 
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>
                Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;
