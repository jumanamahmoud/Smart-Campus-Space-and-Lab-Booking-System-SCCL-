'use client';

import type { Space } from '@/types/booking';
import {
  FILTER_CATEGORIES,
  type FilterCategory,
  getSpaceAmenities,
  getSpaceCategoryStyle,
  getSpaceDescription,
  getSpaceFloor,
  matchesFilter,
  matchesSearch,
} from '@/lib/spaceMeta';
import { useMemo, useState } from 'react';

interface RoomCatalogProps {
  spaces: Space[];
  onBook: (space: Space) => void;
  onViewDetails: (space: Space) => void;
  loading?: boolean;
  availableOnly?: boolean;
}

export default function RoomCatalog({
  spaces,
  onBook,
  onViewDetails,
  loading,
  availableOnly = false,
}: RoomCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All Types');

  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      if (availableOnly && space.status !== 'available') return false;
      return matchesSearch(space, searchQuery) && matchesFilter(space, activeFilter);
    });
  }, [spaces, searchQuery, activeFilter, availableOnly]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
          />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search rooms or buildings..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_CATEGORIES.map((category) => {
          const isActive = activeFilter === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveFilter(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredSpaces.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No rooms match your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredSpaces.map((space) => {
            const isAvailable = space.status === 'available';
            const { category, badge, icon, iconBg } = getSpaceCategoryStyle(space.type);
            const amenities = getSpaceAmenities(space.type);

            return (
              <article
                key={space.id}
                className="flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${iconBg}`}
                  >
                    {icon}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                    {category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{space.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {getSpaceDescription(space)}
                </p>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">📍</span>
                    <span>{space.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">👥</span>
                      <span>Cap. {space.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">🏢</span>
                      <span>{getSpaceFloor(space.location)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {!isAvailable && (
                  <p className="mt-3 text-xs font-medium text-amber-600">
                    Currently under maintenance
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => onViewDetails(space)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => onBook(space)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Book Now
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
