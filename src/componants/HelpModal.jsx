export default function HelpModal({ open, onClose, points }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">How to use this dashboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="Close">×</button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {points.map((point, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{point.title}</p>
                <p className="text-xs text-gray-500">{point.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-orange-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}