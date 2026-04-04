import { useState, useEffect } from 'react';
import { getPlansAPI, createPlanAPI, updatePlanAPI, deletePlanAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

const emptyForm = {
  planName: '', price: '', billingPeriod: 'monthly', minimumQuantity: 1,
  startDate: new Date().toISOString().split('T')[0], endDate: '',
  autoClose: false, closable: true, pausable: false, renewable: true
};

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await getPlansAPI();
      setPlans(data);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, startDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan._id);
    setFormData({
      planName: plan.planName, price: plan.price, billingPeriod: plan.billingPeriod,
      minimumQuantity: plan.minimumQuantity, startDate: plan.startDate?.split('T')[0] || '',
      endDate: plan.endDate?.split('T')[0] || '', autoClose: plan.autoClose,
      closable: plan.closable, pausable: plan.pausable, renewable: plan.renewable
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deletePlanAPI(id);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePlanAPI(editingId, formData);
        toast.success('Plan updated!');
      } else {
        await createPlanAPI(formData);
        toast.success('Plan created!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Plans...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Recurring Plans</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Plan</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {plans.map(plan => (
          <div key={plan._id} className="card glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: 600 }}>
                <FiClock /> {plan.billingPeriod.toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {plan.pausable && <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Pausable</span>}
                {plan.renewable && <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>Renewable</span>}
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.planName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Min Qty: {plan.minimumQuantity} • Starts: {new Date(plan.startDate).toLocaleDateString()}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>${plan.price?.toFixed(2)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ period</span>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                 Auto-Close: {plan.autoClose ? 'Yes' : 'No'}
               </span>
               <div style={{ display: 'flex', gap: '6px' }}>
                 <button onClick={() => openEdit(plan)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }} title="Edit"><FiEdit2 size={14} /></button>
                 <button onClick={() => handleDelete(plan._id)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Delete"><FiTrash2 size={14} /></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingId ? 'Edit Plan' : 'Configure Recurring Plan'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Plan Name</label>
                  <input type="text" value={formData.planName} onChange={(e) => setFormData({...formData, planName: e.target.value})} placeholder="e.g. Monthly Standard" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
                <div className="form-group">
                  <label>Base Price ($)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Billing Period</label>
                  <select value={formData.billingPeriod} onChange={(e) => setFormData({...formData, billingPeriod: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Min Quantity</label>
                  <input type="number" value={formData.minimumQuantity} onChange={(e) => setFormData({...formData, minimumQuantity: e.target.value})} min="1" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label>End Date (Optional)</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}><input type="checkbox" checked={formData.autoClose} onChange={(e) => setFormData({...formData, autoClose: e.target.checked})} /> Auto-Close</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}><input type="checkbox" checked={formData.closable} onChange={(e) => setFormData({...formData, closable: e.target.checked})} /> Closable</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}><input type="checkbox" checked={formData.pausable} onChange={(e) => setFormData({...formData, pausable: e.target.checked})} /> Pausable</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}><input type="checkbox" checked={formData.renewable} onChange={(e) => setFormData({...formData, renewable: e.target.checked})} /> Renewable</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1rem', fontWeight: 600 }}>{editingId ? 'Update Plan' : 'Create Plan'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
