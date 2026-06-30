'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/student/AlertModal';
import BookingHistory from '@/components/student/BookingHistory';
import BookingModal from '@/components/student/BookingModal';
import RoomCatalog from '@/components/student/RoomCatalog';
import type { BookingRequest, Space, UserSession } from '@/types/booking';

type DashboardTab = 'catalog' | 'history';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('catalog');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const loadSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    try {
      const response = await fetch('/api/spaces');
      const result = await response.json();
      if (response.ok) {
        setSpaces(result.spaces ?? []);
      }
    } finally {
      setLoadingSpaces(false);
    }
  }, []);

  const loadBookings = useCallback(async (studentId: string) => {
    setLoadingBookings(true);
    try {
      const response = await fetch(`/api/bookings?studentId=${studentId}`);
      const result = await response.json();
      if (response.ok) {
        setBookings(result.bookings ?? []);
      }
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    const sessionRaw = localStorage.getItem('user_session');
    if (!sessionRaw) {
      router.replace('/login');
      return;
    }

    try {
      const session = JSON.parse(sessionRaw) as UserSession;
      if (session.role !== 'student') {
        router.replace('/login');
        return;
      }
      setUser(session);
      loadSpaces();
      loadBookings(session.id);
    } catch {
      router.replace('/login');
    }
  }, [router, loadSpaces, loadBookings]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  const handleBookSubmit = async (bookingDate: string, reason: string) => {
    if (!user || !selectedSpace) return;

    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const availabilityResponse = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: selectedSpace.id,
          requestedDate: bookingDate,
        }),
      });

      const availability = await availabilityResponse.json();

      if (!availability.available) {
        setSelectedSpace(null);
        setAlert({
          title: 'Date unavailable',
          message:
            availability.message ??
            'This date is already booked and approved for the selected space.',
        });
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          spaceId: selectedSpace.id,
          bookingDate,
          reason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSelectedSpace(null);
        setAlert({
          title: response.status === 409 ? 'Date unavailable' : 'Booking failed',
          message: result.text ?? 'Unable to submit your booking request.',
        });
        return;
      }

      setSelectedSpace(null);
      setSuccessMessage('Your booking request was submitted and is pending admin review.');
      setActiveTab('history');
      await loadBookings(user.id);
    } catch {
      setSelectedSpace(null);
      setAlert({
        title: 'Network error',
        message: 'Failed to connect to the booking server. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!user) return;

    setCancelingId(requestId);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/bookings/${requestId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        setAlert({
          title: 'Cancel failed',
          message: result.text ?? 'Unable to cancel this booking request.',
        });
        return;
      }

      setSuccessMessage('Booking request canceled.');
      await loadBookings(user.id);
    } catch {
      setAlert({
        title: 'Network error',
        message: 'Failed to cancel the booking request. Please try again.',
      });
    } finally {
      setCancelingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link href="/student/dashboard" className="text-xl font-bold text-gray-900">
              SCCL Portal
            </Link>
            <p className="text-sm text-gray-500">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              Welcome, <span className="font-medium text-gray-900">{user.username}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        <div className="mb-6 flex gap-2 rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Room catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            My booking history
          </button>
        </div>

        {activeTab === 'catalog' ? (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Browse campus spaces</h2>
              <p className="text-sm text-gray-500">
                Select a room to submit a booking request for a specific date.
              </p>
            </div>
            <RoomCatalog
              spaces={spaces}
              loading={loadingSpaces}
              onBook={setSelectedSpace}
            />
          </section>
        ) : (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Booking history</h2>
              <p className="text-sm text-gray-500">
                Track pending, approved, denied, and canceled requests.
              </p>
            </div>
            <BookingHistory
              bookings={bookings}
              loading={loadingBookings}
              onCancel={handleCancel}
              cancelingId={cancelingId}
            />
          </section>
        )}
      </main>

      {selectedSpace && (
        <BookingModal
          space={selectedSpace}
          submitting={submitting}
          onClose={() => setSelectedSpace(null)}
          onSubmit={handleBookSubmit}
        />
      )}

      {alert && (
        <AlertModal
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}
