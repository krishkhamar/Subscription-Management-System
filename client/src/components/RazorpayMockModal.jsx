import { useState, useEffect } from 'react';
import { FiX, FiShield, FiSmartphone, FiCreditCard, FiCheck } from 'react-icons/fi';

const RazorpayMockModal = ({ order, user, onPaymentSuccess, onCancel }) => {
  const [step, setStep] = useState('methods'); // methods, upi-wait, processing
  const [selectedMethod, setSelectedMethod] = useState(null);

  const GENUINE_VPA = 'krishkhamar021104@okicici';

  const handlePay = (method) => {
    setSelectedMethod(method);
    setStep('processing');
    
    // Simulate real verification loop
    setTimeout(() => {
        onPaymentSuccess({
            razorpay_order_id: order.id,
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
            razorpay_signature: `sig_mock_${Math.random().toString(36).substr(2, 9)}`,
            isMock: true
        });
    }, 2000);
  };

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 
    }}>
      <div className="animate-fadeInUp" style={{ 
        width: '100%', maxWidth: '400px', background: 'white', borderRadius: '12px', overflow: 'hidden', 
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', color: '#333' 
      }}>
        
        {/* Razorpay Header */}
        <div style={{ background: '#3399cc', padding: '1.2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, opacity: 0.9 }}>SMS SUBSCRIPTION</h4>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{(order.amount / 100).toFixed(2)}</div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
            <FiX size={20} />
          </button>
        </div>

        {step === 'processing' ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
             <div className="mini-spinner" style={{ 
               width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #3399cc', 
               borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' 
             }}></div>
             <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Verifying...</h3>
             <p style={{ fontSize: '0.85rem', color: '#666' }}>Securely completing your transaction with your bank.</p>
          </div>
        ) : (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#777', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.05em' }}>PAYMENT METHODS</div>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              
              {/* UPI Option */}
              <button 
                onClick={() => handlePay('upi')}
                style={{ 
                  width: '100%', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', 
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ color: '#3399cc' }}><FiSmartphone size={20} /></div>
                   <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>UPI</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>Google Pay, PhonePe, Paytm</div>
                   </div>
                </div>
                <div style={{ color: '#ccc' }}>&gt;</div>
              </button>

              {/* Card Option */}
              <button 
                onClick={() => handlePay('card')}
                style={{ 
                  width: '100%', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', 
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ color: '#3399cc' }}><FiCreditCard size={20} /></div>
                   <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cards</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>Visa, Mastercard, RuPay</div>
                   </div>
                </div>
                <div style={{ color: '#ccc' }}>&gt;</div>
              </button>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#999', fontSize: '0.75rem' }}>
                <FiShield size={14} /> 100% Secure Payments
                <span style={{ margin: '0 4px', color: '#eee' }}>|</span>
                Powered by SMS
            </div>
          </div>
        )}

        {/* Footer info */}
        <div style={{ background: '#f9f9f9', padding: '0.8rem', textAlign: 'center', fontSize: '0.7rem', color: '#aaa' }}>
            Krish Khamar: {GENUINE_VPA}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mini-spinner { border-radius: 50%; }
      `}} />
    </div>
  );
};

export default RazorpayMockModal;
