import type { BookingStatus, Space, SpaceStatus } from '@/types/booking';

export interface AdminBookingRequest {
  id: string;
  student_id: string;
  space_id: string;
  booking_date: string;
  reason: string;
  status: BookingStatus;
  created_at: string;
  spaces?: Pick<Space, 'name' | 'location' | 'type' | 'capacity' | 'status'>;
  profiles?: {
    username: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
  } | null;
}

export interface SpaceFormData {
  name: string;
  location: string;
  capacity: number;
  type: string;
  status: SpaceStatus;
}

export interface AvailabilityCell {
  status: 'available' | 'pending' | 'approved' | 'maintenance';
  label?: string;
  reason?: string;
  bookingId?: string;
}

export interface AvailabilityTableData {
  spaces: Pick<Space, 'id' | 'name' | 'location' | 'type' | 'status'>[];
  dates: string[];
  grid: Record<string, Record<string, AvailabilityCell>>;
  startDate: string;
  endDate: string;
  year: number;
  month: number;
  filterDate?: string | null;
}

export type AdminNavItem = 'spaces' | 'requests' | 'availability' | 'profile';
