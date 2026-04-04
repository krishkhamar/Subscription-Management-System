import { useState, useEffect } from 'react';
import { getProductsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiPackage, FiSearch, FiFilter } from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchProducts();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Products...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Products</h1>
        <button className="btn btn-primary">+ Add Product</button>
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
              <span className="badge badge-active">{product.status}</span>
              <button style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
