

export default function NetworkSearchFilter({ query, onQueryChange}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <input
        type="text"
        placeholder="Search by name, email, or Reg No..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>
  );
}