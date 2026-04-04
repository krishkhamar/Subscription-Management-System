import { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiFileText, 
  FiAlertCircle 
} from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getDashboardStatsAPI, getRevenueReportAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revenueRes] = await Promise.all([
          getDashboardStatsAPI(),
          user?.role !== 'portal' ? getRevenueReportAPI() : Promise.resolve({ data: [] })
        ]);
        setStats(statsRes.data);
        setRevenueData(revenueRes.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>Loading Portal...</div>;

  const statCards = [
    { title: 'My Total Billing' , value: `$${stats?.totalRevenue || 0}`, icon: <FiTrendingUp />, color: 'var(--primary)', hideFor: [] },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: <FiUsers />, color: 'var(--secondary)', hideFor: [] },
    { title: 'Invoices Issued', value: stats?.totalInvoices || 0, icon: <FiFileText />, color: 'var(--accent)', hideFor: [] },
    { title: 'Action Items (Overdue)', value: stats?.overdueInvoices || 0, icon: <FiAlertCircle />, color: 'var(--danger)', hideFor: [] },
  ];

  // Customize titles for Admin
  if (user?.role === 'admin') {
    statCards[0].title = 'Total Revenue';
    statCards[1].title = 'Total Active Subs';
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 700 }}>
        {user?.role === 'portal' ? 'Customer Portal' : 'Admin Dashboard'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{card.title}</p>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{card.value}</h2>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: `${card.color}20`, color: card.color, fontSize: '1.2rem' }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {user?.role !== 'portal' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Business Growth (Last 6 Months)</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
