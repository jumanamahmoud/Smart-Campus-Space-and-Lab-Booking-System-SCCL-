'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/profile/ProfileForm';
import AdminDashboardShell from '@/components/admin/AdminDashboardShell';
import AvailabilityTable from '@/components/admin/AvailabilityTable';
import PendingRequestsTable from '@/components/admin/PendingRequestsTable';
import SpaceFormModal from '@/components/admin/SpaceFormModal';
import SpaceManager from '@/components/admin/SpaceManager';
import AlertModal from '@/components/student/AlertModal';
import type { AdminBookingRequest, AdminNavItem, AvailabilityTableData, SpaceFormData } from '@/types/admin';
import type { Space, UserSession } from '@/types/booking';
import type { UserProfile } from '@/types/profile';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeNav, setActiveNav] = useState<AdminNavItem>('spaces');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AdminBookingRequest[]>([]);
  const [availabilityTable, setAvailabilityTable] = useState<AvailabilityTableData | null>(null);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingCount = pendingRequests.length;

  const loadSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    try {
      const response = await fetch('/api/spaces');
      const result = await response.json();
      if (response.ok) setSpaces(result.spaces ?? []);
    } finally {
      setLoadingSpaces(false);
    }
  }, []);

  const loadPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch('/api/admin/bookings/pending', { cache: 'no-store' });
      const result = await response.json();
      if (response.ok) {
        setPendingRequests(result.requests ?? []);
      } else {
        setAlert({
          title: 'Failed to load requests',
          message: result.text ?? 'Could not fetch pending booking requests.',
        });
      }
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    setLoadingAvailability(true);
    try {
      const response = await fetch('/api/admin/availability');
      const result = await response.json();
      if (response.ok) setAvailabilityTable(result.table ?? null);
    } finally {
      setLoadingAvailability(false);
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
      if (session.role !== 'admin') {
        router.replace('/login');
        return;
      }
      setUser(session);
      loadSpaces();
      loadPendingRequests();
      loadAvailability();
    } catch {
      router.replace('/login');
    }
  }, [router, loadSpaces, loadPendingRequests, loadAvailability]);

  useEffect(() => {
    if (!user) return;
    if (activeNav === 'requests') loadPendingRequests();
    if (activeNav === 'availability') loadAvailability();
    if (activeNav === 'spaces') loadSpaces();
  }, [activeNav, user, loadPendingRequests, loadAvailability, loadSpaces]);

  const handleNavChange = (nav: AdminNavItem) => {
    setActiveNav(nav);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  const handleProfileSaved = (profile: UserProfile) => {
    if (!user) return;

    const updatedSession: UserSession = {
      ...user,
      username: profile.username,
      email: profile.email,
    };
    setUser(updatedSession);
    localStorage.setItem('user_session', JSON.stringify(updatedSession));
  };

  const handleAddSpace = async (data: SpaceFormData) => {
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/admin/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setAlert({ title: 'Failed', message: result.text ?? 'Could not add space.' });
        return;
      }
      setShowAddModal(false);
      setSuccessMessage('Space added successfully.');
      await Promise.all([loadSpaces(), loadAvailability()]);
    } catch {
      setAlert({ title: 'Network error', message: 'Failed to add space.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSpace = async (data: SpaceFormData) => {
    if (!editingSpace) return;
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/admin/spaces/${editingSpace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setAlert({ title: 'Failed', message: result.text ?? 'Could not update space.' });
        return;
      }
      setEditingSpace(null);
      setSuccessMessage('Space updated successfully.');
      await Promise.all([loadSpaces(), loadAvailability()]);
    } catch {
      setAlert({ title: 'Network error', message: 'Failed to update space.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Delete this space? This cannot be undone.')) return;
    setDeletingId(spaceId);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/admin/spaces/${spaceId}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) {
        setAlert({ title: 'Failed', message: result.text ?? 'Could not delete space.' });
        return;
      }
      setSuccessMessage('Space deleted successfully.');
      await Promise.all([loadSpaces(), loadAvailability()]);
    } catch {
      setAlert({ title: 'Network error', message: 'Failed to delete space.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDecision = async (requestId: string, decision: 'approved' | 'denied') => {
    setProcessingId(requestId);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/admin/bookings/${requestId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const result = await response.json();
      if (!response.ok) {
        setAlert({
          title: decision === 'approved' ? 'Approval failed' : 'Denial failed',
          message: result.text ?? 'Could not process request.',
        });
        return;
      }
      setSuccessMessage(`Booking request ${decision}.`);
      await Promise.all([loadPendingRequests(), loadAvailability()]);
    } catch {
      setAlert({ title: 'Network error', message: 'Failed to process request.' });
    } finally {
      setProcessingId(null);
    }
  };

  const pageMeta = useMemo(() => {
    switch (activeNav) {
      case 'requests':
        return {
          title: 'Review Requests',
          subtitle: 'Approve or deny pending student booking requests.',
        };
      case 'availability':
        return {
          title: 'Space Availability',
          subtitle: 'Interactive 14-day availability grid across all campus spaces.',
        };
      case 'profile':
        return {
          title: 'My Profile',
          subtitle: 'Update your account details and contact information.',
        };
      default:
        return {
          title: 'Manage Spaces',
          subtitle: 'Add, edit, or remove campus spaces and laboratories.',
        };
    }
  }, [activeNav]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb]">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <AdminDashboardShell
      user={user}
      activeNav={activeNav}
      pendingCount={pendingCount}
      onNavChange={handleNavChange}
      onLogout={handleLogout}
    >
      <div className="mb-6 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['spaces', 'requests', 'availability', 'profile'] as AdminNavItem[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleNavChange(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                activeNav === item
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              {item === 'spaces'
                ? 'Spaces'
                : item === 'requests'
                  ? 'Requests'
                  : item === 'availability'
                    ? 'Availability'
                    : 'Profile'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="sccl-heading">{pageMeta.title}</h1>
        <p className="sccl-subheading">{pageMeta.subtitle}</p>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      {activeNav === 'spaces' && (
        <SpaceManager
          spaces={spaces}
          loading={loadingSpaces}
          onAdd={() => setShowAddModal(true)}
          onEdit={setEditingSpace}
          onDelete={handleDeleteSpace}
          deletingId={deletingId}
        />
      )}

      {activeNav === 'requests' && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => loadPendingRequests()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      )}

      {activeNav === 'requests' && (
        <PendingRequestsTable
          requests={pendingRequests}
          loading={loadingRequests}
          onDecision={handleDecision}
          processingId={processingId}
        />
      )}

      {activeNav === 'availability' && (
        <AvailabilityTable table={availabilityTable} loading={loadingAvailability} />
      )}

      {activeNav === 'profile' && (
        <ProfileForm userId={user.id} role="admin" onSaved={handleProfileSaved} />
      )}

      {showAddModal && (
        <SpaceFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSpace}
          submitting={submitting}
        />
      )}

      {editingSpace && (
        <SpaceFormModal
          space={editingSpace}
          onClose={() => setEditingSpace(null)}
          onSubmit={handleEditSpace}
          submitting={submitting}
        />
      )}

      {alert && (
        <AlertModal title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
      )}
    </AdminDashboardShell>
  );
}
