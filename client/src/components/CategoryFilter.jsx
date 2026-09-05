export default function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
          active === null ? 'bg-tg-button text-tg-buttonText' : 'bg-tg-secondaryBg text-tg-text'
        }`}
      >
        Barchasi
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
            active === cat.id ? 'bg-tg-button text-tg-buttonText' : 'bg-tg-secondaryBg text-tg-text'
          }`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  );
}
