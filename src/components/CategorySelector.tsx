'use client';

import { useState, useMemo } from 'react';
import type { Category, SignalType } from '@/types';

interface Props {
  categories: Category[];
  selectedCategoryId: string;
  selectedTypeId: string;
  onCategoryChange: (id: string) => void;
  onTypeChange: (id: string) => void;
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  selectedTypeId,
  onCategoryChange,
  onTypeChange,
}: Props) {
  const [search, setSearch] = useState('');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Build flat search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const results: { category: Category; type: SignalType }[] = [];
    for (const cat of categories) {
      for (const type of cat.types) {
        if (
          cat.name.toLowerCase().includes(q) ||
          type.name.toLowerCase().includes(q)
        ) {
          results.push({ category: cat, type });
        }
      }
    }
    return results;
  }, [search, categories]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700">
        Категория на сигнала <span className="text-red-500">*</span>
      </label>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Търсене на категория/тип..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
        />
      </div>

      {/* Search results */}
      {search.trim() && searchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
          {searchResults.slice(0, 15).map(({ category, type }) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                onCategoryChange(category.id);
                onTypeChange(type.id);
                setSearch('');
              }}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm ${
                selectedTypeId === type.id ? 'bg-blue-50 border-l-4 border-l-[#2d4a7a]' : ''
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              <span className="font-medium text-slate-700">{category.name}</span>
              <span className="text-slate-400 mx-1">→</span>
              <span className="text-slate-600">{type.name}</span>
            </button>
          ))}
        </div>
      )}

      {search.trim() && searchResults.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          Не са намерени резултати за &quot;{search}&quot;
        </p>
      )}

      {/* Category grid (when not searching) */}
      {!search.trim() && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onCategoryChange(cat.id);
                  onTypeChange('');
                }}
                className={`category-card text-left p-3 rounded-xl border-2 ${
                  selectedCategoryId === cat.id
                    ? 'selected border-[#2d4a7a]'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <p className="text-xs font-medium text-slate-700 mt-1 leading-tight">
                  {cat.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {cat.types.length} типа
                </p>
              </button>
            ))}
          </div>

          {/* Type selector */}
          {selectedCategory && selectedCategory.types.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Тип
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => onTypeChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:border-[#2d4a7a] transition-colors"
              >
                <option value="">Моля, изберете тип...</option>
                {selectedCategory.types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
