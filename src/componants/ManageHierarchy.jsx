import { useState, useMemo } from 'react';
import api from '../api/axios.js';
import { groupIntoBatches } from '../utils/batchHelpers';

const ROLE_STYLES = {
  VOLUNTEER: 'bg-gray-100 text-gray-600 border-gray-200',
  RO: 'bg-blue-50 text-blue-700 border-blue-200',
  SO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200'
};

const getInitials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function ManageHierarchy() {
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (regNoToSearch) => {
    const trimmed = (regNoToSearch ?? searchInput).trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.get(`/admin/hierarchy/${encodeURIComponent(trimmed)}`);
      setResult(res.data);
      setSearchInput(trimmed);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find that member.');
    } finally {
      setLoading(false);
    }
  };

  // Build a parent -> children lookup from the flat descendants array
  const childrenByParent = useMemo(() => {
    if (!result) return {};
    const map = {};
    result.descendants.forEach((u) => {
      const pid = String(u.referredBy);
      if (!map[pid]) map[pid] = [];
      map[pid].push(u);
    });
    return map;
  }, [result]);

  return (
    <div>
      <style>{`
        .oc-children {
          display: flex;
          padding-top: 28px;
          position: relative;
          justify-content: center;
        }
        .oc-children::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          width: 1px; height: 14px;
          background: #d1d5db;
          transform: translateX(-50%);
        }
        .oc-child {
          position: relative;
          padding-top: 14px;
          margin: 0 14px;
        }
        .oc-child::before {
          content: '';
          position: absolute;
          top: 0; left: -14px; right: -14px;
          height: 1px;
          background: #d1d5db;
        }
        .oc-child:only-child::before { left: 50%; right: 50%; }
        .oc-child:first-child:not(:only-child)::before { left: 50%; }
        .oc-child:last-child:not(:only-child)::before { right: 50%; }
        .oc-child::after {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          width: 1px; height: 14px;
          background: #d1d5db;
        }
      `}</style>

      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Hierarchy Lookup</h2>
        <p className="text-xs text-gray-400 mb-4">
          Enter any member's Registration ID to see their full position in the network — everyone above them and their entire downline.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. AP26BS0042"
            className="flex-1 sm:flex-none sm:w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="text-sm font-semibold bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">

          {/* ---- Ancestor chain ---- */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ancestor Chain</h3>
            <div className="flex items-center flex-wrap gap-1 text-sm bg-white border border-gray-200 rounded-xl p-4">
              <span className="font-semibold text-gray-400">Admin</span>
              {result.ancestors.map((a) => (
                <span key={a._id} className="flex items-center gap-1">
                  <span className="text-gray-300">/</span>
                  <button
                    onClick={() => handleSearch(a.regNo)}
                    className="font-semibold text-orange-600 hover:text-orange-800"
                  >
                    {a.name} <span className="text-gray-400 font-normal">({a.regNo})</span>
                  </button>
                </span>
              ))}
              <span className="flex items-center gap-1">
                <span className="text-gray-300">/</span>
                <span className="font-bold text-gray-900">
                  {result.target.name} <span className="text-gray-400 font-normal">({result.target.regNo})</span>
                </span>
              </span>
            </div>
          </div>

          {/* ---- Full tree diagram, rooted at the searched member ---- */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Network Tree ({result.descendants.length} total below this member)
            </h3>

            <div className="bg-white border border-gray-200 rounded-xl p-8 overflow-x-auto">
              <div className="flex justify-center min-w-max">
                <OrgChartNode
                  user={result.target}
                  childrenByParent={childrenByParent}
                  isRoot={true}
                  onFocus={handleSearch}
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function MemberCard({ user, onFocus, highlighted }) {
  return (
    <div
      className={`bg-white border rounded-lg px-3 py-2 flex flex-col items-center gap-1 w-[130px] ${
        highlighted ? 'border-2 border-orange-400 shadow-sm' : 'border-gray-200'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center">
        {getInitials(user.name)}
      </div>
      <p className="font-semibold text-gray-900 text-xs text-center truncate w-full">{user.name}</p>
      <p className="text-[10px] text-gray-400 font-mono">{user.regNo}</p>
      <div className="flex items-center gap-1">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${ROLE_STYLES[user.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {user.role}
        </span>
        {user.hasPurchasedBooks !== undefined && (
          user.hasPurchasedBooks
            ? <span className="text-emerald-600 text-[10px]">✓</span>
            : <span className="text-amber-500 text-[10px]">•</span>
        )}
      </div>
      {onFocus && !highlighted && (
        <button
          onClick={() => onFocus(user.regNo)}
          className="text-[9px] text-gray-400 hover:text-orange-600 underline"
        >
          focus
        </button>
      )}
    </div>
  );
}

function GroupBadge({ batch }) {
  return (
    <div className="flex flex-col items-center gap-1 mb-2">
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
        batch.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
      }`}>
        Group {batch.batchNumber}
      </span>
      <span className="text-[10px] text-gray-400 font-medium">
        {batch.completedCount}/12{batch.isComplete ? ' ✓' : ''}
      </span>
    </div>
  );
}

function OrgChartNode({ user, childrenByParent, isRoot = false, onFocus }) {
  const children = childrenByParent[String(user._id)] || [];
  const isAdminNode = user.role === 'ADMIN';

  // Admin's direct recruits are never grouped into batches — grouping only
  // applies to a regular member's own recruiting activity.
  const batches = isAdminNode ? null : groupIntoBatches(children);

  // Only wrap in visible "Group" boxes once there's more than one batch,
  // or the single batch is fully completed. A lone partial batch (e.g. 3
  // people, nowhere near 12) is just shown as plain individual members.
  const shouldShowGroups =
    !isAdminNode && batches && (batches.length > 1 || (batches.length === 1 && batches[0].isComplete));

  return (
    <div className="flex flex-col items-center">
      <MemberCard user={user} onFocus={onFocus} highlighted={isRoot} />

      {children.length > 0 && (
        <div className="oc-children">
          {shouldShowGroups ? (
            batches.map((batch) => (
              <div key={batch.batchNumber} className="oc-child">
                <div className="flex flex-col items-center">
                  <GroupBadge batch={batch} />
                  <div className="oc-children">
                    {batch.members.map((member) => (
                      <div key={member._id} className="oc-child">
                        <OrgChartNode user={member} childrenByParent={childrenByParent} onFocus={onFocus} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            children.map((child) => (
              <div key={child._id} className="oc-child">
                <OrgChartNode user={child} childrenByParent={childrenByParent} onFocus={onFocus} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}