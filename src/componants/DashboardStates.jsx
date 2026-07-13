export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );
}

export function DashboardError({ error, onRetry, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <ErrorIcon type={error.icon} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{error.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{error.message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="text-sm font-semibold bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onLogout}
            className="text-sm font-semibold text-gray-600 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorIcon({ type }) {
  const props = { className: 'w-7 h-7', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 };

  switch (type) {
    case 'wifi':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 18.75h.008" /></svg>;
    case 'clock':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
    case 'lock':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75M6 10.5h12a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5V12A1.5 1.5 0 0 1 6 10.5Z" /></svg>;
    case 'search':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
    case 'server':
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0v.618a2.25 2.25 0 0 1-.659 1.591l-.621.622a2.25 2.25 0 0 1-1.591.659H8.62a2.25 2.25 0 0 1-1.591-.659l-.622-.622a2.25 2.25 0 0 1-.659-1.591v-.618m12 0h-12" /></svg>;
    default:
      return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
  }
}