export default function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs ${
          active === null
            ? 'bg-[#8B1121] text-white shadow-sm'
            : 'bg-white text-gray-700 border border-gray-200/70 hover:bg-gray-50'
        }`}
      >
        Barchasi
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs ${
            active === cat.id
              ? 'bg-[#8B1121] text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-200/70 hover:bg-gray-50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
