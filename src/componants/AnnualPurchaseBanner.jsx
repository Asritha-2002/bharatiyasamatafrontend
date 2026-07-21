export default function AnnualPurchaseBanner({ hasPurchasedBooks, lastPurchaseYear, totalBooksThisYear, annualBookTarget }) {
  const currentYear = new Date().getFullYear();
  const purchasedThisYear = lastPurchaseYear === currentYear;

  const TOTAL_REQUIRED = annualBookTarget || 202; // fallback only if settings haven't loaded yet
  const booksPurchasedSoFar = purchasedThisYear ? (totalBooksThisYear || 0) : 0;
  const booksRemaining = Math.max(TOTAL_REQUIRED - booksPurchasedSoFar, 0);
  const progressPercent = Math.min(Math.round((booksPurchasedSoFar / TOTAL_REQUIRED) * 100), 100);

  const isFullyDone = booksRemaining <= 0;

  if (isFullyDone) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none flex-shrink-0">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-red-800 text-sm">
            Annual book requirement — {currentYear}
          </p>
          <p className="text-red-700 text-sm mt-0.5">
            Every member is expected to help <strong>{TOTAL_REQUIRED} books</strong> per calendar year.
            {booksPurchasedSoFar > 0
              ? ` You've helped ${booksPurchasedSoFar} books so far — ${booksRemaining} remaining.`
              : ` You haven't helped any books yet this year — ${booksRemaining} remaining.`}
          </p>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-red-600 font-medium mb-1">
              <span>{booksPurchasedSoFar} / {TOTAL_REQUIRED} books</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}