import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createSubscriptionAPI, createRazorpayOrderAPI, verifyRazorpayPaymentAPI, getPaymentConfigAPI } from '../services/api';
import { FiLock, FiCreditCard, FiTruck, FiSmartphone, FiCpu, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import RazorpayMockModal from '../components/RazorpayMockModal';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zip: '',
    country: '',
    cardName: user?.name || '',
    cardNumber: '**** **** **** 4242', // Mocked
    expiry: '12/28',
    cvv: '123'
  });

  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [pendingOrder, setPendingOrder] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrder, setMockOrder] = useState(null);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (cart.length === 0) return <Navigate to="/cart" />;

  const handleInitializeOrder = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const orderLines = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.plan.price,
        amount: item.plan.price * item.quantity,
        taxes: (item.plan.price * item.quantity) * 0.15
      }));

      const payload = {
        customer: user._id,
        plan: cart[0].plan._id,
        startDate: new Date(),
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        orderLines,
        status: 'confirmed',
        paymentTerms: 'Immediate',
        paymentDone: false,
        metadata: {
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.zip}, ${formData.country}`
        }
      };

      const { data: subscription } = await createSubscriptionAPI(payload);
      setPendingOrder(subscription);

      // Fetch dynamic payment config (to get real Key ID from .env)
      const { data: config } = await getPaymentConfigAPI();

      // Create Razorpay Order
      const totalInINR = cartTotal * 1.15; // Amount is already in INR
      const { data: order } = await createRazorpayOrderAPI({ 
        amount: totalInINR, 
        currency: 'INR',
        receipt: subscription.subscriptionNumber 
      });

      const options = {
        key: config.razorpayKeyId, // Dynamic Key from Backend
        amount: order.amount,
        currency: order.currency,
        name: 'SMS Subscription',
        description: `Order ${subscription.subscriptionNumber}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            setProcessing(true);
            await verifyRazorpayPaymentAPI({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceId: subscription.invoiceId || subscription._id
            });
            
            toast.success('Payment Verified & Successful!');
            clearCart();
            navigate('/order-confirmation', { state: { orderId: subscription.subscriptionNumber } });
          } catch (err) {
            toast.error('Payment verification failed!');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
          toast.error(`Payment failed: ${response.error.description}`);
      });

      if (order.isMock) {
        setMockOrder(order);
        setShowMockModal(true);
      } else {
        rzp.open();
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Order initialization failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleMockPaymentSuccess = async (response) => {
    try {
        setProcessing(true);
        await verifyRazorpayPaymentAPI({
          ...response,
          invoiceId: pendingOrder.invoiceId || pendingOrder._id
        });
        
        toast.success('Genuine Mock Payment Verified!');
        clearCart();
        setShowMockModal(false);
        navigate('/order-confirmation', { state: { orderId: pendingOrder.subscriptionNumber } });
    } catch (err) {
        toast.error('Verification failed');
    } finally {
        setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem' }}>Checkout</h1>

      {showMockModal && (
        <RazorpayMockModal 
            order={mockOrder} 
            user={user} 
            onPaymentSuccess={handleMockPaymentSuccess} 
            onCancel={() => setShowMockModal(false)} 
        />
      )}

      <form onSubmit={handleInitializeOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'flex-start' }}>
        
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Shipping Information */}
          <section className="card glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              <FiTruck size={20} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Shipping Details</h2>
            </div>
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              <div className="form-group">
                <label>Street Address</label>
                <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-control" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input type="text" className="form-control" required value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" className="form-control" required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Information */}
          <section className="card glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
                <FiCreditCard size={20} />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Payment Method</h2>
              </div>
              
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{ 
                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    background: paymentMethod === 'card' ? 'white' : 'transparent',
                    boxShadow: paymentMethod === 'card' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                >
                  Card
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{ 
                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    background: paymentMethod === 'upi' ? 'white' : 'transparent',
                    boxShadow: paymentMethod === 'upi' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                >
                  UPI / QR
                </button>
              </div>
            </div>

            {paymentMethod === 'card' ? (
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                 <div className="form-group">
                    <label>Name on Card</label>
                    <input type="text" className="form-control" required value={formData.cardName} onChange={(e) => setFormData({...formData, cardName: e.target.value})} />
                 </div>
                 <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" className="form-control" required value={formData.cardNumber} readOnly style={{ background: 'rgba(0,0,0,0.05)' }} />
                    <small style={{ color: 'var(--text-muted)' }}>Demo Mode: Secure payment processing enabled.</small>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" className="form-control" placeholder="MM/YY" required value={formData.expiry} readOnly />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="text" className="form-control" placeholder="123" required value={formData.cvv} readOnly />
                    </div>
                 </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
                <FiSmartphone size={40} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Genuine UPI Payment</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  You will be presented with a scanable QR code to pay <strong>Krish Khamar</strong> directly via any UPI app.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Order Summary Sticky Card */}
        <div className="card glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Your Order</h2>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '5px' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x {item.product.productName}</span>
                <span style={{ fontWeight: 600 }}>₹{(item.plan.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax (15%)</span>
                <span>₹{(cartTotal * 0.15).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{(cartTotal * 1.15).toFixed(2)}</span>
              </div>
          </div>

          <button 
            type="submit" 
            disabled={processing}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
          >
            {processing ? 'Processing...' : (
              paymentMethod === 'card' ? 'Place Secure Order' : 'Pay with UPI / QR'
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <FiLock /> SSL Secured Checkout
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
