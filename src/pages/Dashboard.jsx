import { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext';
import AnnualPurchaseBanner from '../componants/AnnualPurchaseBanner';
import AdminNetworkExplorer from './AdminNetworkExplorer';
import RevenueTab from '../componants/RevenueTab';
import PurchaseHistoryTab from '../componants/PurchaseHistory.jsx';
import Tabs from '../componants/Tabs.jsx';
import { groupIntoBatches } from '../utils/batchHelpers';
import { getRoleLabel } from '../utils/roleLabels';

/* ============================================================
   CONSTANTS — pulled out so they aren't recreated every render
   ============================================================ */

const ROLE_STYLES = {
  VOLUNTEER: 'bg-gray-100 text-gray-600 border-gray-200',
  RO: 'bg-blue-50 text-blue-700 border-blue-200',
  SO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200'
};

const ADMIN_TABS = [
  { key: 'network', label: 'Network' },
  { key: 'revenue', label: 'Revenue / Books Sold' }
];

const USER_TABS = [
  { key: 'network', label: 'My Network' },
  { key: 'purchases', label: 'Purchase History' }
];

const USER_HELP_POINTS = [
  { title: 'Your Referral Code', text: "Share your unique referral code or invite link with new people you want to bring into your network." },
  { title: 'My Network Tab', text: "See your parent (who recruited you) and everyone you've personally recruited, grouped into batches of 12." },
  { title: 'Purchase History Tab', text: 'Check your book purchase records and confirm your annual purchase status here.' },
  { title: 'Groups & Batches', text: 'Recruits are automatically organized into groups of 12. A group is marked "Completed" once all 12 members have purchased their books.' },
  { title: 'Expanding a Recruit', text: "Click on any recruit's row to see their own recruits (your grandkids in the network)." },
  { title: 'Getting Promoted', text: "Your invite link becomes active once you're promoted to RO. Until then, focus on completing your book purchase." }
];

const ADMIN_HELP_POINTS = [
  { title: 'Referral Code', text: 'Share your admin referral code to onboard new ROs directly under you.' },
  { title: 'Network Tab', text: 'View and manage every member across the entire network from one table.' },
  { title: 'Revenue Tab', text: 'Track total books sold and revenue generated across all members.' },
  { title: 'Managing Users', text: 'Use the network table to update roles or purchase status for any member.' }
];

/* ============================================================
   HELPERS
   ============================================================ */

const getInitials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Dashboard() {
  const { logout } = useAuth();

  // ---- data state ----
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // ---- UI state ----
  const [copied, setCopied] = useState(false);
  const [expandedChild, setExpandedChild] = useState(null);
  const [activeTab, setActiveTab] = useState('network');
  const [helpOpen, setHelpOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/me');
      setData(res.data);
    } catch (err) {
      setError('Could not load dashboard.');
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Attach grandkids to each direct recruit (user view only)
  const childrenWithGrandkids = useMemo(() => {
    if (!data || data.role === 'ADMIN') return [];
    return data.children.map((child) => ({
      ...child,
      grandkids: data.grandchildren.filter((g) => g.referredBy === child._id)
    }));
  }, [data]);

  // Group the RO's own direct recruits into batches of 12
  const childBatches = useMemo(() => {
    if (!data || data.role === 'ADMIN') return [];
    return groupIntoBatches(childrenWithGrandkids);
  }, [childrenWithGrandkids, data]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  const inviteLink = `${window.location.origin}/register?ref=${data.me.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleChild = (childId) =>
    setExpandedChild((current) => (current === childId ? null : childId));

  const isAdmin = data.role === 'ADMIN';
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;
  const helpPoints = isAdmin ? ADMIN_HELP_POINTS : USER_HELP_POINTS;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className={isAdmin ? 'max-w-6xl mx-auto' : 'max-w-6xl mx-auto'}>

        {/* ---------- HEADER ---------- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHelpOpen(true)}
              className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
            >
              <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[11px] font-semibold">?</span>
              Help
            </button>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* ---------- REFERRAL CARD ---------- */}
        {isAdmin ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Your Referral Code (share this to add ROs)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">
                {data.me.referralCode}
              </code>
              <button
                onClick={copyLink}
                className="text-xs font-semibold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Invite Link'}
              </button>
              <span className="text-xs text-gray-400 break-all">{inviteLink}</span>
            </div>
          </div>
        ) : (
          <>
            <AnnualPurchaseBanner
              hasPurchasedBooks={data.me.hasPurchasedBooks}
              lastPurchaseYear={data.me.lastPurchaseYear}
            />

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-500 text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
                    {getInitials(data.me.name)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{data.me.name}</p>
                    <p className="text-sm text-gray-500">{data.me.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ROLE_STYLES[data.me.role]}`}>
                  {getRoleLabel(data.me.role)}
                </span>
              </div>

              {!data.me.hasPurchasedBooks && data.me.role === 'VOLUNTEER' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
                  You need to purchase your 2 books before you can start recruiting.
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Referral Code</p>
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
          </>
        )}

        {/* ---------- TABS ---------- */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* ---------- ADMIN: NETWORK TAB ---------- */}
        {isAdmin && activeTab === 'network' && (
  <AdminNetworkExplorer
    everyone={data.everyone}
    adminUser={data.me}
    onUpdated={fetchDashboard}
  />
)}

        {/* ---------- ADMIN: REVENUE TAB ---------- */}
        {isAdmin && activeTab === 'revenue' && <RevenueTab />}

        {/* ---------- USER: NETWORK TAB ---------- */}
        {!isAdmin && activeTab === 'network' && (
          <div className="space-y-6">

            {/* Parent */}
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

            {/* Groups (batches of 12) */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-300 flex-shrink-0" />
                Your Recruits ({childrenWithGrandkids.length}) — {childBatches.length} group{childBatches.length === 1 ? '' : 's'}
              </h2>

              {childBatches.length === 0 ? (
                <EmptyRow text="No children yet — share your referral link to start recruiting." />
              ) : (
                <div className="space-y-5">
                  {childBatches.map((batch) => (
                    <BatchGroup
                      key={batch.batchNumber}
                      batch={batch}
                      expandedChild={expandedChild}
                      onToggleChild={toggleChild}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------- USER: PURCHASES TAB ---------- */}
        {!isAdmin && activeTab === 'purchases' && (
          <PurchaseHistoryTab hasPurchasedBooks={data.me.hasPurchasedBooks} />
        )}
      </div>

      {/* ---------- HELP MODAL ---------- */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">How to use this dashboard</h2>
              <button
                onClick={() => setHelpOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {helpPoints.map((point, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{point.title}</p>
                    <p className="text-xs text-gray-500">{point.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setHelpOpen(false)}
              className="mt-5 w-full bg-orange-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   LOCAL SUB-COMPONENTS
   (kept in this same file, not split out, just organized below
   the main component for readability)
   ============================================================ */

function PersonRow({ person }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
        {getInitials(person.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{person.name}</p>
        <p className="text-xs text-gray-400 truncate">{person.email} • {person.contactNumber}</p>
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

function BatchGroup({ batch, expandedChild, onToggleChild }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          batch.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
        }`}>
          Group {batch.batchNumber}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {batch.completedCount}/12 completed
          {batch.isComplete && ' — Completed ✓'}
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
          <div
            className={`h-full rounded-full transition-all ${batch.isComplete ? 'bg-emerald-400' : 'bg-blue-400'}`}
            style={{ width: `${(batch.completedCount / 12) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {batch.members.map((child) => (
          <RecruitRow
            key={child._id}
            child={child}
            isOpen={expandedChild === child._id}
            onToggle={() => onToggleChild(child._id)}
          />
        ))}
      </div>
    </div>
  );
}

function RecruitRow({ child, isOpen, onToggle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
            {getInitials(child.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{child.name}</p>
            <p className="text-xs text-gray-400">{child.email} • {child.contactNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLES[child.role]}`}>
            {child.role}
          </span>
          {child.hasPurchasedBooks ? (
            <span className="text-emerald-600 text-xs font-semibold">✓ Purchased</span>
          ) : (
            <span className="text-amber-600 text-xs font-semibold">Pending</span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {child.grandkids.length} recruit{child.grandkids.length === 1 ? '' : 's'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 pl-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {child.name}'s Recruits
          </p>
          {child.grandkids.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No children yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {child.grandkids.map((gk) => (
                <div key={gk._id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {getInitials(gk.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{gk.name}</p>
                    <p className="text-xs text-gray-400 truncate">{gk.email}</p>
                  </div>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${ROLE_STYLES[gk.role]}`}>
                    {getRoleLabel(gk.role)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}