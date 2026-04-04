import { useState, useEffect } from 'react';
import { getTemplatesAPI, createTemplateAPI, updateTemplateAPI, deleteTemplateAPI, getProductsAPI, getPlansAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCopy, FiPlus, FiX, FiTrash2, FiLayers, FiEdit2 } from 'react-icons/fi';

const Quotations = () => {
  const [templates, setTemplates] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    templateName: '',
    validityDays: 30,
    recurringPlan: '',
    productLines: [{ product: '', quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, pRes, plRes] = await Promise.all([
        getTemplatesAPI(),
        getProductsAPI(),
        getPlansAPI()
      ]);
      setTemplates(tRes.data);
      setProducts(pRes.data);
      setPlans(plRes.data);
    } catch (error) {
      toast.error('Failed to load quotation data');
    } finally {
      setLoading(false);
    }
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.productLines];
    newLines[index][field] = value;
    
    // Auto-fill price if product is selected
    if (field === 'product') {
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) newLines[index].unitPrice = selectedProd.salesPrice;
    }
    
    setFormData({ ...formData, productLines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      productLines: [...formData.productLines, { product: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeLine = (index) => {
    if (formData.productLines.length > 1) {
      const newLines = formData.productLines.filter((_, i) => i !== index);
      setFormData({ ...formData, productLines: newLines });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTemplateAPI(editingId, formData);
        toast.success('Template updated!');
      } else {
        await createTemplateAPI(formData);
        toast.success('Template created!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ templateName: '', validityDays: 30, recurringPlan: '', productLines: [{ product: '', quantity: 1, unitPrice: 0 }] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create template');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this template?')) {
      try {
        await deleteTemplateAPI(id);
        toast.success('Template deleted');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Quotations...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Quotation Templates</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ templateName: '', validityDays: 30, recurringPlan: '', productLines: [{ product: '', quantity: 1, unitPrice: 0 }] }); setShowModal(true); }}>
          <FiPlus /> New Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {templates.map(tmp => (
          <div key={tmp._id} className="card glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{tmp.templateName}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Valid for {tmp.validityDays} days</p>
              </div>
              <button onClick={() => handleDelete(tmp._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <FiTrash2 size={18} />
              </button>
              <button onClick={() => {
                setEditingId(tmp._id);
                setFormData({
                  templateName: tmp.templateName,
                  validityDays: tmp.validityDays,
                  recurringPlan: tmp.recurringPlan?._id || tmp.recurringPlan || '',
                  productLines: tmp.productLines?.map(l => ({ product: l.product?._id || l.product || '', quantity: l.quantity, unitPrice: l.unitPrice })) || [{ product: '', quantity: 1, unitPrice: 0 }]
                });
                setShowModal(true);
              }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                <FiEdit2 size={18} />
              </button>
            </div>
            
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '10px 15px', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>RECURRING PLAN</p>
              <p style={{ fontWeight: 600 }}>{tmp.recurringPlan?.planName}</p>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', pt: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>ITEMS</p>
              {tmp.productLines?.map((line, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                  <span>{line.product?.productName} x{line.quantity}</span>
                  <span style={{ fontWeight: 700 }}>${(line.unitPrice * line.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingId ? 'Edit Template' : 'Create Template'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Template Name</label>
                  <input type="text" value={formData.templateName} onChange={(e) => setFormData({...formData, templateName: e.target.value})} placeholder="e.g. Standard SaaS Monthly" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
                <div className="form-group">
                  <label>Validity (Days)</label>
                  <input type="number" value={formData.validityDays} onChange={(e) => setFormData({...formData, validityDays: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Recurring Plan</label>
                <select value={formData.recurringPlan} onChange={(e) => setFormData({...formData, recurringPlan: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', width: '100%' }}>
                  <option value="">Select Plan...</option>
                  {plans.map(p => <option key={p._id} value={p._id}>{p.planName}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ fontWeight: 700 }}>Product Lines</h4>
                <button type="button" onClick={addLine} style={{ color: 'var(--primary)', border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiPlus /> Add Line
                </button>
              </div>

              {formData.productLines.map((line, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Product</label>
                    <select value={line.product} onChange={(e) => handleLineChange(index, 'product', e.target.value)} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                      <option value="">Select...</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.productName}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Qty</label>
                    <input type="number" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', e.target.value)} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Unit Price</label>
                    <input type="number" value={line.unitPrice} onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }} />
                  </div>
                  <button type="button" onClick={() => removeLine(index)} style={{ padding: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiX /></button>
                </div>
              ))}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', marginTop: '2rem', fontSize: '1rem' }}>{editingId ? 'Update Template' : 'Create Template'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;
