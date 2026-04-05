import { useState, useEffect } from 'react';
import { getProductsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await getProductsAPI();
      setProducts(data.filter(p => !p.isArchived));
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Shop...</div>;

  return (
    <div>
      {/* Hero Section */}
      <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>
          Premium <span style={{ color: 'var(--primary)' }}>Subscriptions</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Explore our range of digital services and managed solutions tailored for your business needs.
        </p>

        <div className="card glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '50px' }}>
          <FiSearch style={{ color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text" 
            placeholder="Search products or categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              padding: '0.8rem 0', 
              fontSize: '1rem', 
              color: 'var(--text-main)',
              outline: 'none'
            }} 
          />
        </div>
      </section>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No products found matching your search.</p>
          </div>
        ) : filteredProducts.map((product) => (
          <Link key={product._id} to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card glass-panel product-card" style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              transition: 'transform 0.3s ease, border-color 0.3s ease',
              cursor: 'pointer',
              overflow: 'hidden',
              padding: 0
            }}>
              {/* Product Visual Placeholder */}
              <div style={{ 
                height: '200px', 
                background: `linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(139, 92, 246, 0.1))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontSize: '3rem'
              }}>
                <FiTag />
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{product.productName}</h3>
                  <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                    {product.category || 'General'}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description || 'High-performance subscription plan with premium support and features.'}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Starting from</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{product.costPrice?.toFixed(2) || '0.00'}<small style={{ fontSize: '0.8rem' }}>/mo</small>
                  </span>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex' }}>
                    <FiArrowRight />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop;
