'use client';

import { useState } from 'react';
import type { SpaceFormData } from '@/types/admin';
import type { Space, SpaceStatus } from '@/types/booking';
import { SPACE_STATUSES, SPACE_TYPES } from '@/lib/admin';

interface SpaceFormModalProps {
  space?: Space | null;
  onClose: () => void;
  onSubmit: (data: SpaceFormData) => Promise<void>;
  submitting?: boolean;
}

const emptyForm: SpaceFormData = {
  name: '',
  location: '',
  capacity: 10,
  type: 'Lab',
  status: 'available',
};

const fieldClass = 'sccl-input';

export default function SpaceFormModal({
  space,
  onClose,
  onSubmit,
  submitting,
}: SpaceFormModalProps) {
  const [form, setForm] = useState<SpaceFormData>(
    space
      ? {
          name: space.name,
          location: space.location,
          capacity: space.capacity,
          type: space.type,
          status: space.status,
        }
      : emptyForm
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-black">
            {space ? 'Edit Space' : 'Add New Space'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-black">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black">Location</label>
            <input
              required
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Block A, Level 2"
              className={fieldClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-black">Capacity</label>
              <input
                type="number"
                required
                min={1}
                value={form.capacity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className={fieldClass}
              >
                {SPACE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value as SpaceStatus }))
              }
              className={fieldClass}
            >
              {SPACE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="sccl-btn-secondary flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="sccl-btn-primary flex-1 py-2.5"
            >
              {submitting ? 'Saving...' : space ? 'Save Changes' : 'Add Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
