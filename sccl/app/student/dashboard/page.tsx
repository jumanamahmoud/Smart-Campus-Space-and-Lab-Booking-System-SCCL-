'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/student/AlertModal';
import BookingHistory from '@/components/student/BookingHistory';
import BookingModal from '@/components/student/BookingModal';
import RoomCatalog from '@/components/student/RoomCatalog';
import SpaceDetailModal from '@/components/student/SpaceDetailModal';
import StudentDashboardShell, {
  type StudentNavItem,
} from '@/components/student/StudentDashboardShell';
import type { BookingRequest, Space, UserSession } from '@/types/booking';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeNav, setActiveNav] = useState<StudentNavItem>('browse');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [detailSpace, setDetailSpace] = useState<Space | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending').length,
    [bookings]
  );

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
      const response = await fetch(`/api/bookings?studentId=${encodeURIComponent(studentId)}`);
      const result = await response.json();
      if (response.ok) {
        setBookings(result.bookings ?? []);
      } else {
        setAlert({
          title: 'Failed to load bookings',
          message: result.text ?? 'Could not fetch your booking history.',
        });
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
      setActiveNav('history');
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
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb]">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  const pageTitle =
    activeNav === 'history'
      ? 'My Bookings'
      : activeNav === 'book'
        ? 'Book a Space'
        : 'Campus Spaces';

  const pageSubtitle =
    activeNav === 'history'
      ? 'Track pending, approved, denied, and canceled booking requests.'
      : activeNav === 'book'
        ? 'Choose an available room and submit your booking request.'
        : 'Browse and book available campus rooms and laboratories.';

  return (
    <StudentDashboardShell
      user={user}
      activeNav={activeNav}
      pendingCount={pendingCount}
      onNavChange={setActiveNav}
      onLogout={handleLogout}
    >
      <div className="mb-6 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['browse', 'book', 'history'] as StudentNavItem[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveNav(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                activeNav === item
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              {item === 'browse' ? 'Browse' : item === 'book' ? 'Book' : 'History'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="sccl-heading">{pageTitle}</h1>
        <p className="sccl-subheading">{pageSubtitle}</p>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {activeNav === 'history' ? (
        <BookingHistory
          bookings={bookings}
          loading={loadingBookings}
          onCancel={handleCancel}
          cancelingId={cancelingId}
        />
      ) : (
        <RoomCatalog
          spaces={spaces}
          loading={loadingSpaces}
          availableOnly={activeNav === 'book'}
          onBook={setSelectedSpace}
          onViewDetails={setDetailSpace}
        />
      )}

      {detailSpace && (
        <SpaceDetailModal
          space={detailSpace}
          onClose={() => setDetailSpace(null)}
          onBook={() => {
            setSelectedSpace(detailSpace);
            setDetailSpace(null);
          }}
        />
      )}

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
    </StudentDashboardShell>
  );
}
