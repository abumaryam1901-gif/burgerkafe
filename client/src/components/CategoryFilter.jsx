export default function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs ${
          active === null
            ? 'bg-[#8B1121] dark:bg-[#A61427] text-white shadow-sm'
            : 'bg-white dark:bg-[#1E1E22] text-gray-700 dark:text-zinc-300 border border-gray-200/70 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800'
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
              ? 'bg-[#8B1121] dark:bg-[#A61427] text-white shadow-sm'
              : 'bg-white dark:bg-[#1E1E22] text-gray-700 dark:text-zinc-300 border border-gray-200/70 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
