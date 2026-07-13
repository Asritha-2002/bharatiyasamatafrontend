const ICONS = {
  network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5v4M12 11.5 6.8 17M12 11.5 17.2 17" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 20h18M6 20V10M12 20V4M18 20v-7" />
    </svg>
  ),
  blogs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 19.5V6a2 2 0 0 1 2-2h9l5 5v10.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M14 4v5h5M8 13h8M8 17h5" />
    </svg>
  ),
  banner: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16-5.5-5.5L7 19" />
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="13" height="13" rx="2" />
      <path d="M8 21h10a2 2 0 0 0 2-2V9" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  ),
};

export default function AdminSidebar({ items, activeKey, onNavigate }) {
  return (
    <aside className="w-full md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col md:h-screen sticky top-0 z-20">
      {/* Brand Logo Section: Hidden on mobile since header already occupies top space */}
      <div className="h-16 hidden md:flex items-center px-6 border-b border-gray-200">
        <span className="text-lg font-bold text-gray-900">Admin</span>
      </div>

      {/* Navigation Layout: Horizontal scroll on mobile, Vertical stack on desktop */}
      <nav className="flex flex-row md:flex-col px-3 py-2 md:py-4 gap-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto style-scrollbar-none">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium text-left transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={isActive ? 'text-orange-500' : 'text-gray-400'}>{ICONS[item.key]}</span>
              <span>{item.label}</span>
              {!item.implemented && (
                <span className="text-[9px] md:text-[10px] uppercase tracking-wide font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1 md:ml-0">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}