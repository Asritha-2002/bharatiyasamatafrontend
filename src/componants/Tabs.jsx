export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors relative ${
                isActive
                  ? 'text-orange-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}