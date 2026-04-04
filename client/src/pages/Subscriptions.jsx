import { useState, useEffect } from 'react';
import { 
  getSubscriptionsAPI, 
  updateSubscriptionStatusAPI, 
  createSubscriptionAPI, 
  updateSubscriptionAPI,
  deleteSubscriptionAPI,
  getUsersAPI, 
  getProductsAPI, 
  getPlansAPI, 
  getTemplatesAPI 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiEye, FiCheckCircle, FiPlus, FiX, FiTrash2, FiFileText, FiUser, FiEdit2 } from 'react-icons/fi';

const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    customer: '',
    plan: '',
    startDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    paymentTerms: 'Immediate',
    orderLines: [{ product: '', quantity: 1, unitPrice: 0, taxes: 0, amount: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Portal users don't need to fetch the full users list or templates (for creation)
      const dataPromises = [
        getSubscriptionsAPI(),
        getProductsAPI(),
        getPlansAPI()
      ];

      if (user?.role !== 'portal') {
        dataPromises.push(getUsersAPI());
        dataPromises.push(getTemplatesAPI());
      }

      const [subRes, prodRes, planRes, userRes, tempRes] = await Promise.all(dataPromises);
      
      setSubscriptions(subRes?.data || []);
      setProducts(prodRes?.data || []);
      setPlans(planRes?.data || []);

      if (user?.role !== 'portal') {
        const fetchedUsers = userRes?.data || [];
        const portalUsers = fetchedUsers.filter(u => u.role?.toLowerCase() === 'portal');
        setCustomers(portalUsers.length > 0 ? portalUsers : fetchedUsers);
        setTemplates(tempRes?.data || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    if (!template) return;

    const newLines = template.productLines.map(line => ({
      product: line.product?._id || line.product,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxes: 0,
      amount: line.quantity * line.unitPrice
    }));

    setFormData({
      ...formData,
      plan: template.recurringPlan?._id || template.recurringPlan,
      orderLines: newLines
    });
    toast.info(`Applied template: ${template.templateName}`);
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.orderLines];
    newLines[index][field] = value;

    const currentLine = newLines[index];
    const prod = products.find(p => p._id === currentLine.product);
    
    if (prod) {
      let price = Number(prod.salesPrice) || 0;
      if (currentLine.variant) {
        const variant = prod.variants?.find(v => v._id === currentLine.variant);
        if (variant) price += Number(variant.extraPrice) || 0;
      }
      newLines[index].unitPrice = price;
    }

    newLines[index].amount = newLines[index].quantity * newLines[index].unitPrice;
    setFormData({ ...formData, orderLines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      orderLines: [...formData.orderLines, { product: '', quantity: 1, unitPrice: 0, taxes: 0, amount: 0 }]
    });
  };

  const removeLine = (index) => {
    if (formData.orderLines.length > 1) {
      setFormData({
        ...formData,
        orderLines: formData.orderLines.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.expirationDate) {
      toast.error('Please set an expiration date');
      return;
    }
    try {
      const submissionData = { ...formData };
      if (user?.role === 'portal') {
        submissionData.customer = user._id;
      }
      if (editingId) {
        await updateSubscriptionAPI(editingId, submissionData);
        toast.success('Subscription updated!');
      } else {
        await createSubscriptionAPI(submissionData);
        toast.success('Subscription created!');
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      plan: '',
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      paymentTerms: 'Immediate',
      orderLines: [{ product: '', quantity: 1, unitPrice: 0, taxes: 0, amount: 0 }]
    });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateSubscriptionStatusAPI(id, { status: newStatus });
      toast.success(`Subscription ${newStatus} successfully!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await deleteSubscriptionAPI(id);
      toast.success('Subscription deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete subscription');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Subscriptions...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Subscriptions</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}>
          <FiPlus /> New Subscription
        </button>
      </div>

      {/* Table view */}
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
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700 }}>${sub.totalAmount?.toFixed(2)}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span className={`badge badge-${sub.status}`}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="View">
                      <FiEye size={18} />
                    </button>
                    {user?.role !== 'portal' && sub.status === 'draft' && (
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} 
                        title="Edit"
                        onClick={() => {
                          setEditingId(sub._id);
                          setFormData({
                            customer: sub.customer?._id || '',
                            plan: sub.plan?._id || '',
                            startDate: sub.startDate?.split('T')[0] || '',
                            expirationDate: sub.expirationDate?.split('T')[0] || '',
                            paymentTerms: sub.paymentTerms || 'Immediate',
                            orderLines: sub.orderLines?.map(l => ({
                              product: l.product?._id || l.product || '',
                              quantity: l.quantity,
                              unitPrice: l.unitPrice,
                              taxes: l.taxes || 0,
                              amount: l.amount || l.quantity * l.unitPrice
                            })) || [{ product: '', quantity: 1, unitPrice: 0, taxes: 0, amount: 0 }]
                          });
                          setShowModal(true);
                        }}
                      >
                        <FiEdit2 size={18} />
                      </button>
                    )}
                    {user?.role !== 'portal' && (
                      <>
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
                            title="Process"
                            onClick={() => handleStatusUpdate(sub._id, sub.status === 'draft' ? 'quotation' : 'confirmed')}
                          >
                            <FiCheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(sub._id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} 
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingId ? 'Edit Subscription' : 'New Subscription'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Template Quick Selection */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px dashed var(--primary)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)' }}>
                  <FiFileText /> Quick Fill from Template
                </label>
                <select onChange={(e) => applyTemplate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', width: '100%' }}>
                  <option value="">Select a template...</option>
                  {templates.map(t => <option key={t._id} value={t._id}>{t.templateName}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {user?.role !== 'portal' && (
                  <div className="form-group">
                    <label>Customer</label>
                    <select value={formData.customer} onChange={(e) => setFormData({...formData, customer: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', width: '100%' }}>
                      <option value="">Select Portal User...</option>
                      {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Recurring Plan</label>
                  <select value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', width: '100%' }}>
                    <option value="">Select Plan...</option>
                    {plans.map(p => <option key={p._id} value={p._id}>{p.planName} (${p.price})</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input type="date" value={formData.expirationDate} onChange={(e) => setFormData({...formData, expirationDate: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ fontWeight: 700 }}>Order Lines</h4>
                <button type="button" onClick={addLine} style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Add Product</button>
              </div>

              {formData.orderLines.map((line, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '10px', marginBottom: '10px' }}>
                  <select value={line.product} onChange={(e) => handleLineChange(index, 'product', e.target.value)} required style={{ padding: '10px', borderRadius: '8px' }}>
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.productName}</option>)}
                  </select>
                  <select 
                    value={line.variant} 
                    onChange={(e) => handleLineChange(index, 'variant', e.target.value)} 
                    disabled={!line.product || !products.find(p => p._id === line.product)?.variants?.length}
                    style={{ padding: '10px', borderRadius: '8px' }}
                  >
                    <option value="">No Variant</option>
                    {products.find(p => p._id === line.product)?.variants?.map((v, i) => (
                      <option key={i} value={v._id}>{v.attribute}: {v.value} (+${v.extraPrice})</option>
                    ))}
                  </select>
                  <input type="number" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', Number(e.target.value))} placeholder="Qty" required style={{ padding: '10px', borderRadius: '8px' }} />
                  <input type="number" value={line.unitPrice} onChange={(e) => handleLineChange(index, 'unitPrice', Number(e.target.value))} placeholder="Price" required style={{ padding: '10px', borderRadius: '8px' }} />
                  <button type="button" onClick={() => removeLine(index)} style={{ color: '#ef4444', border: 'none', background: 'none' }}><FiTrash2 /></button>
                </div>
              ))}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', marginTop: '2rem' }}>{editingId ? 'Update Subscription' : 'Create Subscription'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
