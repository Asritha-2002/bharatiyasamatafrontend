// Small pieces for communicating connectivity problems inside the main
// content area (sidebar + header stay visible and usable throughout).

export function OfflineBanner({ onRetry }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 shrink-0"
        >
          <path d="M3 8.5a16 16 0 0 1 18 0M6.5 12a11 11 0 0 1 11 0M10 15.5a6 6 0 0 1 4 0" />
          <path d="M12 19h.01" />
          <path d="M2 2l20 20" />
        </svg>
        <span>You're offline. Some actions won't work until your connection is back.</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-semibold uppercase tracking-wide text-red-700 hover:text-red-900 shrink-0"
      >
        Retry
      </button>
    </div>
  );
}

export function SlowConnectionNotice({ onRetry }) {
  return (
    <div className="mt-4 flex flex-col items-center text-center gap-2">
      <p className="text-sm text-gray-500">Still working — this is taking longer than usual. Your connection may be slow.</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-semibold uppercase tracking-wide text-orange-600 hover:text-orange-700"
      >
        Retry now
      </button>
    </div>
  );
}

// Full card shown in place of dashboard content when the data request itself
// fails. `error` is expected to look like { type: 'offline' | 'network' | 'server', title, message }.
export function DashboardIssueCard({ error, onRetry, onLogout }) {
  const isConnectivity = error?.type === 'offline' || error?.type === 'network';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isConnectivity ? 'bg-red-50' : 'bg-orange-50'}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-6 h-6 ${isConnectivity ? 'text-red-500' : 'text-orange-500'}`}
        >
          {isConnectivity ? (
            <>
              <path d="M3 8.5a16 16 0 0 1 18 0M6.5 12a11 11 0 0 1 11 0M10 15.5a6 6 0 0 1 4 0" />
              <path d="M12 19h.01" />
              <path d="M2 2l20 20" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </>
          )}
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">{error?.title || 'Something went wrong'}</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        {error?.message || 'An unexpected error occurred while loading the dashboard.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm font-semibold text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}