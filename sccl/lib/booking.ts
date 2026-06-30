import { supabase } from '@/supabase';

export async function checkDateAvailability(
  spaceId: string,
  requestedDate: string
): Promise<{ available: boolean; message?: string }> {
  const { data, error } = await supabase
    .from('booking_requests')
    .select('id, status, booking_date')
    .eq('space_id', spaceId)
    .eq('booking_date', requestedDate)
    .eq('status', 'approved');

  if (error) {
    console.error('Error checking availability:', error);
    return { available: false, message: 'Failed to check availability.' };
  }

  const blocked = (data?.length ?? 0) > 0;

  return {
    available: !blocked,
    message: blocked
      ? 'This date is already booked and approved for the selected space.'
      : undefined,
  };
}

export async function submitBookingRequest(
  studentId: string,
  spaceId: string,
  bookingDate: string,
  reason: string
): Promise<{ success: boolean; booking?: Record<string, unknown>; message?: string }> {
  const availability = await checkDateAvailability(spaceId, bookingDate);

  if (!availability.available) {
    return {
      success: false,
      message: availability.message ?? 'Selected date is not available.',
    };
  }

  const { data, error } = await supabase
    .from('booking_requests')
    .insert({
      student_id: studentId,
      space_id: spaceId,
      booking_date: bookingDate,
      reason: reason.trim(),
      status: 'pending',
    })
    .select('*, spaces(name, location, type)')
    .single();

  if (error) {
    return { success: false, message: 'Failed to submit booking request.' };
  }

  return { success: true, booking: data, message: 'Booking request submitted successfully.' };
}

export async function cancelBookingRequest(
  requestId: string,
  studentId: string
): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase
    .from('booking_requests')
    .update({ status: 'canceled' })
    .eq('id', requestId)
    .eq('student_id', studentId)
    .in('status', ['pending', 'approved'])
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return { success: false, message: 'Booking request not found or cannot be canceled.' };
  }

  return { success: true, message: 'Booking request canceled.' };
}

export async function getStudentBookingHistory(studentId: string) {
  const { data, error } = await supabase
    .from('booking_requests')
    .select(`
      id,
      booking_date,
      reason,
      status,
      created_at,
      spaces (
        name,
        location,
        type,
        capacity
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch booking history.');
  }

  return data ?? [];
}
