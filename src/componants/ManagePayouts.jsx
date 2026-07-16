import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function ManagePayouts() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payouts/summary');
      setSummary(Array.isArray(res.data?.summary) ? res.data.summary : []);
    } catch (err) {
      console.error(err);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const toggleUser = async (user) => {
    if (expandedUser === user._id) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(user._id);
    const res = await api.get(`/payouts/user/${user._id}`);
    setSchedule(Array.isArray(res.data?.payouts) ? res.data.payouts : []);
  };

  const markPaid = async (payoutId) => {
    setUpdatingId(payoutId);
    try {
      // Send an explicit empty object so axios sets Content-Type:
      // application/json and the server's JSON body parser always sees a
      // real (if empty) body, instead of an undefined one.
      await api.patch(`/payouts/${payoutId}/mark-paid`, {});
      const res = await api.get(`/payouts/user/${expandedUser}`);
      setSchedule(Array.isArray(res.data?.payouts) ? res.data.payouts : []);
      fetchSummary();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-sm text-gray-400 py-10 text-center">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">SO Payout Schedules</h2>
        <p className="text-xs text-gray-400">₹10,000/month for 12 months, tracked manually. Mark each month as paid after you've completed the payment offline.</p>
      </div>

      {summary.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-10 text-sm text-gray-400 italic text-center">
          No payout schedules yet.
        </div>
      ) : (
        <div className="space-y-3">
          {summary.map((s) => (
            <div key={s.user._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleUser(s.user)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.user.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{s.user.regNo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-emerald-600">{s.paidMonths} paid</span>
                  <span className="text-xs font-semibold text-amber-600">{s.pendingMonths} pending</span>
                </div>
              </button>

              {expandedUser === s.user._id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {schedule.map((p) => (
                      <div key={p._id} className={`border rounded-lg p-3 ${p.status === 'PAID' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                        <p className="text-xs font-semibold text-gray-700">Month {p.monthIndex}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(p.scheduledMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1">₹{p.amount}</p>
                        {p.status === 'PAID' ? (
                          <span className="text-xs font-semibold text-emerald-600">✓ Paid</span>
                        ) : (
                          <button
                            onClick={() => markPaid(p._id)}
                            disabled={updatingId === p._id}
                            className="mt-1 text-xs font-semibold bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 disabled:opacity-60"
                          >
                            {updatingId === p._id ? '...' : 'Mark Paid'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}