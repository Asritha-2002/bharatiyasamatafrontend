const ROLE_OPTIONS = [
  { value: 'ALL', label: 'All Members' },
  { value: 'VOLUNTEER', label: 'Volunteers' },
  { value: 'RO', label: 'Regional Organizers (RO)' },
  { value: 'SO', label: 'State Organizers (SO)' },
];

export default function NetworkSearchFilter({ query, onQueryChange, role, onRoleChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <input
        type="text"
        placeholder="Search by name, email, or Reg No..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 sm:w-56"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}