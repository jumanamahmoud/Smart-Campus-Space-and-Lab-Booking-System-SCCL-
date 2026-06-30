'use client';

import type { Space } from '@/types/booking';

interface RoomCatalogProps {
  spaces: Space[];
  onBook: (space: Space) => void;
  loading?: boolean;
}

export default function RoomCatalog({ spaces, onBook, loading }: RoomCatalogProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-xl border border-gray-100 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">No campus spaces are available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {spaces.map((space) => {
        const isAvailable = space.status === 'available';

        return (
          <article
            key={space.id}
            className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{space.location}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  isAvailable
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {isAvailable ? 'Available' : 'Maintenance'}
              </span>
            </div>

            <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium text-gray-900">{space.type}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Capacity</dt>
                <dd className="font-medium text-gray-900">{space.capacity} people</dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => onBook(space)}
              className="mt-auto rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAvailable ? 'Book this space' : 'Unavailable'}
            </button>
          </article>
        );
      })}
    </div>
  );
}
