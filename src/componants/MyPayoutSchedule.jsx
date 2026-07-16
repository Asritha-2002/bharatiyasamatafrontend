import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function MyPayoutSchedule() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/payouts/me');
        setPayouts(Array.isArray(res.data?.payouts) ? res.data.payouts : []);
      } catch (err) {
        setError('Could not load your payout schedule.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Loading payout schedule...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (payouts.length === 0) return null;

  const paidCount = payouts.filter((p) => p.status === 'PAID').length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Your Monthly Payout Schedule</h3>
          <p className="text-xs text-gray-400 mt-0.5">₹10,000/month for 12 months, as a State Organizer.</p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-3 py-1 w-fit">
          {paidCount}/12 months paid
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {payouts.map((p) => (
          <div
            key={p._id}
            className={`border rounded-lg p-3 ${
              p.status === 'PAID' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <p className="text-xs font-semibold text-gray-700">Month {p.monthIndex}</p>
            <p className="text-xs text-gray-400">
              {new Date(p.scheduledMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1">₹{p.amount}</p>
            {p.status === 'PAID' ? (
              <span className="text-xs font-semibold text-emerald-600">✓ Paid</span>
            ) : (
              <span className="text-xs font-semibold text-amber-600">Pending</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}