export type BookingStatus = 'pending' | 'approved' | 'denied' | 'canceled';

export type SpaceStatus = 'available' | 'maintenance';

export interface Space {
  id: string;
  name: string;
  location: string;
  capacity: number;
  type: string;
  status: SpaceStatus;
}

export interface BookingRequest {
  id: string;
  student_id: string;
  space_id: string;
  booking_date: string;
  reason: string;
  status: BookingStatus;
  created_at: string;
  spaces?: Pick<Space, 'name' | 'location' | 'type'>;
}

export interface UserSession {
  id: string;
  email: string;
  username: string;
  role: 'student' | 'admin';
}
