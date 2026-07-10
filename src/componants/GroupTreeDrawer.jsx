import { useMemo, useState } from 'react';
import { groupIntoBatches } from '../utils/batchHelpers';
import { getRoleLabel } from '../utils/roleLabels';

const roleStyles = {
  VOLUNTEER: 'bg-gray-100 text-gray-600 border-gray-200',
  RO: 'bg-blue-50 text-blue-700 border-blue-200',
  SO: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function GroupTreeDrawer({ open, onClose, rootUser, allUsers }) {
  const childrenByParent = useMemo(() => {
    const map = {};
    allUsers.forEach((u) => {
      if (u.referredBy) {
        const pid = typeof u.referredBy === 'object' ? u.referredBy._id : u.referredBy;
        if (!map[pid]) map[pid] = [];
        map[pid].push(u);
      }
    });
    return map;
  }, [allUsers]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Network Tree</p>
            <p className="font-bold text-gray-900">{rootUser?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {rootUser && (
            <TreeNode
              user={rootUser}
              childrenByParent={childrenByParent}
              depth={0}
              defaultOpen={true}
            />
          )}
        </div>
      </div>
    </>
  );
}

function TreeNode({ user, childrenByParent, depth, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const children = childrenByParent[user._id] || [];

  // Admin isn't subject to the batch-of-12/promotion logic at all — their direct
  // recruits are just individually recruited ROs, not a "group." Only a regular
  // person's own recruiting activity gets bucketed into batches of 12.
  const skipBatching = user.role === 'ADMIN';
  const batches = skipBatching ? null : groupIntoBatches(children);

  return (
    <div className={depth > 0 ? 'mt-3 pl-4 border-l-2 border-gray-100' : ''}>
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <button
          onClick={() => children.length > 0 && setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleStyles[user.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {getRoleLabel(user.role)}
            </span>
            {user.hasPurchasedBooks !== undefined && (
              user.hasPurchasedBooks
                ? <span className="text-emerald-600 text-[10px] font-semibold">✓</span>
                : <span className="text-amber-600 text-[10px] font-semibold">•</span>
            )}
            {children.length > 0 && (
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </button>

        {children.length === 0 && (
          <p className="text-xs text-gray-400 italic mt-2 pl-10">No recruits yet.</p>
        )}
      </div>

      {open && children.length > 0 && (
        <div className="mt-2 space-y-3">
          {skipBatching ? (
            // ---- Admin's direct recruits: plain individual list, no grouping ----
            <div className="pl-4 space-y-2">
              {children.map((member) => (
                <TreeNode
                  key={member._id}
                  user={member}
                  childrenByParent={childrenByParent}
                  depth={depth + 1}
                />
              ))}
            </div>
          ) : (
            // ---- Everyone else: batched into groups of 12 ----
            batches.map((batch) => (
              <div key={batch.batchNumber} className="pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    batch.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Group {batch.batchNumber}
                  </span>
                  <span className="text-xs text-gray-400">
                    {batch.completedCount}/12 completed{batch.isComplete ? ' — Completed ✓' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {batch.members.map((member) => (
                    <TreeNode
                      key={member._id}
                      user={member}
                      childrenByParent={childrenByParent}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}