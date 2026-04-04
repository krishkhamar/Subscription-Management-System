import { useState, useEffect } from 'react';
import { getTaxesAPI, createTaxAPI, updateTaxAPI, deleteTaxAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiPercent, FiPlus, FiX, FiTrash2, FiShield, FiEdit2 } from 'react-icons/fi';

const Taxes = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    taxName: '',
    rate: '',
    type: 'percentage',
    description: ''
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      const { data } = await getTaxesAPI();
      setTaxes(data);
    } catch (error) {
      toast.error('Failed to load taxes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTaxAPI(editingId, formData);
        toast.success('Tax updated!');
      } else {
        await createTaxAPI(formData);
        toast.success('Tax created!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ taxName: '', rate: '', type: 'percentage', description: '' });
      fetchTaxes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create tax');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this tax rate?')) {
      try {
        await deleteTaxAPI(id);
        toast.success('Tax deleted');
        fetchTaxes();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Taxes...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Tax Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ taxName: '', rate: '', type: 'percentage', description: '' }); setShowModal(true); }}>
          <FiPlus /> Add Tax Rate
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {taxes.map(tax => (
          <div key={tax._id} className="card glass-panel" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tax.taxName}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{tax.type} Tax</p>
              </div>
              <button onClick={() => handleDelete(tax._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <FiTrash2 size={18} />
              </button>
              <button onClick={() => {
                setEditingId(tax._id);
                setFormData({ taxName: tax.taxName, rate: tax.rate, type: tax.type || 'percentage', description: tax.description || '' });
                setShowModal(true);
              }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                <FiEdit2 size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>{tax.rate}%</div>
              <div style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>RATE</div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{tax.description || 'No description provided.'}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingId ? 'Edit Tax Rate' : 'Add Tax Rate'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tax Name</label>
                <input type="text" value={formData.taxName} onChange={(e) => setFormData({...formData, taxName: e.target.value})} placeholder="e.g. GST 18%" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Rate</label>
                  <input type="number" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} placeholder="0" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
                <div className="form-group">
                  <label>Tax Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Optional details..." style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%', minHeight: '80px' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', marginTop: '1.5rem', fontSize: '1rem' }}>{editingId ? 'Update Tax' : 'Save Tax Rate'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Taxes;
