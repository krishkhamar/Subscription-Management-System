import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getSubscriptionAPI, 
  updateSubscriptionAPI, 
  updateSubscriptionStatusAPI,
  createSubscriptionAPI,
  getUsersAPI,
  getProductsAPI,
  getTemplatesAPI,
  deleteSubscriptionAPI,
  createInvoiceAPI
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiTrash2, FiPrinter, FiSend, FiCheckCircle, FiFileText, 
  FiRefreshCw, FiArrowUpCircle, FiXCircle, FiSave, FiArrowLeft, FiPlus, FiX
} from 'react-icons/fi';

const SubscriptionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('orderLines');

  // Form state
  const [formData, setFormData] = useState({
    customer: '',
    salesperson: '',
    startDate: '',
    paymentTerms: '',
    paymentMethod: '',
    paymentDone: false,
    orderLines: []
  });

  // Reference data
  const [customers, setCustomers] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, usersRes, prodRes, tplRes] = await Promise.all([
        getSubscriptionAPI(id),
        getUsersAPI(),
        getProductsAPI(),
        getTemplatesAPI()
      ]);
      
      const sub = subRes.data;
      setSubscription(sub);
      
      setCustomers(usersRes.data.filter(u => u.role === 'portal'));
      setSalespeople(usersRes.data.filter(u => ['admin', 'internal'].includes(u.role)));
      setProducts(prodRes.data);
      setTemplates(tplRes.data);

      setFormData({
        customer: sub.customer?._id || '',
        salesperson: sub.salesperson?._id || sub.createdBy || '',
        startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : '',
        paymentTerms: sub.paymentTerms || '',
        paymentMethod: sub.paymentMethod || '',
        paymentDone: sub.paymentDone || false,
        orderLines: sub.orderLines.map(line => ({
          product: line.product._id,
          productName: line.product.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxes: line.taxes || 0,
          amount: line.amount
        }))
      });

    } catch (error) {
      toast.error('Failed to load subscription details');
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        orderLines: formData.orderLines.map(line => ({
          product: line.product,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxes: line.taxes,
          amount: line.amount
        }))
      };
      await updateSubscriptionAPI(id, payload);
      toast.success('Subscription saved');
      fetchData();
    } catch (error) {
      toast.error('Failed to save subscription');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateSubscriptionStatusAPI(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await deleteSubscriptionAPI(id);
      toast.success('Subscription deleted');
      navigate('/subscriptions');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days default
      const res = await createInvoiceAPI({ subscriptionId: id, dueDate });
      toast.success('Invoice created implicitly');
      navigate(`/invoices/${res.data._id}`);
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleRenewUpsell = async (type) => {
    try {
      // Create a duplicate subscription
      const clonePayload = {
        customer: formData.customer,
        plan: subscription.plan?._id, // Required by backend
        startDate: new Date(),
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Mocked 1 year exp
        orderLines: type === 'renew' ? formData.orderLines : [], // Upsell clears lines for new products
        salesperson: user?._id,
        status: 'draft'
      };
      const res = await createSubscriptionAPI(clonePayload);
      toast.success(`${type === 'renew' ? 'Renewal' : 'Upsell'} draft created`);
      navigate(`/subscriptions/${res.data._id}`);
    } catch (error) {
      toast.error(`Failed to initiate ${type}`);
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      orderLines: [
        ...formData.orderLines,
        { product: '', quantity: 1, unitPrice: 0, taxes: 0, amount: 0 }
      ]
    });
  };

  const removeLine = (index) => {
    const lines = [...formData.orderLines];
    lines.splice(index, 1);
    setFormData({ ...formData, orderLines: lines });
  };

  const updateLine = (index, field, value) => {
    const lines = [...formData.orderLines];
    lines[index][field] = value;
    
    // Auto populate price based on product selection
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        lines[index].unitPrice = selectedProduct.costPrice || 0;
      }
    }

    // Auto compute total
    lines[index].amount = lines[index].quantity * lines[index].unitPrice;
    setFormData({ ...formData, orderLines: lines });
  };

  if (loading || !subscription) return <div style={{ padding: '2rem' }}>Loading subscription details...</div>;

  const st = subscription.status;
  const isDraft = st === 'draft' || st === 'quotation';
  const isSent = st === 'quotation sent'; // We use quotation to hold 'Quotation Sent' logic in UI
  const isConfirmed = st === 'confirmed' || st === 'active';
  const canEdit = isDraft; 

  const totalAmount = formData.orderLines.reduce((sum, line) => sum + (line.amount || 0), 0);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* Top Header & Breadcrumbs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem' }} onClick={() => navigate('/subscriptions')}>
            <FiArrowLeft /> Back to Subscriptions
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>
            {subscription.subscriptionNumber}
          </h1>
        </div>

        {/* Status Bar Layout matching Excalidraw */}
        <div style={{ display: 'flex', gap: '0', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '0.6rem 1.5rem', background: (st === 'draft' || st==='quotation') ? 'var(--primary)' : 'transparent', color: (st === 'draft' || st==='quotation') ? 'white' : 'var(--text-muted)', fontWeight: 600 }}>
            Quotation
          </div>
          <div style={{ padding: '0.6rem 1.5rem', background: st === 'quotation sent' ? 'var(--primary)' : 'transparent', color: st === 'quotation sent' ? 'white' : 'var(--text-muted)', fontWeight: 600, borderLeft: '1px solid #e2e8f0' }}>
            Quotation Sent
          </div>
          <div style={{ padding: '0.6rem 1.5rem', background: (st === 'confirmed' || st === 'active') ? 'var(--primary)' : 'transparent', color: (st === 'confirmed' || st === 'active') ? 'white' : 'var(--text-muted)', fontWeight: 600, borderLeft: '1px solid #e2e8f0' }}>
            Confirmed
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="card glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        
        {/* Draft/Quotation State Buttons */}
        {isDraft && (
          <>
            <button className="btn btn-primary" onClick={handleSave}><FiSave /> Save</button>
            <button className="btn btn-secondary" onClick={() => handleStatusChange('confirmed')}><FiCheckCircle /> Confirm</button>
            <button className="btn btn-secondary"><FiSend /> Send</button>
            <button className="btn btn-secondary"><FiPrinter /> Print</button>
            <button className="btn btn-danger" onClick={handleDelete}><FiTrash2 /> Delete</button>
          </>
        )}

        {/* Confirmed State Buttons */}
        {isConfirmed && (
          <>
            <button className="btn btn-primary" onClick={handleCreateInvoice}><FiFileText /> Create Invoice</button>
            <button className="btn btn-secondary" onClick={() => handleRenewUpsell('renew')}><FiRefreshCw /> Renew</button>
            <button className="btn btn-secondary" onClick={() => handleRenewUpsell('upsell')}><FiArrowUpCircle /> Upsell</button>
            <button className="btn btn-danger" onClick={() => handleStatusChange('closed')}><FiXCircle /> Cancel SUB</button>
          </>
        )}
      </div>

      <div className="card glass-panel" style={{ padding: '2rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Left Block */}
          <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Customer</label>
              <select className="form-control" disabled={!canEdit} value={formData.customer} onChange={(e) => setFormData({...formData, customer: e.target.value})}>
                <option value="">Select Customer...</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Quotation Template</label>
              <select className="form-control" disabled={!canEdit}>
                <option value="">{subscription.plan?.planName || 'Select Template...'}</option>
                {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          {/* Right Block - Optional/Metadata */}
          <div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Payment Terms</label>
              <input type="text" className="form-control" disabled={!canEdit} value={formData.paymentTerms} onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})} placeholder="e.g. Net 30, Due on Receipt" />
            </div>
          </div>

        </div>

        {/* Tab System */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', gap: '2rem' }}>
          <div 
            onClick={() => setActiveTab('orderLines')}
            style={{ 
              paddingBottom: '0.8rem', 
              borderBottom: activeTab === 'orderLines' ? '2px solid var(--primary)' : '2px solid transparent', 
              fontWeight: activeTab === 'orderLines' ? 700 : 600, 
              color: activeTab === 'orderLines' ? 'var(--primary)' : 'var(--text-muted)', 
              marginBottom: '-2px', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Order Lines
          </div>
          <div 
            onClick={() => setActiveTab('otherInfo')}
            style={{ 
              paddingBottom: '0.8rem', 
              borderBottom: activeTab === 'otherInfo' ? '2px solid var(--primary)' : '2px solid transparent', 
              fontWeight: activeTab === 'otherInfo' ? 700 : 600, 
              color: activeTab === 'otherInfo' ? 'var(--primary)' : 'var(--text-muted)', 
              marginBottom: '-2px', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Other Info
          </div>
        </div>

        {activeTab === 'orderLines' ? (
          <>
            {/* Table equivalent */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Quantity</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Unit Price</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Taxes</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Subtotal</th>
                    {canEdit && <th style={{ padding: '1rem', fontWeight: 600 }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {formData.orderLines.map((line, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <select className="form-control" disabled={!canEdit} value={line.product} onChange={(e) => updateLine(idx, 'product', e.target.value)} style={{ minWidth: '200px' }}>
                          <option value="">Select product...</option>
                          {products.map(p => <option key={p._id} value={p._id}>{p.productName}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <input type="number" className="form-control" disabled={!canEdit} value={line.quantity} min="1" onChange={(e) => updateLine(idx, 'quantity', parseInt(e.target.value) || 1)} style={{ width: '80px' }} />
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <input type="number" className="form-control" disabled={!canEdit} value={line.unitPrice} onChange={(e) => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)} style={{ width: '100px' }} />
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <input type="number" className="form-control" disabled={!canEdit} value={line.taxes} onChange={(e) => updateLine(idx, 'taxes', parseFloat(e.target.value) || 0)} style={{ width: '80px' }} />
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          ₹{line.amount?.toFixed(2)}
                        </div>
                      </td>
                      {canEdit && (
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                          <button className="btn" style={{ color: 'var(--danger)', padding: '0.4rem' }} onClick={() => removeLine(idx)}><FiX size={20} /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canEdit && (
              <button className="btn" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1rem', padding: '0.5rem 1rem' }} onClick={addLine}>
                <FiPlus /> Add a line
              </button>
            )}
          </>
        ) : (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              
              {/* Left Side Info */}
              <div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ color: 'var(--danger)', fontWeight: 600 }}>Salesperson</label>
                  <select 
                    className="form-control" 
                    disabled={!canEdit || user?.role !== 'admin'} 
                    value={formData.salesperson} 
                    onChange={(e) => setFormData({...formData, salesperson: e.target.value})}
                    style={{ borderBottom: '1px solid var(--danger)', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.5rem 0' }}
                  >
                    <option value="">Select Salesperson...</option>
                    {salespeople.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ color: 'var(--danger)', fontWeight: 600 }}>Payment Method</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    disabled={!canEdit} 
                    value={formData.paymentMethod} 
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} 
                    placeholder="Enter payment method"
                    style={{ borderBottom: '1px solid var(--danger)', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.5rem 0' }}
                  />
                </div>
              </div>

              {/* Right Side Info */}
              <div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ color: 'var(--danger)', fontWeight: 600 }}>Start Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    disabled={!canEdit} 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    style={{ borderBottom: '1px solid var(--danger)', borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.5rem 0' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '1rem' }}>
                  <label style={{ color: 'var(--danger)', fontWeight: 600, margin: 0 }}>Payment done</label>
                  <input 
                    type="checkbox" 
                    disabled={!canEdit} 
                    id="paymentDone" 
                    style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: 'var(--danger)' }} 
                    checked={formData.paymentDone} 
                    onChange={(e) => setFormData({...formData, paymentDone: e.target.checked})} 
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SubscriptionView;
