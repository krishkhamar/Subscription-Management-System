import { useState, useEffect } from 'react';
import { getPlansAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiSettings } from 'react-icons/fi';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await getPlansAPI();
        setPlans(data);
      } catch (error) {
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Plans...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Recurring Plans</h1>
        <button className="btn btn-primary">+ Create Plan</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {plans.map(plan => (
          <div key={plan._id} className="card glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: 600 }}>
                <FiClock /> {plan.billingModel === 'recurring' ? 'Recurring' : 'One-time'}
              </div>
              <FiSettings style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.planName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {plan.product?.productName} — {plan.billingPeriod} {plan.periodUnit}s
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>${plan.totalAmount?.toFixed(2)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ {plan.periodUnit}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>{plan.invoiceType}</span>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>{plan.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
