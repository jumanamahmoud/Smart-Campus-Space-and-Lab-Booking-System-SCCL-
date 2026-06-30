'use client';

import { getSpaceCategoryStyle } from '@/lib/spaceMeta';
import type { Space } from '@/types/booking';

interface SpaceManagerProps {
  spaces: Space[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (space: Space) => void;
  onDelete: (spaceId: string) => Promise<void>;
  deletingId?: string | null;
}

export default function SpaceManager({
  spaces,
  loading,
  onAdd,
  onEdit,
  onDelete,
  deletingId,
}: SpaceManagerProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          className="sccl-btn-primary"
        >
          + Add Space
        </button>
      </div>

      {spaces.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center sccl-card-lg">
          <p className="text-sm text-slate-500">No spaces registered yet. Add your first space.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {spaces.map((space) => {
            const { category, badge } = getSpaceCategoryStyle(space.type);
            const isAvailable = space.status === 'available';

            return (
              <article
                key={space.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{space.name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
                      {category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Maintenance'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {space.location} · Cap. {space.capacity}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(space)}
                    className="sccl-btn-secondary px-4 py-2"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(space.id)}
                    disabled={deletingId === space.id}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === space.id ? 'Deleting...' : 'Delete'}
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
