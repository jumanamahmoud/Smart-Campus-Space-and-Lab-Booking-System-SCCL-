import { getLocalDateRange } from '@/lib/dates';
import { supabaseServer } from '@/lib/supabaseServer';
import type { AvailabilityTableData, SpaceFormData } from '@/types/admin';
import type { SpaceStatus } from '@/types/booking';

function formatSupabaseError(context: string, error: { message: string; code?: string }) {
  console.error(`[${context}]`, error);
  return `${context}: ${error.message}`;
}

export async function getAllSpaces() {
  const { data, error } = await supabaseServer
    .from('spaces')
    .select('id, name, location, capacity, type, status')
    .order('name');

  if (error) throw new Error(formatSupabaseError('Failed to load spaces', error));
  return data ?? [];
}

export async function addSpace(details: SpaceFormData) {
  const { data, error } = await supabaseServer
    .from('spaces')
    .insert({
      name: details.name.trim(),
      location: details.location.trim(),
      capacity: details.capacity,
      type: details.type.trim(),
      status: details.status,
    })
    .select('id, name, location, capacity, type, status')
    .single();

  if (error) {
    if (error.code === '42501') {
      throw new Error(
        'Permission denied. Run supabase/migrations/002_fix_admin_rls.sql in the Supabase SQL Editor.'
      );
    }
    throw new Error(formatSupabaseError('Failed to add space', error));
  }
  return data;
}

export async function editSpace(spaceId: string, updates: Partial<SpaceFormData>) {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.location !== undefined) payload.location = updates.location.trim();
  if (updates.capacity !== undefined) payload.capacity = updates.capacity;
  if (updates.type !== undefined) payload.type = updates.type.trim();
  if (updates.status !== undefined) payload.status = updates.status;

  const { data, error } = await supabaseServer
    .from('spaces')
    .update(payload)
    .eq('id', spaceId)
    .select('id, name, location, capacity, type, status')
    .single();

  if (error) throw new Error(formatSupabaseError('Failed to update space', error));
  return data;
}

export async function deleteSpace(spaceId: string) {
  const { error } = await supabaseServer.from('spaces').delete().eq('id', spaceId);
  if (error) throw new Error(formatSupabaseError('Failed to delete space', error));
}

async function attachProfiles<T extends { student_id: string }>(requests: T[]) {
  if (requests.length === 0) return requests.map((r) => ({ ...r, profiles: null }));

  const studentIds = [...new Set(requests.map((r) => r.student_id))];
  const { data: profiles, error } = await supabaseServer
    .from('profiles')
    .select('id, username, email')
    .in('id', studentIds);

  if (error) {
    console.error('[attachProfiles]', error);
    return requests.map((r) => ({ ...r, profiles: null }));
  }

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  return requests.map((r) => ({
    ...r,
    profiles: profileMap[r.student_id] ?? null,
  }));
}

export async function getPendingBookingRequests() {
  const { data, error } = await supabaseServer
    .from('booking_requests')
    .select(`
      id,
      student_id,
      space_id,
      booking_date,
      reason,
      status,
      created_at,
      spaces (name, location, type)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(formatSupabaseError('Failed to load pending requests', error));
  }

  return attachProfiles(data ?? []);
}

export async function processRequestDecision(
  requestId: string,
  decision: 'approved' | 'denied'
) {
  if (decision === 'approved') {
    const { data: request, error: fetchError } = await supabaseServer
      .from('booking_requests')
      .select('space_id, booking_date')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !request) {
      throw new Error('Booking request not found.');
    }

    const { data: conflict } = await supabaseServer
      .from('booking_requests')
      .select('id')
      .eq('space_id', request.space_id)
      .eq('booking_date', request.booking_date)
      .eq('status', 'approved')
      .maybeSingle();

    if (conflict) {
      throw new Error('This date is already approved for the selected space.');
    }
  }

  const { data, error } = await supabaseServer
    .from('booking_requests')
    .update({ status: decision })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('id, status')
    .single();

  if (error || !data) {
    throw new Error(formatSupabaseError('Failed to process booking decision', error ?? { message: 'Not found' }));
  }
  return data;
}

export async function generateAvailabilityTable(days = 14): Promise<AvailabilityTableData> {
  const [spaces, bookingsResult] = await Promise.all([
    getAllSpaces(),
    supabaseServer
      .from('booking_requests')
      .select('space_id, booking_date, status, student_id, reason')
      .in('status', ['pending', 'approved']),
  ]);

  if (bookingsResult.error) {
    throw new Error(formatSupabaseError('Failed to load availability data', bookingsResult.error));
  }

  const bookings = bookingsResult.data ?? [];
  const studentIds = [...new Set(bookings.map((b) => b.student_id))];
  const { data: profiles } = studentIds.length
    ? await supabaseServer.from('profiles').select('id, username').in('id', studentIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.username]));

  const dates = getLocalDateRange(days);
  const grid: AvailabilityTableData['grid'] = {};

  for (const space of spaces) {
    grid[space.id] = {};
    for (const date of dates) {
      if (space.status === 'maintenance') {
        grid[space.id][date] = { status: 'maintenance', label: 'Under maintenance' };
      } else {
        grid[space.id][date] = { status: 'available', label: 'Available' };
      }
    }
  }

  const approvedBookings = bookings.filter((b) => b.status === 'approved');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  for (const booking of pendingBookings) {
    const spaceGrid = grid[booking.space_id];
    if (!spaceGrid || !dates.includes(booking.booking_date)) continue;
    if (spaceGrid[booking.booking_date].status === 'maintenance') continue;

    const username = profileMap[booking.student_id] ?? 'Pending';
    spaceGrid[booking.booking_date] = {
      status: 'pending',
      label: `${username} (pending)`,
      reason: booking.reason,
    };
  }

  for (const booking of approvedBookings) {
    const spaceGrid = grid[booking.space_id];
    if (!spaceGrid || !dates.includes(booking.booking_date)) continue;
    if (spaceGrid[booking.booking_date].status === 'maintenance') continue;

    const username = profileMap[booking.student_id] ?? 'Booked';
    spaceGrid[booking.booking_date] = {
      status: 'approved',
      label: `${username} (approved)`,
      reason: booking.reason,
    };
  }

  return {
    spaces: spaces.map((s) => ({
      id: s.id,
      name: s.name,
      location: s.location,
      type: s.type,
      status: s.status,
    })),
    dates,
    grid,
    startDate: dates[0] ?? getLocalDateRange(1)[0],
  };
}

export const SPACE_TYPES = ['Lab', 'Meeting Room', 'Study Room', 'Lecture Hall', 'Multi-purpose'];
export const SPACE_STATUSES: SpaceStatus[] = ['available', 'maintenance'];
