'use client';

import type { Space } from '@/types/booking';
import {
  getSpaceAmenities,
  getSpaceCategoryStyle,
  getSpaceDescription,
  getSpaceFloor,
} from '@/lib/spaceMeta';

interface SpaceDetailModalProps {
  space: Space;
  onClose: () => void;
  onBook: () => void;
}

export default function SpaceDetailModal({ space, onClose, onBook }: SpaceDetailModalProps) {
  const isAvailable = space.status === 'available';
  const { category, badge, icon, iconBg } = getSpaceCategoryStyle(space.type);
  const amenities = getSpaceAmenities(space.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${iconBg}`}
            >
              {icon}
            </div>
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                {category}
              </span>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{space.name}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <p className="text-sm leading-7 text-slate-600">{getSpaceDescription(space)}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-sm">
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="mt-1 font-medium text-slate-900">{space.location}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Capacity</dt>
            <dd className="mt-1 font-medium text-slate-900">{space.capacity} people</dd>
          </div>
          <div>
            <dt className="text-slate-500">Floor</dt>
            <dd className="mt-1 font-medium text-slate-900">{getSpaceFloor(space.location)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-1 font-medium capitalize text-slate-900">{space.status}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-900">Amenities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={onBook}
            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
