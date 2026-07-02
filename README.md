# SCCL — Smart Campus Space and Lab Booking System

A campus room and lab booking portal for **UTM MJIIT**. Students browse spaces, submit booking requests, and manage their profile. Admins manage spaces, approve requests, and view a monthly availability calendar.

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
| **Admin** | CRUD spaces, approve/deny requests, monthly availability calendar, edit profile |
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
4. **Availability Table** — monthly grid with date filter; click booked cells to view details.
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

## AI Tools in Development

AI was used at multiple stages of SCCL. All outputs were reviewed, tested, and corrected by the team before acceptance.

### Tools by development stage

| Development stage | AI tools used |
|-------------------|---------------|
| Idea and scope refinement | ChatGPT, Gemini |
| UI design | Figma AI |
| Code development | Cursor AI, GitHub Copilot, Gemini |
| Backend and API logic | Cursor AI, GitHub Copilot, Gemini |
| Debugging | Cursor AI, Gemini |

### Tool tutorials

#### ChatGPT — Idea and scope refinement

| Item | Detail |
|------|--------|
| **Purpose** | Clarify system scope, user roles, and feature list before implementation |
| **Example prompt** | *Help me define the scope for a campus room booking system with student and admin roles. What core features should each dashboard include?* |
| **Output summary** | Suggested modules: authentication, student booking flow, admin space management, request approval, and availability tracking. |
| **Student correction / validation** | The team mapped suggestions to three branches (`auth`, `studentdash`, `admindash`) and removed features outside assignment scope. |

#### Gemini — Idea, backend logic, and debugging

| Item | Detail |
|------|--------|
| **Purpose** | Discuss architecture options, Supabase table design, and interpret error messages |
| **Example prompt** | *How should I structure Supabase tables for spaces and booking requests with statuses pending, approved, denied, and canceled?* |
| **Output summary** | Proposed `spaces`, `booking_requests`, and `profiles` tables with status fields and foreign-key relationships. |
| **Student correction / validation** | Schema was adapted into `supabase/migrations/001_spaces_and_bookings.sql`. RLS policies were added manually after API tests failed with error `42501`. |

#### Figma AI — UI design

| Item | Detail |
|------|--------|
| **Purpose** | Draft skeleton UI layouts for student and admin dashboards before coding |
| **Example prompt** | *Design SCCL: student dashboard to browse rooms, book with date and reason, view history; admin dashboard to manage spaces, review requests, and view availability. Student-friendly layout.* |
| **Output summary** | Draft screens for room catalog, booking form, request review queue, and availability overview. |
| **Student correction / validation** | Used as visual reference only. Final UI was built in Next.js with Tailwind (`.sccl-*` classes in `globals.css`), not exported directly from Figma. |

#### Cursor AI — Code development, backend, debugging, docs

| Item | Detail |
|------|--------|
| **Purpose** | Implement features, API routes, refactoring, and project documentation inside the IDE |
| **Example prompt** | *Add profile functionality where students can edit username, full name, email, and Malaysia phone number. Admin should edit profiles too.* |
| **Output summary** | Generated `ProfileForm`, `lib/profile.ts`, `lib/profileValidation.ts`, `/api/profile`, and dashboard integration for both roles. |
| **Student correction / validation** | Ran `npm run build`, applied migration `004_student_profile_fields.sql`, and refactored duplicate student-only code into shared `getUserProfile` / `updateUserProfile`. |

| Item | Detail |
|------|--------|
| **Purpose** | Admin availability calendar and booking detail routing |
| **Example prompt** | *Add monthly calendar view with date filter and route to a booking detail page when admin clicks booked cells.* |
| **Output summary** | Updated `AvailabilityTable`, `generateAvailabilityTable()`, `/api/admin/availability?year=&month=&date=`, and `/admin/bookings/[id]`. |
| **Student correction / validation** | Tested month navigation, date filter, and approve/deny from the detail page. Verified back-link to `?tab=requests`. |

#### GitHub Copilot — Code development and backend

| Item | Detail |
|------|--------|
| **Purpose** | Inline code suggestions while writing components, API handlers, and TypeScript types |
| **Example prompt** | *(Contextual — while editing `lib/booking.ts`)* write function to check if a space date is already approved |
| **Output summary** | Suggested `checkDateAvailability()` and Supabase query patterns for `booking_requests`. |
| **Student correction / validation** | Team reviewed conflict-check logic before admin approval and ensured student submit flow calls the same availability rules. Copilot suggestions were not accepted blindly. |

### Validation workflow (all AI tools)

1. **Run the code** — `npm run dev` / `npm run build`
2. **Test with sample data** — login, booking, admin approve/deny, profile save
3. **Cross-check docs** — Supabase RLS guides, Next.js App Router docs, assignment rules
4. **Refactor** — merge duplicated AI output into shared modules (`ProfileForm`, `profileValidation.ts`)

---

## Team Branches

| Module | Branch |
|--------|--------|
| Auth | `auth` |
| Student Dashboard | `studentdash` |
| Admin Dashboard | `admindash` |

Developed for **UTM MJIIT**.
