export default function RevenueTab() {
  return (
    <div className="space-y-6">

      {/* Work-in-progress banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
        <span className="text-lg leading-none">🚧</span>
        <div>
          <p className="font-semibold text-amber-800 text-sm">Payment gateway not yet connected</p>
          <p className="text-amber-700 text-xs mt-0.5">
            Revenue and books-sold figures below are placeholders. This section will populate automatically once online payments go live.
          </p>
        </div>
      </div>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <PlaceholderStat label="Total Revenue" />
        <PlaceholderStat label="Books Sold" />
        <PlaceholderStat label="Transactions" />
        <PlaceholderStat label="Avg. Order Value" />
      </div>

      {/* Placeholder chart area */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[220px]">
        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-2xl mb-3">
          📊
        </div>
        <p className="font-semibold text-gray-700 text-sm">Revenue chart will appear here</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Once the payment gateway is integrated, monthly revenue and book-sale trends will be shown in this section.
        </p>
      </div>

      {/* Placeholder transaction table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Recent Transactions</h3>
        </div>
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-gray-400 italic">Work pending — no payment data available yet.</p>
        </div>
      </div>

    </div>
  );
}

function PlaceholderStat({ label }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-300">—</p>
    </div>
  );
}