import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.PENDING}`}>
      {status}
    </span>
  );
}

export default function ManageKyc() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [payoutSchedule, setPayoutSchedule] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc');
      setSubmissions(Array.isArray(res.data?.submissions) ? res.data.submissions : []);
    } catch (err) {
      console.error(err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openDetail = (submission) => {
    setSelected(submission);
    setRejecting(false);
    setRejectReason('');
    setPayoutSchedule(null);
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const res = await api.patch(`/kyc/${selected._id}/approve`);
      setSelected(null);
      fetchPending();
      if (res.data.payoutsCreated) {
        alert('KYC approved. A 12-month payout schedule of ₹10,000/month has been created since this member is a State Organizer.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(true);
    try {
      await api.patch(`/kyc/${selected._id}/reject`, { reason: rejectReason });
      setSelected(null);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">KYC Verification Requests</h2>
        <p className="text-xs text-gray-400">
          Review submitted identity and bank details. State Organizers get an automatic 12-month payout schedule once approved.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-10 text-sm text-gray-400 italic text-center">
          No KYC submissions yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Reg No</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.user?.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.user?.regNo}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {s.user?.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetail(s)}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-800 border border-orange-200 rounded-lg px-3 py-1.5"
                    >
                      {s.status === 'PENDING' ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{selected.user?.name}</h3>
                <p className="text-xs text-gray-400">{selected.user?.regNo} • {selected.user?.role}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>

            <div className="mb-4">
              <StatusBadge status={selected.status} />
            </div>

            <div className="space-y-3 text-sm">
              <DetailRow label="Aadhaar Number" value={selected.aadhaarNumber} />
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Aadhaar Image</p>
                <a href={selected.aadhaarImageUrl} target="_blank" rel="noopener noreferrer">
                  <img src={selected.aadhaarImageUrl} alt="Aadhaar" className="w-full max-h-48 object-contain border border-gray-200 rounded-lg" />
                </a>
              </div>

              <DetailRow label="Account Holder Name" value={selected.accountHolderName} />
              <DetailRow label="Bank Account Number" value={selected.bankAccountNumber} />
              <DetailRow label="IFSC Code" value={selected.ifscCode} />
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Cancelled Cheque</p>
                <a href={selected.chequeImageUrl} target="_blank" rel="noopener noreferrer">
                  <img src={selected.chequeImageUrl} alt="Cheque" className="w-full max-h-48 object-contain border border-gray-200 rounded-lg" />
                </a>
              </div>

              {selected.status === 'PENDING' && selected.user?.role === 'SO' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-3 py-2">
                  This member is a State Organizer — approving will auto-generate a 12-month payout schedule of ₹10,000/month.
                </div>
              )}

              {selected.status === 'REJECTED' && selected.rejectionReason && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                  <span className="font-semibold">Rejection reason: </span>
                  {selected.rejectionReason}
                </div>
              )}
            </div>

            {/* Approve/Reject only make sense while a submission is still
                PENDING -- once a decision has been made, show a plain status
                summary instead of re-offering actions that would re-trigger
                side effects like payout schedule creation. */}
            {selected.status !== 'PENDING' ? (
              <div className="mt-5 text-xs text-gray-400 border-t border-gray-100 pt-4">
                {selected.status === 'APPROVED'
                  ? `Approved${selected.reviewedAt ? ' on ' + new Date(selected.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}.`
                  : `Rejected${selected.reviewedAt ? ' on ' + new Date(selected.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}.`}
              </div>
            ) : rejecting ? (
              <div className="mt-5 space-y-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={processing || !rejectReason.trim()}
                    className="flex-1 bg-red-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-600 disabled:opacity-60"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => setRejecting(false)}
                    className="flex-1 border border-gray-300 text-gray-600 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 bg-emerald-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-60"
                >
                  {processing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  className="flex-1 border border-red-300 text-red-600 text-sm font-semibold py-2 rounded-lg hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <span className="text-sm font-mono text-gray-900">{value}</span>
    </div>
  );
}