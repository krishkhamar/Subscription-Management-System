import { useState, useEffect } from 'react';
import { getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiPackage, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

const emptyForm = { productName: '', productType: 'service', salesPrice: '', costPrice: '', variants: [] };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await getProductsAPI();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      productName: product.productName,
      productType: product.productType || 'service',
      salesPrice: product.salesPrice,
      costPrice: product.costPrice || '',
      variants: product.variants || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProductAPI(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { attribute: '', value: '', extraPrice: 0 }] });
  };
  const handleVariantChange = (index, field, value) => {
    const v = [...formData.variants];
    v[index][field] = value;
    setFormData({ ...formData, variants: v });
  };
  const handleRemoveVariant = (index) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, salesPrice: Number(formData.salesPrice), costPrice: Number(formData.costPrice) };
    try {
      if (editingId) {
        await updateProductAPI(editingId, payload);
        toast.success('Product updated!');
      } else {
        await createProductAPI(payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      setFormData({ ...emptyForm });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Service Catalog</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Product</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {products.map((product) => (
          <div key={product._id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{product.productName}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{product.productType}</p>
              </div>
              <FiPackage size={20} color="var(--primary)" />
            </div>

            {product.variants?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {product.variants.map((v, i) => (
                  <span key={i} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                    {v.attribute}: {v.value} (+₹{v.extraPrice})
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{product.salesPrice?.toFixed(2)}</span>
                {product.costPrice > 0 && <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cost: ₹{product.costPrice?.toFixed(2)}</span>}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => openEdit(product)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)' }} title="Edit"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(product._id)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Delete"><FiTrash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} placeholder="e.g. Premium Support" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Product Type</label>
                <select value={formData.productType} onChange={(e) => setFormData({...formData, productType: e.target.value})} required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }}>
                  <option value="service">Service</option>
                  <option value="consumable">Consumable</option>
                  <option value="storable">Storable</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Sales Price (₹)</label>
                  <input type="number" value={formData.salesPrice} onChange={(e) => setFormData({...formData, salesPrice: e.target.value})} placeholder="0.00" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label>Cost Price ($)</label>
                  <input type="number" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} placeholder="0.00" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Product Variants</h4>
                  <button type="button" onClick={handleAddVariant} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><FiPlus /> Add Variant</button>
                </div>
                {formData.variants.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input type="text" placeholder="Attr (Color)" value={v.attribute} onChange={(e) => handleVariantChange(i, 'attribute', e.target.value)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem' }} />
                    <input type="text" placeholder="Value (Red)" value={v.value} onChange={(e) => handleVariantChange(i, 'value', e.target.value)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem' }} />
                    <input type="number" placeholder="+$" value={v.extraPrice} onChange={(e) => handleVariantChange(i, 'extraPrice', Number(e.target.value))} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem' }} />
                    <button type="button" onClick={() => handleRemoveVariant(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiX /></button>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '1.5rem' }}>{editingId ? 'Update Product' : 'Save Product'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
