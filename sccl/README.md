# SCCL — Smart Campus Space and Lab Booking System

A campus room and lab booking portal for **UTM MJIIT**. Students browse spaces, submit booking requests, and manage their profile. Admins manage spaces, approve requests, and view a 14-day availability grid.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Supabase

---

## Quick Start

```bash
cd sccl
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # optional; needed for profile email changes
```

Run migrations **in order** in **Supabase → SQL Editor**:

1. `supabase/migrations/001_spaces_and_bookings.sql`
2. `supabase/migrations/002_fix_admin_rls.sql`
3. `supabase/migrations/003_ensure_booking_rls.sql`
4. `supabase/migrations/004_student_profile_fields.sql`

> The `profiles` table comes from the **auth** module and must exist before migration 001.

```bash
npm run dev    # http://localhost:3000
npm run build  # production build
```

---

## Features

| Area | What it does |
|------|----------------|
| **Auth** | Student/admin signup & login (email or username). Session in `localStorage`. |
| **Student** | Browse & book rooms, check date availability, view/cancel bookings, edit profile |
| **Admin** | CRUD spaces, approve/deny requests, 14-day availability table, edit profile |
| **Validation** | Institutional emails, strong passwords, username/phone rules, no double-booking |

### Pages

| Route | Role |
|-------|------|
| `/` | Landing |
| `/login`, `/signup` | Auth |
| `/student/dashboard` | Student portal |
| `/admin/dashboard` | Admin portal |

---

## User Guide

### Students
1. Sign up with a `@graduate.utm.my` email → log in.
2. **Browse Rooms** — search/filter spaces; **Book a Space** — pick date + reason.
3. Blocked dates show an instant error if already approved for that room.
4. **My Bookings** — track status; cancel pending/approved requests.
5. **My Profile** — edit username, full name, email, phone.

### Admins
1. Sign up with `@utm.my` email, staff ID (`UTM…`), and admin passcode.
2. **Manage Spaces** — add, edit, delete; set `available` or `maintenance`.
3. **Review Requests** — approve/deny pending bookings (conflicts blocked).
4. **Availability Table** — 14-day grid: available, pending, approved, maintenance.
5. **My Profile** — same fields as students; email must be `@utm.my`.

### Profile rules (both roles)
- **Username:** lowercase letters & numbers only, 3–30 chars
- **Phone:** Malaysia mobile (e.g. `012-345 6789`)

---

## API Endpoints

All routes return JSON. Errors: `{ text }` or `{ field, text }`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register (`username`, `email`, `password`, `role`; admin needs `staffId`, `adminCode`) |
| POST | `/api/auth/login` | Login (`identifier`, `password`) → `{ user: { id, email, username, role } }` |
| GET | `/api/spaces` | List all spaces |
| GET | `/api/bookings?studentId=` | Student booking history |
| POST | `/api/bookings` | Submit request (`studentId`, `spaceId`, `bookingDate`, `reason`) |
| POST | `/api/bookings/check-availability` | Check date (`spaceId`, `requestedDate`) |
| PATCH | `/api/bookings/{id}/cancel` | Cancel booking (`studentId`) |
| GET | `/api/profile?userId=` | Load profile |
| PATCH | `/api/profile` | Update profile (`userId`, `username`, `full_name`, `email`, `phone`) |
| POST | `/api/admin/spaces` | Add space |
| PATCH | `/api/admin/spaces/{id}` | Edit space |
| DELETE | `/api/admin/spaces/{id}` | Delete space |
| GET | `/api/admin/bookings/pending` | Pending request queue |
| PATCH | `/api/admin/bookings/{id}/decision` | Approve/deny (`decision`: `approved` \| `denied`) |
| GET | `/api/admin/availability?year=&month=&date=` | Monthly availability grid (optional single-day `date` filter) |
| GET | `/api/admin/bookings/{id}` | Booking detail for admin view |

---

## Key Library Functions

| File | Functions |
|------|-----------|
| `lib/booking.ts` | `checkDateAvailability`, `submitBookingRequest`, `cancelBookingRequest`, `getStudentBookingHistory` |
| `lib/admin.ts` | `addSpace`, `editSpace`, `deleteSpace`, `getPendingBookingRequests`, `processRequestDecision`, `generateAvailabilityTable` |
| `lib/profile.ts` | `getUserProfile`, `updateUserProfile` |
| `lib/profileValidation.ts` | `validateProfileForm`, `formatMalaysiaPhone` |

---

## Project Layout

```
sccl/
├── app/api/          # Route handlers (auth, bookings, admin, profile, spaces)
├── app/admin/        # Admin dashboard
├── app/student/      # Student dashboard
├── components/       # UI (admin/, student/, profile/)
├── lib/              # Business logic
├── supabase/migrations/
└── types/
```

---

## Database

| Table | Purpose |
|-------|---------|
| `profiles` | Users (linked to Supabase Auth) |
| `spaces` | Campus rooms/labs |
| `booking_requests` | Booking requests (`pending` → `approved` / `denied` / `canceled`) |

RLS is enabled. Migrations include anon-key policies for development API routes.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin space CRUD fails | Run `002_fix_admin_rls.sql` |
| Bookings missing from UI | Run `003_ensure_booking_rls.sql` |
| Profile save denied | Run `004_student_profile_fields.sql` |
| Email change fails | Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` |
| Booking foreign key error | User missing from `profiles` — re-register |

---

## Team Branches

| Module | Branch |
|--------|--------|
| Auth | `auth` |
| Student Dashboard | `studentdash` |
| Admin Dashboard | `admindash` |

Developed for **UTM MJIIT**.
