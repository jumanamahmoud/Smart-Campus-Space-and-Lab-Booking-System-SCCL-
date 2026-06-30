'use client';

import { useState } from 'react';
import type { Space } from '@/types/booking';

interface BookingModalProps {
  space: Space;
  onClose: () => void;
  onSubmit: (bookingDate: string, reason: string) => Promise<void>;
  submitting?: boolean;
}

export default function BookingModal({
  space,
  onClose,
  onSubmit,
  submitting,
}: BookingModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(bookingDate, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Book {space.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{space.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close booking form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Booking date
            </label>
            <input
              type="date"
              required
              min={today}
              value={bookingDate}
              onChange={(event) => setBookingDate(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason for booking
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe your research activity or event..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
