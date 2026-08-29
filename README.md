# Smart Tutor Platform - Frontend MVP

A bare-bones functional prototype for a tutoring organization platform.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (black, white, and gray only)
- **State/Data Fetching:** Server Components + fetch
- **Auth:** JWT-based with httpOnly cookies

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

The `.env.local` file should contain:
```
NEXT_PUBLIC_API_URL=https://smart-tutor-9rjd.onrender.com
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Features

### Authentication
- User registration (Parent/Tutor roles)
- Email verification with OTP
- Login with JWT tokens
- Token refresh and logout

### Parent Dashboard
- Manage children (students)
- Create and view enrollments
- View upcoming sessions

### Tutor Dashboard
- View assigned students
- View and manage sessions
- Submit progress reports

### Admin Dashboard
- View platform statistics
- Approve/reject tutor applications
- Assign tutors to unmatched enrollments

## API Integration

The frontend connects to the backend API at `https://smart-tutor-9rjd.onrender.com`. 

**API Integration:**
- `GET /subjects` - Available for subject selection in enrollment forms
- `GET /admin/tutors` - Available for tutor assignment in admin dashboard
- `GET /admin/students` - Available for viewing all students in admin dashboard
- User data stored from login response (no `GET /auth/me` endpoint)
- No OTP resend endpoint - Users must contact support if OTP is lost

## Project Structure

```
/app
  /(auth)/          # Authentication pages
  /parent/          # Parent dashboard
  /tutor/           # Tutor dashboard
  /admin/           # Admin dashboard
/components
  /auth/            # Auth components
  /parent/          # Parent components
  /tutor/           # Tutor components
  /admin/           # Admin components
  /shared/          # Shared components
/lib
  api.ts            # Centralized API client
  auth.ts           # Auth utilities
  types.ts          # TypeScript types
```

## Notes

- This is an MVP - intentionally minimal design (black/white/gray only)
- All data comes from the live API - no mock data
- Mobile responsiveness is functional but not polished
