import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductAPI, getPlansAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { FiArrowLeft, FiShoppingCart, FiCheck, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [prodRes, plansRes] = await Promise.all([
        getProductAPI(id),
        getPlansAPI()
      ]);
      setProduct(prodRes.data);
      const allPlans = plansRes.data;
      setPlans(allPlans);
      
      // Default to a monthly plan if available, otherwise just the first one
      const defaultPlan = allPlans.find(p => p.billingPeriod === 'monthly') || allPlans[0];
      setSelectedPlan(defaultPlan);
    } catch (error) {
      toast.error('Failed to load product details');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedPlan) return;
    addToCart(product, selectedPlan, selectedPlan.billingPeriod);
    toast.success(`${product.productName} added to cart!`);
    navigate('/cart');
  };

  if (loading || !product) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading product details...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/shop')}
        className="btn"
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}
      >
        <FiArrowLeft /> Back to Shop
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
        
        {/* Visuals */}
        <div className="card glass-panel" style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(139, 92, 246, 0.05))' }}>
           <FiCalendar size={120} style={{ color: 'var(--primary)', opacity: 0.2 }} />
        </div>

        {/* Content */}
        <div>
          <span className="badge" style={{ marginBottom: '1rem' }}>{product.category || 'Subscription'}</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>{product.productName}</h1>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.8rem' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {product.description || 'Elevate your business capabilities with our premium subscription plans. Included are full access to high-priority features, dedicated security audits, and comprehensive managed support to ensure your operations run smooth 24/7.'}
            </p>
          </div>

          {/* Plan Selector */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.2rem' }}>Select Billing Interval</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {plans.map((plan) => (
                <div 
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`card ${selectedPlan?._id === plan._id ? 'glass-panel active-plan' : ''}`}
                  style={{ 
                    padding: '1.5rem', 
                    cursor: 'pointer', 
                    border: selectedPlan?._id === plan._id ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                    background: selectedPlan?._id === plan._id ? 'rgba(79, 70, 229, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      border: '2px solid var(--primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: selectedPlan?._id === plan._id ? 'var(--primary)' : 'transparent'
                    }}>
                      {selectedPlan?._id === plan._id && <FiCheck color="white" size={14} />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, textTransform: 'capitalize' }}>
                        {plan.planName}
                      </h4>
                      <small style={{ color: 'var(--text-muted)' }}>Billed {plan.billingPeriod}</small>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
                      ₹{plan.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', gap: '12px' }}
          >
            <FiShoppingCart /> Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
