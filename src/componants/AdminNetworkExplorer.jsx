import { useMemo, useState } from 'react';
import { groupIntoBatches } from '../utils/batchHelpers';
import { getRoleLabel } from '../utils/roleLabels';
import NetworkSearchFilter from './NetworkSearchFilter.jsx';

const ROLE_STYLES = {
  VOLUNTEER: 'bg-gray-100 text-gray-600 border-gray-200',
  RO: 'bg-blue-50 text-blue-700 border-blue-200',
  SO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200'
};

const getInitials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function AdminNetworkExplorer({ everyone, adminUser }) {
  // pathStack holds the drill-down trail. Empty = viewing Admin's own direct recruits.
  const [pathStack, setPathStack] = useState([]);
  const [search, setSearch] = useState('');

  // ---- Stat-card / role-filter driven flat view ----
  // filterRole is null while browsing the normal drill-down tree. Setting it
  // (via a stat card click or the role dropdown) switches to a flat,
  // searchable list instead of the tree/breadcrumb view.
  const [filterRole, setFilterRole] = useState(null); // null | 'ALL' | 'ADMIN_REF' | 'VOLUNTEER' | 'RO' | 'SO'
  const [filterQuery, setFilterQuery] = useState('');

  // A lookup map including a synthetic Admin entry, so ancestor-chain building
  // (used by search) always has a root to terminate at.
  const userMap = useMemo(() => {
    const map = { [adminUser._id]: { ...adminUser, role: 'ADMIN' } };
    everyone.forEach((u) => { map[u._id] = u; });
    return map;
  }, [everyone, adminUser]);

  const childrenByParent = useMemo(() => {
    const map = {};
    everyone.forEach((u) => {
      if (u.referredBy) {
        if (!map[u.referredBy]) map[u.referredBy] = [];
        map[u.referredBy].push(u);
      }
    });
    return map;
  }, [everyone]);

  const currentParent = pathStack.length > 0 ? pathStack[pathStack.length - 1] : adminUser;
  const isRoot = pathStack.length === 0;
  const children = childrenByParent[currentParent._id] || [];

  // Admin's OWN direct recruits are shown flat, individually — they're not
  // subject to the batch-of-12/promotion logic. Everyone else's recruits
  // (at any deeper level) ARE grouped into batches, since that's what
  // actually drives their own RO -> SO promotion.
  const batches = isRoot ? null : groupIntoBatches(children);

  const drillInto = (user) => {
    setPathStack((prev) => [...prev, user]);
    setSearch('');
  };

  const jumpToBreadcrumb = (index) => {
    // index -1 means "go back to root (Admin's own list)"
    if (index === -1) {
      setPathStack([]);
    } else {
      setPathStack((prev) => prev.slice(0, index + 1));
    }
  };

  // Search across the WHOLE network, then jump directly to that person's
  // location by rebuilding their ancestor chain up to (but not including) Admin.
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return everyone
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.referralCode.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [search, everyone]);

  const jumpToUser = (targetUser) => {
    const chain = [];
    let current = targetUser;
    while (current && current.referredBy && userMap[current.referredBy]) {
      const parent = userMap[current.referredBy];
      if (parent.role === 'ADMIN') break; // stop before the synthetic admin entry
      chain.unshift(parent);
      current = parent;
    }
    chain.push(targetUser);
    setPathStack(chain);
    setSearch('');
    setFilterRole(null); // jumping to a member exits filtered mode back into the tree
  };

  const totalCount = everyone.length;
  const roCount = everyone.filter((u) => u.role === 'RO').length;
  const soCount = everyone.filter((u) => u.role === 'SO').length;
  const adminReferredCount = everyone.filter(
    (u) => String(u.referredBy) === String(adminUser._id)
  ).length;

  // Clicking an already-active stat card turns the filter off (back to tree).
  // Clicking a different one switches to that filter.
  const handleStatClick = (role) => {
    setFilterRole((current) => (current === role ? null : role));
    setFilterQuery('');
  };

  // Selecting a role from the dropdown always activates/updates the flat view.
  const handleDropdownRoleChange = (role) => {
    setFilterRole(role);
  };

  const clearFilter = () => {
    setFilterRole(null);
    setFilterQuery('');
  };

  const filteredMembers = useMemo(() => {
    if (!filterRole) return [];

    let base = everyone;
    if (filterRole === 'ADMIN_REF') {
      base = everyone.filter((u) => String(u.referredBy) === String(adminUser._id));
    } else if (filterRole !== 'ALL') {
      base = everyone.filter((u) => u.role === filterRole);
    }

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      base = base.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.regNo || '').toLowerCase().includes(q)
      );
    }

    return base;
  }, [filterRole, filterQuery, everyone, adminUser]);

  const isFilterActive = filterRole !== null;

  return (
    <div>
      {/* ---- Stat overview (clickable filters) ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Admin Referrals"
          value={adminReferredCount}
          color="text-purple-600"
          active={filterRole === 'ADMIN_REF'}
          onClick={() => handleStatClick('ADMIN_REF')}
        />
        <StatCard
          label="Total Members"
          value={totalCount}
          color="text-gray-900"
          active={filterRole === 'ALL'}
          onClick={() => handleStatClick('ALL')}
        />
        <StatCard
          label="Regional Organizers"
          value={roCount}
          color="text-blue-600"
          active={filterRole === 'RO'}
          onClick={() => handleStatClick('RO')}
        />
        <StatCard
          label="State Organizers"
          value={soCount}
          color="text-emerald-600"
          active={filterRole === 'SO'}
          onClick={() => handleStatClick('SO')}
        />
      </div>

      {isFilterActive ? (
        /* ============ FILTERED FLAT VIEW ============ */
        <>
          <NetworkSearchFilter
            query={filterQuery}
            onQueryChange={setFilterQuery}
            role={filterRole === 'ADMIN_REF' ? 'ALL' : filterRole}
            onRoleChange={handleDropdownRoleChange}
          />

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              {filteredMembers.length} member{filteredMembers.length === 1 ? '' : 's'}
            </h2>
            <button
              onClick={clearFilter}
              className="text-xs font-semibold text-orange-600 hover:text-orange-800"
            >
              ← Back to recruits tree
            </button>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-xl p-8 text-sm text-gray-400 italic text-center">
              No members match this filter.
            </div>
          ) : (
            <>
              {/* Desktop / tablet: table */}
              <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-left">
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Member</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Reg No</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Recruits</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => {
                        const recruitCount = (childrenByParent[member._id] || []).length;
                        return (
                          <tr key={member._id} className="border-b border-gray-100 last:border-0 align-top hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {getInitials(member.name)}
                                  
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 whitespace-nowrap">{member.name}</p>
                                  <p className="text-xs text-gray-400 break-all">{member.email}</p>
                                  <p className="text-xs text-gray-400 break-all">{member.contactNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{member.regNo || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${ROLE_STYLES[member.role]}`}>
                                {getRoleLabel(member.role)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {member.hasPurchasedBooks ? (
                                <span className="text-emerald-600 text-xs font-semibold whitespace-nowrap">✓ Helped</span>
                              ) : (
                                <span className="text-amber-600 text-xs font-semibold whitespace-nowrap">Pending</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                              {recruitCount} recruit{recruitCount === 1 ? '' : 's'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => jumpToUser(member)}
                                className="text-xs font-semibold text-orange-600 hover:text-orange-800 whitespace-nowrap"
                              >
                                View in tree →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile: stacked cards */}
              <div className="md:hidden space-y-3">
                {filteredMembers.map((member) => {
                  const recruitCount = (childrenByParent[member._id] || []).length;
                  return (
                    <button
                      key={member._id}
                      onClick={() => jumpToUser(member)}
                      className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {getInitials(member.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
                          <p className="text-xs text-gray-400 truncate">{member.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${ROLE_STYLES[member.role]}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-1.5 text-xs">
                        <span className="text-gray-400 font-mono">{member.regNo || '—'}</span>
                        <span className="text-gray-300">·</span>
                        {member.hasPurchasedBooks ? (
                          <span className="text-emerald-600 font-semibold">✓ Helped</span>
                        ) : (
                          <span className="text-amber-600 font-semibold">Pending</span>
                        )}
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400">{recruitCount} recruit{recruitCount === 1 ? '' : 's'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      ) : (
        /* ============ DRILL-DOWN TREE VIEW (default) ============ */
        <>
          {/* ---- Search (jumps to a member's location in the tree) ---- */}
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="Search a member to jump to their spot in the recruits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-96 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => jumpToUser(u)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {getInitials(u.name)}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${ROLE_STYLES[u.role]}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---- Breadcrumb trail ---- */}
          <div className="flex items-center flex-wrap gap-1 mb-5 text-sm">
            <button
              onClick={() => jumpToBreadcrumb(-1)}
              className={`font-semibold ${isRoot ? 'text-gray-900' : 'text-orange-600 hover:text-orange-800'}`}
            >
              Admin
            </button>
            {pathStack.map((user, i) => (
              <span key={user._id} className="flex items-center gap-1">
                <span className="text-gray-300">/</span>
                <button
                  onClick={() => jumpToBreadcrumb(i)}
                  className={`font-semibold truncate max-w-[140px] ${
                    i === pathStack.length - 1 ? 'text-gray-900' : 'text-orange-600 hover:text-orange-800'
                  }`}
                >
                  {user.name}
                </button>
              </span>
            ))}
          </div>

          {/* ---- Current parent's profile card (only when drilled in) ---- */}
          {!isRoot && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                {getInitials(currentParent.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{currentParent.name}</p>
                <p className="text-xs text-gray-400">{currentParent.email} • {currentParent.contactNumber}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${ROLE_STYLES[currentParent.role]}`}>
                {getRoleLabel(currentParent.role)}
              </span>
              {currentParent.hasPurchasedBooks ? (
                <span className="text-emerald-600 text-xs font-semibold flex-shrink-0">✓ Helped</span>
              ) : (
                <span className="text-amber-600 text-xs font-semibold flex-shrink-0">Pending</span>
              )}
            </div>
          )}

          {/* ---- Section heading ---- */}
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            {isRoot
              ? `Admin's Direct Recruits (${children.length})`
              : `${currentParent.name}'s Recruits (${children.length})${
                  batches ? ` — ${batches.length} group${batches.length === 1 ? '' : 's'}` : ''
                }`}
          </h2>

          {/* ---- Empty state ---- */}
          {children.length === 0 && (
            <div className="border border-dashed border-gray-300 rounded-xl p-8 text-sm text-gray-400 italic text-center">
              No recruits yet.
            </div>
          )}

          {/* ---- ROOT: flat card grid, no batching ---- */}
          {isRoot && children.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {children.map((member) => (
                <MemberCard
                  key={member._id}
                  member={member}
                  recruitCount={(childrenByParent[member._id] || []).length}
                  onClick={() => drillInto(member)}
                />
              ))}
            </div>
          )}

          {/* ---- NON-ROOT: grouped into batches of 12 ---- */}
          {!isRoot && batches && batches.length > 0 && (
            <div className="space-y-6">
              {batches.map((batch) => (
                <div key={batch.batchNumber}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      batch.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      Group {batch.batchNumber}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {batch.completedCount}/12 completed{batch.isComplete ? ' — Completed ✓' : ''}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                      <div
                        className={`h-full rounded-full transition-all ${batch.isComplete ? 'bg-emerald-400' : 'bg-blue-400'}`}
                        style={{ width: `${(batch.completedCount / 12) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {batch.members.map((member) => (
                      <MemberCard
                        key={member._id}
                        member={member}
                        recruitCount={(childrenByParent[member._id] || []).length}
                        onClick={() => drillInto(member)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MemberCard({ member, recruitCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-orange-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
            {getInitials(member.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
            <p className="text-xs text-gray-400 truncate">{member.email}</p>
            <p className="text-xs text-gray-400 truncate">{member.contactNumber}</p>
            {member.regNo && <p className="text-xs text-gray-400">Reg No: {member.regNo}</p>}
            
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_STYLES[member.role]}`}>
          {getRoleLabel(member.role)}
        </span>
        {member.hasPurchasedBooks ? (
          <span className="text-emerald-600 text-[10px] font-semibold">✓ Helped</span>
        ) : (
          <span className="text-amber-600 text-[10px] font-semibold">Pending</span>
        )}
        <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          {recruitCount} recruit{recruitCount === 1 ? '' : 's'}
        </span>
        <span className="text-[10px] text-white bg-gray-400 rounded-full px-2 py-0.5">
          {member.totalBooksThisYear}/202
        </span>
      </div>
    </button>
  );
}

function StatCard({ label, value, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white border rounded-xl p-4 text-left transition-all ${
        active ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-200 hover:border-orange-200'
      }`}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </button>
  );
}