import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="px-5 pt-2 pb-3">
      {/* Pill Search Input */}
      <div className="relative flex items-center bg-white dark:bg-[#1E1E22] rounded-full px-4 py-3 border border-gray-100 dark:border-white/10 shadow-[0_4px_18px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all focus-within:border-[#8B1121]/50 dark:focus-within:border-[#ff4d6d]/50 focus-within:shadow-[0_4px_20px_rgba(139,17,33,0.1)]">
        <Search
          size={18}
          strokeWidth={2.2}
          className="text-gray-400 dark:text-zinc-500 shrink-0 mr-3 transition-colors"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Qidiruv"
          className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-hidden"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 active:scale-90 transition rounded-full ml-1"
            aria-label="Tozalash"
          >
            <X size={15} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}
