export default function PendingSection({ title, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-orange-500"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}