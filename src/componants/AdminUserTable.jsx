import { useMemo, useState } from 'react';
import api from '../api/axios.js';
import { groupIntoBatches } from '../utils/batchHelpers';
import { getRoleLabel } from '../utils/roleLabels';
import GroupTreeDrawer from './GroupTreeDrawer';

export default function AdminUserTable({ users, onUpdated }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [drawerUser, setDrawerUser] = useState(null);

  const enrichedUsers = useMemo(() => {
    const userMap = {};
    users.forEach((u) => { userMap[u._id] = u; });

    const childrenByParent = {};
    users.forEach((u) => {
      if (u.referredBy) {
        if (!childrenByParent[u.referredBy]) childrenByParent[u.referredBy] = [];
        childrenByParent[u.referredBy].push(u);
      }
    });

    return users.map((u) => {
      const parent = u.referredBy ? userMap[u.referredBy] : null;
      const parentName = u.referredBy ? (parent ? parent.name : 'Admin (Root)') : 'Admin (Root)';

      let depth = 1;
      let current = u;
      while (current.referredBy && userMap[current.referredBy]) {
        depth++;
        current = userMap[current.referredBy];
      }

      // Each individual member's OWN recruits are grouped into batches of 12 —
      // this is correct regardless of the fix above, since these are all
      // regular RO/SO members, not the Admin root.
      const children = childrenByParent[u._id] || [];
      const batches = groupIntoBatches(children);
      const completedBatches = batches.filter((b) => b.isComplete).length;

      return { ...u, parentName, depth, batches, completedBatches, recruitCount: children.length };
    });
  }, [users]);

  const filteredUsers = enrichedUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.referralCode.toLowerCase().includes(q) ||
      u.parentName.toLowerCase().includes(q)
    );
  });

  const confirmPurchase = async (userId) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/confirm-purchase`);
      onUpdated();
    } catch (err) {
      alert('Failed to update purchase status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const roleStyles = {
    VOLUNTEER: 'bg-gray-100 text-gray-600 border-gray-200',
    RO: 'bg-blue-50 text-blue-700 border-blue-200',
    SO: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const getInitials = (name) =>
    name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const totalCount = users.length;
  const roCount = users.filter((u) => u.role === 'RO').length;
  const soCount = users.filter((u) => u.role === 'SO').length;
  const pendingCount = users.filter((u) => !u.hasPurchasedBooks).length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Members" value={totalCount} color="text-gray-900" />
        <StatCard label="Regional Organizers" value={roCount} color="text-blue-600" />
        <StatCard label="State Organizers" value={soCount} color="text-emerald-600" />
        <StatCard label="Pending Purchase" value={pendingCount} color="text-amber-600" />
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, referral code, or recruiter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Member</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Invited By</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Level</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Referral Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Purchase</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Groups</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {users.length === 0 ? 'No members have registered yet.' : 'No results match your search.'}
                  </td>
                </tr>
              )}

              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                        <p className="text-xs text-gray-400">{u.contactNumber}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={u.parentName === 'Admin (Root)' ? 'text-purple-600 font-medium text-xs' : 'text-gray-700 text-xs'}>
                      {u.parentName}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                      {u.depth}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${roleStyles[u.role]}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{u.referralCode}</td>

                  <td className="px-4 py-3">
                    {u.hasPurchasedBooks ? (
                      <span className="text-emerald-600 text-xs font-semibold">✓ Purchased</span>
                    ) : (
                      <span className="text-amber-600 text-xs font-semibold">Pending</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {u.recruitCount > 0 ? (
                      <span className="text-xs font-semibold text-gray-700">
                        {u.batches.length} group{u.batches.length === 12 ? '' : 's'}
                        {u.completedBatches > 0 && (
                          <span className="text-emerald-600"> ({u.completedBatches} done)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!u.hasPurchasedBooks && (
                        <button
                          onClick={() => confirmPurchase(u._id)}
                          disabled={updatingId === u._id}
                          className="text-xs font-semibold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-60 whitespace-nowrap"
                        >
                          {updatingId === u._id ? 'Updating...' : 'Confirm Purchase'}
                        </button>
                      )}

                      {u.recruitCount > 0 && (
                        <button
                          onClick={() => setDrawerUser(u)}
                          title="View network tree"
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GroupTreeDrawer
        open={!!drawerUser}
        onClose={() => setDrawerUser(null)}
        rootUser={drawerUser}
        allUsers={users}
      />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}