import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <FiShoppingBag size={80} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '2rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
          Looks like you haven't added any subscriptions yet.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  const taxAmount = cartTotal * 0.15; // Mock 15% tax
  const totalAmount = cartTotal + taxAmount;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem' }}>Shopping <span style={{ color: 'var(--primary)' }}>Cart</span></h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', alignItems: 'flex-start' }}>
        
        {/* Cart Items List */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {cart.map((item) => (
            <div key={`${item.product._id}-${item.plan._id}`} className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {/* Product Visual */}
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '12px', 
                background: 'rgba(79, 70, 229, 0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <FiShoppingBag size={40} />
              </div>

              {/* Item Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{item.product.productName}</h3>
                  <button 
                    onClick={() => removeFromCart(item.product._id, item.plan._id)}
                    className="btn" 
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '5px' }}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Plan: <span style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{item.plan.planName} ({item.plan.billingPeriod})</span>
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '20px', padding: '4px 8px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={() => updateQuantity(item.product._id, item.plan._id, item.quantity - 1)}>
                      <FiMinus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={() => updateQuantity(item.product._id, item.plan._id, item.quantity + 1)}>
                      <FiPlus size={14} />
                    </button>
                  </div>

                  {/* Price */}
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{(item.plan.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}

          <Link to="/shop" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
            <FiPlus /> Add more products
          </Link>
        </div>

        {/* Order Summary */}
        <div className="card glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Summary</h2>
          
          <div style={{ display: 'grid', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Tax (15%)</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{taxAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{totalAmount.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', gap: '12px' }}>
            Checkout <FiArrowRight />
          </Link>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem' }}>
            By checking out, you agree to our Terms of Service and Privacy Policy. All payments are securely processed.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Cart;
