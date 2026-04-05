import { useState, useEffect } from 'react';
import { getPaymentsAPI } from '../services/api'; // Note: Assuming this exists or create a fetch logic
import { toast } from 'react-toastify';
import { FiCreditCard, FiHash, FiCheckCircle } from 'react-icons/fi';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await getPaymentsAPI();
        setPayments(data);
      } catch (error) {
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Payment History...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Payment Transactions</h1>
      
      <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>REFERENCE</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>INVOICE</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>DATE</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>METHOD</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AMOUNT</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(pay => (
              <tr key={pay._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiHash /> {pay.reference}
                  </div>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>{pay.invoice?.invoiceNumber}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>{new Date(pay.paymentDate).toLocaleDateString()}</td>
                <td style={{ padding: '1.2rem 1.5rem', textTransform: 'capitalize' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCreditCard size={14} /> {pay.paymentMethod?.replace('_', ' ')}
                  </div>
                </td>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700 }}>₹{pay.amount?.toFixed(2)}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span className="badge badge-active" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiCheckCircle size={12} /> Success
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
