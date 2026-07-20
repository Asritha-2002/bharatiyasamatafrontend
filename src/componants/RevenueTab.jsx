import { useEffect, useState, useMemo } from 'react';
import { getRevenueOverview } from '../api/revenue.js';
import { downloadInvoicePDF } from '../utils/invoiceGenerator.js';
import NetworkSearchFilter from './NetworkSearchFilterRevenue.jsx';

function formatDate(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  );
}

export default function RevenueTab() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getRevenueOverview();
      // Backend returns { summary: {...}, transactions: [...] }
      setSummary(res.data.summary);
      setTransactions(res.data.transactions || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load helped data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = async (transaction) => {
    setDownloadingId(transaction._id);
    try {
      await downloadInvoicePDF(transaction);
    } catch (err) {
      console.error('Invoice generation failed:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Filters by name/email/mobile/Reg No only.
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;

    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        (t.booksHelperName || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.mobilePhone || '').toLowerCase().includes(q) ||
        (t.regNo || '').toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  if (loading || !summary) {
    return <p className="text-sm text-gray-500">Loading helped data...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Helped" value={`₹${summary.totalRevenue.toLocaleString()}`} />
        <StatCard label="Books Sold" value={summary.booksSold.toLocaleString()} />
        <StatCard label="Transactions" value={summary.transactions.toLocaleString()} />
        {/* <StatCard label="Avg. Order Value" value={`₹${summary.avgOrderValue.toLocaleString()}`} /> */}
      </div>

      {/* Transactions */}
      <div>
        <NetworkSearchFilter
          query={searchQuery}
          onQueryChange={setSearchQuery}
        />

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Recent Transactions</h3>
          <p className="text-xs text-gray-400">{filteredTransactions.length} of {transactions.length}</p>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-10 text-center">
            <p className="text-sm text-gray-400 italic">
              {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match this search.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">#</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Contact</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Books</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Amount</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t, index) => (
                      <tr key={t._id} className="border-b border-gray-100 last:border-0 align-top">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <p className="font-medium text-gray-900 whitespace-nowrap">{t.booksHelperName || 'Not provided'}</p>
                          <p className="text-xs text-gray-500 mt-1">{t.regNo || '—'}</p>
                          <p className="whitespace-nowrap">{t.mobilePhone || '—'}</p>
                          <p className="text-xs text-gray-400 break-all">{t.email || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">{t.numberOfFreeBooks}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">₹{t.amount}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(t.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDownload(t)}
                            disabled={downloadingId === t._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 text-xs font-semibold hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                            </svg>
                            {downloadingId === t._id ? 'Generating...' : 'Download'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-3">
              {filteredTransactions.map((t, index) => (
                <div key={t._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-gray-900 text-sm">#{index + 1} · {t.booksHelperName || 'Not provided'}</p>
                  </div>

                  <p className="text-xs text-gray-500">{t.mobilePhone || '—'}</p>
                  <p className="text-xs text-gray-500 break-all mb-2">{t.email || '—'}</p>
                  <p className="text-xs text-gray-500 mb-2">{t.regNo || '—'}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                    <div>
                      <p className="text-gray-400">Books</p>
                      <p className="font-semibold text-gray-900">{t.numberOfFreeBooks}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="font-semibold text-gray-900">₹{t.amount}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">{formatDate(t.createdAt)}</p>

                  <button
                    onClick={() => handleDownload(t)}
                    disabled={downloadingId === t._id}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-orange-500 text-orange-600 text-xs font-semibold hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                    </svg>
                    {downloadingId === t._id ? 'Generating...' : 'Download Invoice'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}