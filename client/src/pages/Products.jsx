import { useState, useEffect } from 'react';
import { getProductsAPI, createProductAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiPackage, FiPlus, FiX } from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    productName: '', 
    identifier: '', 
    description: '',
    salesPrice: '',
    productType: 'service', // Backend requires this
    costPrice: 0 // Optional for now
  });

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createProductAPI(formData);
      toast.success('Product created successfully!');
      setShowModal(false);
      setFormData({ productName: '', identifier: '', description: '', salesPrice: '', productType: 'service', costPrice: 0 });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Products</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Product
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div key={product._id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiPackage size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700 }}>{product.productName}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.identifier}</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flex: 1 }}>{product.description || 'No description available.'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <div>
                <span className="badge badge-active">{product.status}</span>
                <span style={{ marginLeft: '10px', fontWeight: 700, color: 'var(--primary)' }}>${product.salesPrice?.toFixed(2)}</span>
              </div>
              <button style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>Manage</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Add New Product</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} placeholder="e.g. Premium Support" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }} />
              </div>
              <div className="form-group">
                <label>Identifier (Code)</label>
                <input type="text" value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})} placeholder="e.g. SUP-PREM" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief service details..." style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', minHeight: '80px', width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" value={formData.salesPrice} onChange={(e) => setFormData({...formData, salesPrice: e.target.value})} placeholder="0.00" required style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', width: '100%' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '1rem' }}>Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
