import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { buildPaymentLink } from '../config.js';
import { useNavigate } from 'react-router-dom';

export default function PurchaseHistoryTab({ myRegNo, parentRegNo, hasPurchasedBooks }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/purchase/my-history');
        setHistory(res.data);
      } catch (err) {
        setError('Could not load your purchase history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const paymentLink = buildPaymentLink(myRegNo);

  const copyRegNo = () => {
    navigator.clipboard.writeText(myRegNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Reg No info card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Registration ID</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">{myRegNo}</code>
              <button onClick={copyRegNo} className="text-xs font-semibold text-orange-600 hover:text-orange-800">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {parentRegNo && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Your Parent's Reg ID <span className="normal-case font-normal text-gray-400">(enter this in "Who Introduced" on the form)</span>
              </p>
              <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">{parentRegNo}</code>
            </div>
          )}
        </div>
      </div>

      {/* Buy Books */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 text-xl">
          📚
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Purchase Books</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
          {hasPurchasedBooks
            ? "You've already completed your initial book purchase. You can still buy more books toward your annual requirement anytime."
            : 'Purchase at least 2 books to unlock recruiting.'}
        </p>
        <button
  onClick={() => navigate('/checkout')}
  className="inline-block bg-orange-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
>
  Buy Books
</button>
        <p className="text-xs text-gray-400 mt-3">
          Your Registration ID is pre-filled automatically. If asked "Who Introduced," enter your parent's Reg ID shown above.
        </p>
      </div>

      {/* History */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Purchase History</h3>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">Loading...</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-sm text-red-500">{error}</div>
        ) : history.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400 italic">No purchases recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((p) => (
              <div key={p._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {p.numberOfFreeBooks} book{p.numberOfFreeBooks === 1 ? '' : 's'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{p.amount}</p>
                  <p className={`text-xs font-semibold ${p.status === 'CAPTURED' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {p.status === 'CAPTURED' ? 'Confirmed' : 'Failed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}