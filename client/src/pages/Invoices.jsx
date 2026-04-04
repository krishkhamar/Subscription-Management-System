import { useState, useEffect } from 'react';
import { getInvoicesAPI, updateInvoiceStatusAPI, createPaymentAPI, sendInvoiceAPI, printInvoiceAPI, createInvoiceAPI, getSubscriptionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiDollarSign, FiPrinter, FiEye, FiCheckCircle, FiPlus } from 'react-icons/fi';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [createFormData, setCreateFormData] = useState({ subscriptionId: '', dueDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchInvoices();
    if (user?.role !== 'portal') {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await getSubscriptionsAPI();
      setSubscriptions(data.filter(s => s.status !== 'cancelled' && s.status !== 'expired'));
    } catch (err) {}
  };

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

  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    try {
      await createPaymentAPI({
        invoice: selectedInvoice._id,
        amount: selectedInvoice.totalAmount,
        paymentMethod: paymentMethod,
        notes: `Customer self-payment via Portal`
      });
      toast.success('Payment successful!');
      setShowPaymentModal(false);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateInvoiceStatusAPI(id, { status: newStatus });
      toast.success(`Invoice ${newStatus} successfully!`);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleSend = async (id) => {
    try {
      toast.info('Sending invoice email...');
      await sendInvoiceAPI(id);
      toast.success('Invoice sent to customer!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invoice');
    }
  };

  const handlePrint = async (inv) => {
    try {
      const { data } = await printInvoiceAPI(inv._id);
      const printData = data.invoice;
      const rows = (printData.lines || []).map(l => {
        const name = l.product?.productName || 'Product';
        const qty = l.quantity;
        const price = '$' + (l.unitPrice?.toFixed(2) || '0.00');
        const tax = '$' + (l.taxAmount?.toFixed(2) || '0.00');
        const disc = '$' + (l.discountAmount?.toFixed(2) || '0.00');
        const total = '$' + (l.lineTotal?.toFixed(2) || '0.00');
        return '<tr><td>' + name + '</td><td>' + qty + '</td><td>' + price + '</td><td>' + tax + '</td><td>' + disc + '</td><td>' + total + '</td></tr>';
      }).join('');
      const tableBody = rows || '<tr><td colspan="6">No items</td></tr>';
      const printWindow = window.open('', '_blank');
      printWindow.document.write(
        '<html><head><title>Invoice ' + printData.invoiceNumber + '</title>' +
        '<style>body{font-family:Arial,sans-serif;padding:40px;color:#334155}h1{color:#4f46e5}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f8fafc;font-weight:600;font-size:.85rem;color:#64748b}.total-row{font-weight:700;font-size:1.1rem}@media print{body{padding:20px}}</style>' +
        '</head><body>' +
        '<h1>Invoice ' + printData.invoiceNumber + '</h1>' +
        '<p><strong>Customer:</strong> ' + (printData.customer?.name || 'N/A') + ' (' + (printData.customer?.email || '') + ')</p>' +
        '<p><strong>Due Date:</strong> ' + new Date(printData.dueDate).toLocaleDateString() + '</p>' +
        '<p><strong>Status:</strong> ' + printData.status + '</p>' +
        '<table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Discount</th><th>Total</th></tr></thead>' +
        '<tbody>' + tableBody + '</tbody></table><br/>' +
        '<p>Subtotal: <strong>$' + printData.subtotal?.toFixed(2) + '</strong></p>' +
        '<p>Tax: <strong>$' + printData.totalTax?.toFixed(2) + '</strong></p>' +
        '<p>Discount: <strong>-$' + printData.totalDiscount?.toFixed(2) + '</strong></p>' +
        '<p class="total-row">Total Amount: <strong>$' + printData.totalAmount?.toFixed(2) + '</strong></p>' +
        '<script>window.print();<\/script></body></html>'
      );
      printWindow.document.close();
    } catch (error) {
      toast.error('Failed to load print data');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await createInvoiceAPI(createFormData);
      toast.success('Invoice created successfully!');
      setShowCreateModal(false);
      setCreateFormData({ subscriptionId: '', dueDate: new Date().toISOString().split('T')[0] });
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Invoices...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Invoices & Billing</h1>
        {user?.role !== 'portal' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Invoice
          </button>
        )}
      </div>

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
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* View Action */}
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="View">
                      <FiEye size={18} />
                    </button>
                    
                    {/* Role Specific Actions */}
                    {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                      user?.role === 'portal' ? (
                        inv.status === 'confirmed' && (
                          <button 
                            onClick={() => handleOpenPaymentModal(inv)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <FiDollarSign size={14} /> Pay Now
                          </button>
                        )
                      ) : (
                        <>
                          {inv.status === 'draft' && (
                            <button 
                              onClick={() => handleUpdateStatus(inv._id, 'confirmed')}
                              className="btn btn-sm btn-success"
                              title="Confirm"
                            >
                              Confirm
                            </button>
                          )}
                          {inv.status === 'confirmed' && (
                            <button 
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="btn btn-sm"
                              style={{ background: 'var(--success)', color: 'white' }}
                              title="Record Payment"
                            >
                              Pay
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateStatus(inv._id, 'cancelled')}
                            className="btn btn-sm"
                            style={{ background: 'var(--danger)', color: 'white' }}
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </>
                      )
                    )}

                    {/* Universal Actions (Print/Send) */}
                    <button onClick={() => handleSend(inv._id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Send Email">
                      <FiPrinter size={18} style={{ transform: 'rotate(-45deg)' }} />
                    </button>
                    <button onClick={() => handlePrint(inv)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Print">
                      <FiPrinter size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Process Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Invoice</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--secondary)' }}>{selectedInvoice.invoiceNumber}</p>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Due</span>
                <span style={{ fontWeight: 800, fontSize: '1.3rem' }}>${selectedInvoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Payment Method</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
              >
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="btn" 
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleProcessPayment} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 700 }}
              >
                <FiDollarSign style={{ marginRight: '6px' }} /> Pay ${selectedInvoice.totalAmount?.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Invoice</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <form onSubmit={handleCreateInvoice}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Select Subscription</label>
                <select 
                  value={createFormData.subscriptionId} 
                  onChange={(e) => setCreateFormData({ ...createFormData, subscriptionId: e.target.value })} 
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                >
                  <option value="">-- Choose Subscription --</option>
                  {subscriptions.map(sub => (
                    <option key={sub._id} value={sub._id}>
                      {sub.subscriptionNumber} - {sub.customer?.name} ({sub.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Due Date</label>
                <input 
                  type="date"
                  value={createFormData.dueDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 700 }}>
                Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
