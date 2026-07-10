export default function PurchaseHistoryTab({ hasPurchasedBooks }) {
  return (
    <div className="space-y-6">

      {/* Buy books CTA — static, payment gateway not wired up yet */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 text-xl">
          📚
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Purchase Books</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
          Online book purchases will be available here once payment processing is connected.
        </p>
        <button
          disabled
          className="bg-gray-200 text-gray-500 font-semibold text-sm px-5 py-2.5 rounded-lg cursor-not-allowed"
        >
          Buy Books — Coming Soon
        </button>
      </div>

      {/* Purchase history — static placeholder list */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Purchase History</h3>
        </div>

        {hasPurchasedBooks ? (
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Registration Purchase</p>
                <p className="text-xs text-gray-400">Verified by Admin</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-600">2 books</p>
                <p className="text-xs text-gray-400">Confirmed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400 italic">No purchases recorded yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}