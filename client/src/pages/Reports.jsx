import { useState, useEffect } from 'react';
import { getRevenueReportAPI, getOverdueInvoicesAPI, getDashboardStatsAPI, getSubscriptionReportAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiBarChart2, FiAlertCircle, FiTrendingUp, FiDollarSign, FiClock, FiFilter } from 'react-icons/fi';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [statsRes, revenueRes, overdueRes, subRes] = await Promise.all([
        getDashboardStatsAPI(),
        getRevenueReportAPI(filters.startDate, filters.endDate),
        getOverdueInvoicesAPI(),
        getSubscriptionReportAPI()
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setOverdueInvoices(overdueRes.data);
      setSubscriptionData(subRes.data);
    } catch (error) {
      toast.error('Failed to load analytical data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Generative Analytical Report...</div>;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Business Reports</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <FiFilter color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>From:</span>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} style={{ border: 'none', background: 'transparent', fontSize: '0.85rem' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>To:</span>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} style={{ border: 'none', background: 'transparent', fontSize: '0.85rem' }} />
          </div>
          <button className="btn btn-secondary" onClick={fetchReportData}><FiClock /> Refresh Data</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card glass-panel" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Total Revenue</span>
            <FiTrendingUp />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>${stats?.totalRevenue?.toLocaleString()}</h2>
        </div>
        <div className="card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Subscriptions</span>
            <FiDollarSign color="var(--success)" />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats?.activeSubscriptions}</h2>
        </div>
        <div className="card glass-panel" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Overdue Invoices</span>
            <FiAlertCircle color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats?.overdueInvoices}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Revenue Trend */}
        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Monthly Revenue Trend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {revenueData.slice(0, 5).map((item, idx) => (
              <div key={item.month || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '80px', fontSize: '0.85rem' }}>{item.month}</div>
                <div style={{ flex: 1, height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${Math.min((item.total / (revenueData[0]?.total || 1)) * 100, 100)}%`, 
                        height: '100%', 
                        background: 'var(--primary)',
                        borderRadius: '6px'
                    }}></div>
                </div>
                <div style={{ width: '80px', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>${item.total?.toLocaleString()}</div>
              </div>
            ))}
            {revenueData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No financial records found.</p>}
          </div>
        </div>

        {/* Overdue Invoices List */}
        <div className="card glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Critical Overdue Invoices</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {overdueInvoices.slice(0, 4).map((inv) => (
              <div key={inv._id} style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>{inv.invoiceNumber}</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>${inv.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.customer?.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#b91c1c', marginTop: '4px' }}>Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
              </div>
            ))}
            {overdueInvoices.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Perfect! No overdue payments.</p>}
          </div>

          <h3 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Subscription Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {subscriptionData.map((stat) => (
              <div key={stat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px' }}>
                <span className={`badge badge-${stat._id}`} style={{ textTransform: 'capitalize' }}>{stat._id}</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stat.count}</span>
              </div>
            ))}
            {subscriptionData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No subscriptions found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
