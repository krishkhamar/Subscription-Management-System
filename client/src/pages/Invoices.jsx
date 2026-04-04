import { getInvoicesAPI, updateInvoiceStatusAPI, createPaymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiDollarSign, FiPrinter, FiEye, FiCheckCircle } from 'react-icons/fi';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await getInvoicesAPI();
      setInvoices(data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoice) => {
    try {
      // Simulate real payment recording
      await createPaymentAPI({
        invoice: invoice._id,
        amount: invoice.totalAmount,
        paymentMethod: 'credit_card',
        reference: `PAY-${Math.floor(Math.random() * 1000000)}`
      });
      toast.success('Payment successful! Invoice status updated.');
      fetchInvoices();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Invoices...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Invoices & Billing</h1>

      <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>NUMBER</th>
              {user?.role !== 'portal' && <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUSTOMER</th>}
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>DUE DATE</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AMOUNT</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={user?.role !== 'portal' ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No invoices found.
                </td>
              </tr>
            ) : invoices.map((inv) => (
              <tr key={inv._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>{inv.invoiceNumber}</td>
                {user?.role !== 'portal' && (
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{inv.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.customer?.email}</div>
                  </td>
                )}
                <td style={{ padding: '1.2rem 1.5rem' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td style={{ padding: '1.2rem 1.5rem', fontWeight: 700 }}>${inv.totalAmount?.toFixed(2)}</td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <span className={`badge badge-${inv.status}`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '1.2rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="View">
                      <FiEye size={18} />
                    </button>
                    
                    {inv.status !== 'paid' && inv.status !== 'closed' && (
                      user?.role === 'portal' ? (
                        <button 
                          onClick={() => handlePayInvoice(inv)}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <FiDollarSign size={14} /> Pay Now
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePayInvoice(inv)}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--success)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <FiCheckCircle size={14} /> Record Payment
                        </button>
                      )
                    )}

                    {inv.status === 'paid' && (
                      <button style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }} title="Print Receipt">
                        <FiPrinter size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
