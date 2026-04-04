import { useState, useEffect } from 'react';
import { getPlansAPI, createPlanAPI, getProductsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiPlus, FiX, FiCheck } from 'react-icons/fi';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    planName: '',
    product: '',
    billingModel: 'recurring',
    billingPeriod: 1,
    periodUnit: 'month',
    totalAmount: '',
    invoiceType: 'system_generated'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, productsRes] = await Promise.all([getPlansAPI(), getProductsAPI()]);
      setPlans(plansRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await createPlanAPI(formData);
      toast.success('Plan created successfully!');
      setShowModal(false);
      setFormData({ planName: '', product: '', billingModel: 'recurring', billingPeriod: 1, periodUnit: 'month', totalAmount: '', invoiceType: 'system_generated' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Plans...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Recurring Plans</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Create Plan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {plans.map(plan => (
          <div key={plan._id} className="card glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: 600 }}>
                <FiClock /> {plan.billingModel === 'recurring' ? 'Recurring' : 'One-time'}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {plan.status}</span>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.planName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {plan.product?.productName} — Every {plan.billingPeriod} {plan.periodUnit}(s)
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>${plan.totalAmount?.toFixed(2)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ {plan.periodUnit}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>{plan.invoiceType}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Create Recurring Plan</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreatePlan}>
              <div className="form-group">
                <label>Plan Name</label>
                <input type="text" value={formData.planName} onChange={(e) => setFormData({...formData, planName: e.target.value})} placeholder="e.g. Monthly Standard" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }} />
              </div>
              
              <div className="form-group">
                <label>Linked Product</label>
                <select value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }}>
                  <option value="">Select Product...</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.productName}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Billing Period</label>
                  <input type="number" value={formData.billingPeriod} onChange={(e) => setFormData({...formData, billingPeriod: e.target.value})} min="1" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select value={formData.periodUnit} onChange={(e) => setFormData({...formData, periodUnit: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }}>
                    <option value="day">Day(s)</option>
                    <option value="month">Month(s)</option>
                    <option value="year">Year(s)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Amount (Price)</label>
                <input type="number" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} placeholder="0.00" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600 }}>Create Active Plan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
