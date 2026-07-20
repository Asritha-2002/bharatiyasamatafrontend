import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnnualPurchaseBanner from '../componants/AnnualPurchaseBanner.jsx';
import PurchaseHistoryTab from '../componants/PurchaseHistory.jsx';
import Tabs from '../componants/Tabs.jsx';
import HelpModal from '../componants/HelpModal.jsx';
import { OfflineBanner, SlowConnectionNotice, DashboardIssueCard } from '../componants/ConnectionNotice.jsx';
import { DashboardLoading } from '../componants/DashboardStates.jsx';
import { getInitials, ROLE_STYLES } from '../utils/dashboardHelpers.js';
import { groupIntoBatches } from '../utils/batchHelpers.js';
import { getRoleLabel } from '../utils/roleLabels.js';
import { useDashboardData } from '../hooks/useDashboardData.js';

const USER_TABS = [
  { key: 'network', label: 'My Network' },
  { key: 'purchases', label: 'Books Helped History' }
];

const USER_HELP_POINTS = [
  { title: 'Your Recruitment Code', text: "Share your unique recruitment code or invite link with new people you want to bring into your network." },
  { title: 'My Network Tab', text: "See your parent (who recruited you) and everyone you've personally recruited, grouped into batches of 12." },
  { title: 'Books Helped History Tab', text: 'Check your book helped records and confirm your annual books helped status here.' },
  { title: 'Groups & Batches', text: 'Recruits are automatically organized into groups of 12. A group is marked "Completed" once all 12 members have purchased their books.' },
  { title: 'Expanding a Recruit', text: "Click on any recruit's row to see their own recruits (your grandkids in the network)." },
  { title: 'Getting Promoted', text: "Your invite link becomes active once you're promoted to RO. Until then, focus on completing your book purchase." }
];

// Kept as a stable module-level function (rather than an inline arrow in the
// component) so its identity never changes across renders -- otherwise
// useDashboardData's fetchDashboard would be recreated every render and
// re-fetch in a loop.
function redirectIfAdmin(data) {
  return data.role === 'ADMIN' ? '/admin' : null;
}

export default function UserDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data, error, loading, isOnline, slowConnection, fetchDashboard } = useDashboardData({
    navigate,
    guard: redirectIfAdmin,
  });

  const [copied, setCopied] = useState(false);
  const [expandedChild, setExpandedChild] = useState(null);
  const [activeTab, setActiveTab] = useState('network');
  const [helpOpen, setHelpOpen] = useState(false);

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

  const toggleChild = (childId) =>
    setExpandedChild((current) => (current === childId ? null : childId));

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
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ROLE_STYLES[data.me.role]}`}>
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

            <Tabs tabs={USER_TABS} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'network' && (
              <div className="space-y-6">
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

            {activeTab === 'purchases' && (
              <PurchaseHistoryTab
                myRegNo={data.me.regNo}
                parentRegNo={data.parent?.regNo}
                hasPurchasedBooks={data.me.hasPurchasedBooks}
              />
            )}
          </>
        )}
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} points={USER_HELP_POINTS} />
    </div>
  );
}

/* ---- Local sub-components ---- */

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

function BatchGroup({ batch, expandedChild, onToggleChild }) {
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

      <div className="space-y-2">
        {batch.members.map((child) => (
          <RecruitRow key={child._id} child={child} isOpen={expandedChild === child._id} onToggle={() => onToggleChild(child._id)} />
        ))}
      </div>
    </div>
  );
}

function RecruitRow({ child, isOpen, onToggle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
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
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLES[child.role]}`}>{child.role}</span>
          {child.hasPurchasedBooks ? (
            <span className="text-emerald-600 text-xs font-semibold">✓ Helped</span>
          ) : (
            <span className="text-amber-600 text-xs font-semibold">Pending</span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {child.grandkids.length} recruit{child.grandkids.length === 1 ? '' : 's'}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 pl-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{child.name}'s Recruits</p>
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