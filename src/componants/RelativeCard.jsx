export default function RelativeCard({ person, showProgress, batchInfo }) {
  if (!person) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-400 italic text-center">
        No {batchInfo || 'data'} yet.
      </div>
    );
  }

  const roleColors = {
    VOLUNTEER: 'bg-gray-100 text-gray-700',
    RO: 'bg-blue-100 text-blue-700',
    SO: 'bg-green-100 text-green-700',
    ADMIN: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-gray-900">{person.name}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleColors[person.role] || 'bg-gray-100 text-gray-700'}`}>
          {person.role}
        </span>
      </div>
      <p className="text-xs text-gray-500">{person.email}</p>
      <p className="text-xs text-gray-500">{person.contactNumber}</p>

      {showProgress && (
        <p className="text-xs mt-2 font-medium">
          {person.hasPurchasedBooks ? (
            <span className="text-green-600">✓ Books purchased</span>
          ) : (
            <span className="text-amber-600">Pending purchase</span>
          )}
        </p>
      )}
    </div>
  );
}