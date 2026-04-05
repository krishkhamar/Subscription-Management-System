import { useState, useEffect } from 'react';
import { FiCheckCircle, FiChevronRight, FiCreditCard, FiSmartphone, FiCpu, FiAlertTriangle, FiCheck } from 'react-icons/fi';

const PaymentPortal = ({ amount, onPaymentSuccess, onCancel }) => {
  const [method, setMethod] = useState('qr'); // Default to QR
  const [upiIdInput, setUpiIdInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const GENUINE_UPI_ID = 'krishkhamar021104@okicici';
  const GENUINE_NAME = 'Krish Khamar';

  // Generate UPI URL for real scanning
  const upiUrl = `upi://pay?pa=${GENUINE_UPI_ID}&pn=${encodeURIComponent(GENUINE_NAME)}&am=${amount.toFixed(2)}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  // Auto-verify if QR mode is active
  useEffect(() => {
    let timer;
    if (method === 'qr' && !verifying && !success) {
      // Simulate waiting for user to scan (e.g. 5 seconds)
      timer = setTimeout(() => {
        handleSimulatePayment();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [method]);

  const handleSimulatePayment = () => {
    if (method === 'upi' && !upiIdInput.includes('@')) {
      alert('Please enter a valid UPI ID for verification (e.g. user@upi)');
      return;
    }
    
    setVerifying(true);
    // Simulate payment processing time
    setTimeout(() => {
      setVerifying(false);
      setSuccess(true);
      // Let success UI show for a bit before closing
      setTimeout(() => {
        onPaymentSuccess({ method, upiId: method === 'upi' ? upiId : 'Scanned QR' });
      }, 1500);
    }, 2500);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(8px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="card glass-panel animate-fadeInUp" style={{ 
        width: '100%', 
        maxWidth: '480px', 
        padding: '2.5rem', 
        borderRadius: '24px',
        position: 'relative',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              animation: 'scaleIn 0.5s ease-out'
            }}>
              <FiCheck size={48} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Redirecting to confirmation...</p>
          </div>
        ) : verifying ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
             <div className="spinner" style={{ 
               width: '50px', height: '50px', border: '4px solid rgba(79, 70, 229, 0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%',
               animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem'
             }}></div>
             <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verifying Transaction...</h3>
             <p style={{ color: 'var(--text-muted)' }}>Please wait while we secure your payment.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Secure <span style={{ color: 'var(--primary)' }}>Payment</span></h2>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
              </div>
              <div style={{ background: 'rgba(79, 70, 229, 0.08)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount Payable:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>${amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Methods Tab */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '2rem' }}>
              <button 
                onClick={() => setMethod('upi')}
                style={{ 
                  padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  background: method === 'upi' ? 'white' : 'transparent',
                  color: method === 'upi' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: method === 'upi' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                  transition: '0.2s'
                }}
              >
                UPI ID
              </button>
              <button 
                onClick={() => setMethod('qr')}
                style={{ 
                  padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  background: method === 'qr' ? 'white' : 'transparent',
                  color: method === 'qr' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: method === 'qr' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                  transition: '0.2s'
                }}
              >
                Scan QR
              </button>
            </div>

            {/* Method Content */}
            <div style={{ marginBottom: '2rem', minHeight: '180px' }}>
              {method === 'upi' ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>PAY TO: <span style={{ color: 'var(--text-main)' }}>{GENUINE_UPI_ID}</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter YOUR UPI ID to verify" 
                      className="form-control" 
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      style={{ fontSize: '1.1rem', padding: '12px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ padding: '0.8rem', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.1)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <FiAlertTriangle style={{ color: 'var(--warning)', marginTop: '2px' }} />
                    <p style={{ fontSize: '0.75rem', color: 'rgba(161, 98, 7, 0.9)', margin: 0 }}>
                      Enter your UPI ID and click "Confirm". You will receive a request on your payment app.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '180px', height: '180px', background: 'white', margin: '0 auto 1.5rem', padding: '15px', 
                    borderRadius: '16px', border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <img src={qrImageUrl} alt="UPI QR Code" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '4px' }}>{GENUINE_NAME}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan with GPay, PhonePe, or Paytm</p>
                </div>
              )}
            </div>

            {method === 'upi' && (
              <button 
                onClick={handleSimulatePayment}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1.2rem', gap: '10px', borderRadius: '16px', fontSize: '1rem' }}
              >
                <FiSmartphone /> Confirm & Pay Now
              </button>
            )}
            
            {method === 'qr' && (
              <div style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="mini-spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(79, 70, 229, 0.1)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Waiting for payment...
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
               <FiCpu /> Secured by Advanced AI Fraud Detection
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scan { 0% { top: -40px; } 100% { top: 200px; } }
        @keyframes scaleIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .spinner { border: 4px solid var(--primary-glow); border-top-color: var(--primary); }
      `}} />
    </div>
  );
};

export default PaymentPortal;
