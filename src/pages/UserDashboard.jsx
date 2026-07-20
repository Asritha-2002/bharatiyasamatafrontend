import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AnnualPurchaseBanner from '../componants/AnnualPurchaseBanner.jsx';
import PurchaseHistoryTab from '../componants/PurchaseHistory.jsx';
import Tabs from '../componants/Tabs.jsx';
import HelpModal from '../componants/HelpModal.jsx';
import { OfflineBanner, SlowConnectionNotice, DashboardIssueCard } from '../componants/ConnectionNotice.jsx';
import { DashboardLoading } from '../componants/DashboardStates.jsx';
import { getInitials, resolveErrorDetails, ROLE_STYLES } from '../utils/dashboardHelpers.js';
import { groupIntoBatches } from '../utils/batchHelpers.js';
import { getRoleLabel } from '../utils/roleLabels.js';
import { getMyKyc } from '../api/kyc.js';
import MyPayoutSchedule from '../componants/MyPayoutSchedule.jsx';
import HelpBooksCard from '../componants/HelpBooksCard.jsx';

const USER_TABS = [
  { key: 'network', label: 'My Network' },
  { key: 'purchases', label: 'Books Helped History' }
];

const USER_HELP_POINTS = [
  { title: 'Your Recruitment Code', text: "Share your unique recruitment code or invite link with new people you want to bring into your network." },
  { title: 'My Network Tab', text: "See your parent (who recruited you) and everyone you've personally recruited, grouped into batches of 12." },
  { title: 'Books Helped History Tab', text: 'Check your book helped records and confirm your annual books helped status here.' },
  { title: 'Groups & Batches', text: 'Recruits are automatically organized into groups of 12. A group is marked "Completed" once all 12 members have helped their books.' },
  { title: 'Expanding a Recruit', text: "Click on any recruit's row to see their own recruits (your grandkids in the network)." },
  { title: 'Getting Promoted', text: "Your invite link becomes active once you're promoted to RO. Until then, focus on completing your books helping." },
  { title: 'Getting Promoted to SO', text: "You're promoted to State Organizer (SO) as soon as at least one of your recruits has themselves helped 2 books and become an RO" },
  { title: 'SO Monthly Payout & Renewal', text: "As an SO, you'll receive ₹10,000 every month for up to 1 year. To renew this for another year, simply repeat the cycle: help 2 books to become an RO again, recruit a group of members, and have at least one of them also help 2 books and become an RO." }
];

// How long a request can run before we tell the person it's slow (ms).
const SLOW_REQUEST_THRESHOLD = 8000;

// Turns a caught error into { type, title, message } so the UI can show the
// right message: fully offline, request never reached the server (network/
// timeout), or a normal server-side error.
function classifyError(err) {
  if (!navigator.onLine) {
    return {
      type: 'offline',
      title: "You're offline",
      message: 'Check your internet connection, then try again.',
    };
  }

  const isNetworkLevelFailure = !err.response || err.code === 'ECONNABORTED' || err.message === 'Network Error';
  if (isNetworkLevelFailure) {
    return {
      type: 'network',
      title: 'Connection problem',
      message: "We couldn't reach the server. Your connection may be slow or unstable — try again in a moment.",
    };
  }

  const details = resolveErrorDetails(err) || {};
  return {
    type: 'server',
    title: details.title || 'Something went wrong',
    message: details.message || 'Please try again.',
  };
}

export default function UserDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('network');
  const [helpOpen, setHelpOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [slowConnection, setSlowConnection] = useState(false);
  const slowTimerRef = useRef(null);

  // KYC status is only relevant for SO members, fetched separately once we
  // know the role -- avoids touching the existing /dashboard/me response shape.
  const [kycStatus, setKycStatus] = useState(null); // null while unknown/loading, or 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED'

  const fetchDashboard = useCallback(async () => {
    setError(null);
    setLoading(true);
    setSlowConnection(false);

    clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setSlowConnection(true), SLOW_REQUEST_THRESHOLD);

    try {
      const res = await api.get('/dashboard/me');

      // Safety check: if Admin somehow lands here, redirect them to their own view
      if (res.data.role === 'ADMIN') {
        navigate('/admin', { replace: true });
        return;
      }

      setData(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        navigate('/login', { replace: true });
        return;
      }
      setError(classifyError(err));
    } finally {
      clearTimeout(slowTimerRef.current);
      setSlowConnection(false);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
    return () => clearTimeout(slowTimerRef.current);
  }, [fetchDashboard]);

  // Keep isOnline in sync with the browser, and offer a message the moment
  // the connection drops -- even if the dashboard is already loaded.
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If we come back online while sitting on an error, try again automatically.
  useEffect(() => {
    if (isOnline && error) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Once we know the person is an SO, check whether they've completed KYC.
  useEffect(() => {
    if (data?.me?.role !== 'SO') return;

    let cancelled = false;
    (async () => {
      try {
        const res = await getMyKyc();
        if (cancelled) return;
        setKycStatus(res.data.submission ? res.data.submission.status : 'NOT_SUBMITTED');
      } catch {
        // Non-critical -- if this fails, we just don't show the banner rather
        // than blocking the rest of the dashboard.
        if (!cancelled) setKycStatus(null);
      }
    })();

    return () => { cancelled = true; };
  }, [data?.me?.role]);

  const childrenWithGrandkids = useMemo(() => {
    if (!data) return [];
    return data.children.map((child) => ({
      ...child,
      grandkids: data.grandchildren.filter((g) => g.referredBy === child._id)
    }));
  }, [data]);

  const childBatches = useMemo(() => {
    if (!data) return [];
    return groupIntoBatches(childrenWithGrandkids);
  }, [childrenWithGrandkids]);

  const inviteLink = data ? `${window.location.origin}/register?ref=${data.me.referralCode}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showKycPrompt = data?.me?.role === 'SO' && (kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED' || kycStatus === 'PENDING');
  const showPayoutsTab = data?.me?.role === 'SO' && kycStatus === 'APPROVED';

  // Payouts tab only appears once KYC is approved -- otherwise the tab bar
  // stays exactly as it was for every other role/status.
  const tabs = useMemo(() => {
    const base = [...USER_TABS];
    if (showPayoutsTab) base.push({ key: 'payouts', label: 'Payouts' });
    return base;
  }, [showPayoutsTab]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHelpOpen(true)}
              className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
            >
              <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[11px] font-semibold">?</span>
              Help
            </button>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Log Out
            </button>
          </div>
        </div>

        {!isOnline && <OfflineBanner onRetry={fetchDashboard} />}

        {error ? (
          <DashboardIssueCard error={error} onRetry={fetchDashboard} onLogout={logout} />
        ) : loading || !data ? (
          <>
            <DashboardLoading />
            {slowConnection && <SlowConnectionNotice onRetry={fetchDashboard} />}
          </>
        ) : (
          <>
            {showKycPrompt && <KycPromptBanner status={kycStatus} onClick={() => navigate('/kyc')} />}

            <AnnualPurchaseBanner
              hasPurchasedBooks={data.me.hasPurchasedBooks}
              lastPurchaseYear={data.me.lastPurchaseYear}
              totalBooksThisYear={data.me.totalBooksThisYear}
            />

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-500 text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
                    {getInitials(data.me.name)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{data.me.name}</p>
                    <p className="text-sm text-gray-500">{data.me.email}</p>
                  </div>
                </div>
                <span className={`text-md font-bold px-3 py-1 rounded-full border ${ROLE_STYLES[data.me.role]}`}>
                  {getRoleLabel(data.me.role)}
                </span>
              </div>

              {!data.me.hasPurchasedBooks && data.me.role === 'VOLUNTEER' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
                  You need to help 2 books before you can start recruiting.
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Recruitment Code</p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">{data.me.referralCode}</code>
                  <button
                    onClick={copyLink}
                    disabled={!data.me.canRecruit}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy invite link'}
                  </button>
                </div>
                {!data.me.canRecruit && (
                  <p className="text-xs text-gray-400 mt-1">
                    Your invite link will work once you're promoted to RO.
                  </p>
                )}
              </div>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'network' && (
              <div className="space-y-6">
                 <HelpBooksCard hasPurchasedBooks={data.me.hasPurchasedBooks} />
                <div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0" /> Your Parent
                  </h2>
                  {data.parent ? (
                    <PersonRow person={data.parent} />
                  ) : (
                    <EmptyRow text="No parent — you were added directly by Admin." />
                  )}
                </div>

                <div className="flex justify-center">
                  <div className="w-px h-6 bg-gray-200" />
                </div>

                <div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-300 flex-shrink-0" />
                    Your Recruits ({childrenWithGrandkids.length}) — {childBatches.length} group{childBatches.length === 1 ? '' : 's'}
                  </h2>

                  {childBatches.length === 0 ? (
                    <EmptyRow text="No children yet — share your recruitment link to start recruiting." />
                  ) : (
                    <div className="space-y-5">
                      {childBatches.map((batch) => (
                        <BatchGroup key={batch.batchNumber} batch={batch} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <PurchaseHistoryTab
                myRegNo={data.me.regNo}
                parentRegNo={data.parent?.regNo}
                hasPurchasedBooks={data.me.hasPurchasedBooks}
              />
            )}

            {activeTab === 'payouts' && showPayoutsTab && <MyPayoutSchedule />}
          </>
        )}
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} points={USER_HELP_POINTS} />
    </div>
  );
}

/* ---- Local sub-components ---- */

function KycPromptBanner({ status, onClick }) {
  const copy = {
    NOT_SUBMITTED: {
      title: "You've been promoted to State Organizer — complete your KYC",
      message: "To receive payments, please complete your KYC using your Aadhaar card and upload your bank details, including a cancelled cheque.",
      tone: 'bg-blue-50 border-blue-200 text-blue-800',
      button: 'Complete KYC',
    },
    REJECTED: {
      title: 'Your KYC submission needs attention',
      message: 'Your previous KYC submission was rejected. Please review and resubmit your details.',
      tone: 'bg-red-50 border-red-200 text-red-800',
      button: 'Resubmit KYC',
    },
    PENDING: {
      title: 'Your KYC is under review',
      message: "We've received your KYC details and they're being reviewed by our team.",
      tone: 'bg-amber-50 border-amber-200 text-amber-800',
      button: 'View submission',
    },
  }[status];

  return (
    <div className={`border rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${copy.tone}`}>
      <div className="flex-1">
        <p className="font-semibold text-sm">{copy.title}</p>
        <p className="text-xs mt-0.5 opacity-90">{copy.message}</p>
      </div>
      <button
        onClick={onClick}
        className="text-xs font-semibold bg-white px-4 py-2 rounded-lg border border-current hover:bg-black/5 transition-colors whitespace-nowrap flex-shrink-0"
      >
        {copy.button}
      </button>
    </div>
  );
}

function PersonRow({ person }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
        {getInitials(person.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{person.name}</p>
        <p className="text-xs text-gray-400 truncate">{person.email} • {person.contactNumber}</p>
        {person.regNo && <p className="text-xs text-gray-400">Reg ID: {person.regNo}</p>}
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLES[person.role]}`}>
        {getRoleLabel(person.role)}
      </span>
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-5 text-sm text-gray-400 italic text-center">
      {text}
    </div>
  );
}

function BatchGroup({ batch }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${batch.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
          Group {batch.batchNumber}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {batch.completedCount}/12 completed{batch.isComplete && ' — Completed ✓'}
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
          <div
            className={`h-full rounded-full transition-all ${batch.isComplete ? 'bg-emerald-400' : 'bg-blue-400'}`}
            style={{ width: `${(batch.completedCount / 12) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {batch.members.map((child) => (
          <RecruitRow key={child._id} child={child} />
        ))}
      </div>
    </div>
  );
}

function RecruitRow({ child }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      {/* Child (e.g. Narendra) */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
          {getInitials(child.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{child.name}</p>
          <p className="text-xs text-gray-400 truncate">{child.email}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 truncate">{child.contactNumber}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLES[child.role]}`}>{child.role}</span>
        {child.hasPurchasedBooks ? (
          <span className="text-emerald-600 text-xs font-semibold">✓ Helped</span>
        ) : (
          <span className="text-amber-600 text-xs font-semibold">Pending</span>
        )}
      </div>

      {/* Grandkids -- who Narendra himself recruited */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          {child.grandkids.length} recruit{child.grandkids.length === 1 ? '' : 's'}
        </p>

        {child.grandkids.length === 0 ? (
          <p className="text-xs text-gray-300 italic">No recruits yet</p>
        ) : (
          <div className="space-y-1.5">
            {child.grandkids.map((g) => (
              <div key={g._id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <span className="text-xs font-medium text-gray-700 truncate">{g.name}</span>
                <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5 flex-shrink-0">
                  {g.recruitCount || 0} recruit{g.recruitCount === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}