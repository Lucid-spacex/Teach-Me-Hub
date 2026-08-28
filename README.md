# Teach-Me-Hub

Bare-bones frontend for the Smart Tutor API. Next.js App Router, TypeScript, no
design system — black, white and gray only.

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL` points at the deployed backend
(`https://smart-tutor-9rjd.onrender.com`). There is no mock data: every screen
hits the real API.

## Structure

```
app/(auth)/login|register|verify   auth screens
app/parent/...                     children, enrollments, sessions
app/tutor/...                      students, sessions + logging, progress reports
app/admin/...                      overview counts, tutor vetting, unmatched enrollments
app/session/refresh                route handler that refreshes an expired access token
lib/api.ts                         single API client (base URL, bearer token, refresh)
lib/session.ts                     httpOnly cookie session (access, refresh, user)
proxy.ts                           auth + role based route protection
```

Data is read in Server Components and mutated with Server Actions, so tokens
stay in httpOnly cookies and never reach the browser.

## Known API gaps

- No `GET /subjects`: creating an enrollment takes a pasted subject UUID.
- No endpoint listing tutors: admin assignment takes a pasted tutor UUID.
- No `GET /auth/me`: the user object from the login response is cached in a cookie.
- Registration requires an emailed OTP; there is no resend endpoint.
