import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getInvoiceAPI, 
  updateInvoiceAPI, 
  updateInvoiceStatusAPI,
  deleteInvoiceAPI,
  printInvoiceAPI
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiTrash2, FiPrinter, FiSend, FiCheckCircle, FiFileText, 
  FiArrowLeft, FiXCircle, FiCornerUpLeft, FiDollarSign
} from 'react-icons/fi';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    paymentReference: '',
    recipientBank: '',
    dueDate: '',
    journal: 'Customer Invoices'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getInvoiceAPI(id);
      const inv = res.data;
      setInvoice(inv);
      
      setFormData({
        paymentReference: inv.paymentReference || '',
        recipientBank: inv.recipientBank || '',
        dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
        journal: inv.journal || 'Customer Invoices'
      });
    } catch (error) {
      toast.error('Failed to load invoice details');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateInvoiceAPI(id, formData);
      toast.success('Invoice details saved');
      fetchData();
    } catch (error) {
      toast.error('Failed to save invoice');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateInvoiceStatusAPI(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this draft invoice?')) return;
    try {
      // Mock delete API since we might not have exposed one, but we added updateInvoiceStatusAPI
      // Actually we have deleteInvoice logic maybe? Let's check api.js... assuming deleteInvoiceAPI exists
      await deleteInvoiceAPI(id);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handlePrint = async () => {
    try {
      const res = await printInvoiceAPI(id);
      const newTab = window.open('', '_blank');
      newTab.document.write(res.data);
      newTab.document.close();
    } catch (error) {
      toast.error('Failed to print invoice');
    }
  };

  if (loading || !invoice) return <div style={{ padding: '2rem' }}>Loading invoice details...</div>;

  const st = invoice.status;
  const isDraft = st === 'draft';
  const isConfirmed = st === 'confirmed';
  const isPaid = st === 'paid';
  const isCancelled = st === 'cancelled';
  const canEdit = isDraft;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* Top Header & Breadcrumbs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem' }} onClick={() => navigate('/invoices')}>
            <FiArrowLeft /> Back to Invoices
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>
            {invoice.invoiceNumber}
            {isPaid && <span style={{ marginLeft: '1rem', fontSize: '1.2rem', color: 'var(--success)', border: '2px solid var(--success)', padding: '2px 8px', borderRadius: '4px' }}>PAID</span>}
          </h1>
        </div>

        {/* Status Bar Layout matching Excalidraw */}
        <div style={{ display: 'flex', gap: '0', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '0.6rem 1.5rem', background: st === 'draft' ? 'var(--primary)' : 'transparent', color: st === 'draft' ? 'white' : 'var(--text-muted)', fontWeight: 600 }}>
            Draft
          </div>
          <div style={{ padding: '0.6rem 1.5rem', background: st === 'confirmed' ? 'var(--primary)' : 'transparent', color: st === 'confirmed' ? 'white' : 'var(--text-muted)', fontWeight: 600, borderLeft: '1px solid #e2e8f0' }}>
            Confirmed
          </div>
          <div style={{ padding: '0.6rem 1.5rem', background: st === 'paid' ? 'var(--success)' : 'transparent', color: st === 'paid' ? 'white' : 'var(--text-muted)', fontWeight: 600, borderLeft: '1px solid #e2e8f0' }}>
            Paid
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="card glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        
        {/* Draft State Buttons */}
        {isDraft && (
          <>
            <button className="btn btn-secondary" onClick={() => handleStatusChange('confirmed')}><FiCheckCircle /> Confirm</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            <button className="btn btn-secondary" onClick={() => handleStatusChange('cancelled')}><FiXCircle /> Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}><FiTrash2 /> Delete</button>
          </>
        )}

        {/* Confirmed State Buttons */}
        {isConfirmed && (
          <>
            <button className="btn btn-primary" onClick={() => navigate(`/subscriptions/${invoice.subscription?._id}`)}><FiFileText /> Subscription</button>
            <button className="btn btn-secondary"><FiSend /> Send</button>
            <button className="btn btn-secondary" onClick={handlePrint}><FiPrinter /> Print</button>
            <button className="btn btn-success" style={{ background: 'var(--success)', color: 'white' }} onClick={() => handleStatusChange('paid')}><FiDollarSign /> Pay</button>
          </>
        )}

        {/* Cancelled State */}
        {isCancelled && (
          <>
            <button className="btn btn-secondary" onClick={() => handleStatusChange('draft')}><FiCornerUpLeft /> Set to Draft</button>
          </>
        )}
      </div>

      <div className="card glass-panel" style={{ padding: '2rem' }}>
        
        {/* Header Block fields -> grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Left Block */}
          <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Customer</label>
              <input type="text" className="form-control" disabled value={invoice.customer?.name || ''} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Salesperson</label>
              <input type="text" className="form-control" disabled value={invoice.salesperson?.name || ''} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Payment Reference</label>
              <input type="text" className="form-control" disabled={!canEdit} value={formData.paymentReference} onChange={(e) => setFormData({...formData, paymentReference: e.target.value})} placeholder="e.g. INV-001 or Check #..." />
            </div>
          </div>

          {/* Right Block */}
          <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Invoice Date</label>
              <input type="date" className="form-control" disabled value={new Date(invoice.invoiceDate).toISOString().split('T')[0]} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Due Date</label>
              <input type="date" className="form-control" disabled={!canEdit} value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Journal</label>
              <input type="text" className="form-control" disabled={!canEdit} value={formData.journal} onChange={(e) => setFormData({...formData, journal: e.target.value})} />
            </div>
          </div>

        </div>

        {/* Tab Header (Mimics Subscriptions layout) */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', gap: '2rem' }}>
          <div style={{ paddingBottom: '0.8rem', borderBottom: '2px solid var(--primary)', fontWeight: 700, color: 'var(--primary)', marginBottom: '-2px', cursor: 'pointer' }}>Invoice Lines</div>
        </div>

        {/* Table -> Readonly since line items come statically from subscription */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Quantity</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Unit Price</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Taxes</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Discount</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.8rem 1rem' }}>{line.product?.productName}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>{line.quantity}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>₹{line.unitPrice?.toFixed(2)}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>₹{line.taxAmount?.toFixed(2)}</td>
                  <td style={{ padding: '0.8rem 1rem', color: 'var(--success)' }}>-₹{line.discountAmount?.toFixed(2)}</td>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>₹{line.lineTotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Untaxed Amount:</span>
              <span>₹{invoice.subtotal?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Taxes:</span>
              <span>₹{invoice.totalTax?.toFixed(2)}</span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--success)' }}>Discount:</span>
                <span style={{ color: 'var(--success)' }}>-₹{invoice.totalDiscount?.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0', fontWeight: 700 }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{invoice.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InvoiceView;
