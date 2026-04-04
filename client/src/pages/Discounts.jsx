import { useState, useEffect } from 'react';
import { getDiscountsAPI, createDiscountAPI, updateDiscountAPI, deleteDiscountAPI, getProductsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiTag, FiPlus, FiX, FiTrash2, FiPercent, FiDollarSign, FiEdit2 } from 'react-icons/fi';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    discountName: '',
    type: 'percentage',
    value: '',
    minimumPurchase: 0,
    minimumQuantity: 1,
    startDate: '',
    endDate: '',
    limitUsage: '',
    appliesTo: 'products'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dRes, pRes] = await Promise.all([
        getDiscountsAPI(),
        getProductsAPI()
      ]);
      setDiscounts(dRes.data);
      setProducts(pRes.data);
    } catch (error) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDiscountAPI(editingId, formData);
        toast.success('Discount updated!');
      } else {
        await createDiscountAPI(formData);
        toast.success('Discount created!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        discountName: '',
        type: 'percentage',
        value: '',
        minimumPurchase: 0,
        minimumQuantity: 1,
        startDate: '',
        endDate: '',
        limitUsage: '',
        appliesTo: 'products'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create discount');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this discount rule?')) {
      try {
        await deleteDiscountAPI(id);
        toast.success('Discount deleted');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Discounts...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Discount Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ discountName: '', type: 'percentage', value: '', minimumPurchase: 0, minimumQuantity: 1, startDate: '', endDate: '', limitUsage: '', appliesTo: 'products' }); setShowModal(true); }}>
          <FiPlus /> Create Discount
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {discounts.map(disc => (
          <div key={disc._id} className="card glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{disc.discountName}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Type: {disc.type}</p>
              </div>
              <button onClick={() => handleDelete(disc._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <FiTrash2 size={18} />
              </button>
              <button onClick={() => {
                setEditingId(disc._id);
                setFormData({
                  discountName: disc.discountName, type: disc.type || 'percentage', value: disc.value,
                  minimumPurchase: disc.minimumPurchase || 0, minimumQuantity: disc.minimumQuantity || 1,
                  startDate: disc.startDate?.split('T')[0] || '', endDate: disc.endDate?.split('T')[0] || '',
                  limitUsage: disc.limitUsage || '', appliesTo: disc.appliesTo || 'products'
                });
                setShowModal(true);
              }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                <FiEdit2 size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                {disc.type === 'percentage' ? `${disc.value}%` : `$${disc.value}`}
              </div>
              <div style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>OFF</div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <p>• Min Purchase: <strong>${disc.minimumPurchase}</strong></p>
              <p>• Valid Until: <strong>{disc.endDate ? new Date(disc.endDate).toLocaleDateString() : 'Forever'}</strong></p>
              <p>• Applies to: <strong style={{ textTransform: 'capitalize' }}>{disc.appliesTo}</strong></p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingId ? 'Edit Discount' : 'New Discount Rule'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Discount Name</label>
                <input type="text" value={formData.discountName} onChange={(e) => setFormData({...formData, discountName: e.target.value})} placeholder="e.g. Early Bird Special" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Min Purchase ($)</label>
                  <input type="number" value={formData.minimumPurchase} onChange={(e) => setFormData({...formData, minimumPurchase: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
                <div className="form-group">
                  <label>Min Quantity</label>
                  <input type="number" value={formData.minimumQuantity} onChange={(e) => setFormData({...formData, minimumQuantity: e.target.value})} placeholder="1" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Applies To</label>
                  <select value={formData.appliesTo} onChange={(e) => setFormData({...formData, appliesTo: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }}>
                    <option value="products">Products</option>
                    <option value="subscriptions">Subscriptions</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Usage Limit (0 = unlimited)</label>
                  <input type="number" value={formData.limitUsage} onChange={(e) => setFormData({...formData, limitUsage: e.target.value})} placeholder="0" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', marginTop: '1.5rem', fontSize: '1rem' }}>{editingId ? 'Update Discount' : 'Save Discount Rule'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;
