# EZEE Fee & Attendance — Phase 1

Phase 1 is intentionally limited to **Student Management**.

### Included
- Add student
- Edit student
- Delete student with confirmation
- Search
- Class/batch filter
- Active / inactive filter
- Name/recently-updated sorting
- Student + parent details
- Monthly fee field
- Admission date
- Local browser persistence
- Responsive mobile/desktop UI
- Vercel-ready Next.js app

### Not included yet
Attendance, fees collection, UPI, WhatsApp, reports, authentication, Supabase, AI, SMS.

Those are deliberately reserved for later phases so the dependency graph stays clean.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

Production check:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Keep the default Next.js build settings.
4. Deploy.

No environment variables are required for Phase 1.

## Data note

Phase 1 stores records in the browser using localStorage under:

`ezee_fee_attendance_students_v1`

This is deliberate. In the next data phase, the same student shape can be migrated to Supabase/Postgres with authentication and Row Level Security.
