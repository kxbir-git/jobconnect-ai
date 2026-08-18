# Job Hunt

A job portal where seekers browse, save and apply for jobs, and recruiters post jobs, review applicants and track hiring metrics.

## Features

- Public job browsing, keyword search and job detail pages
- Related-job recommendations on every job page
- Email + password accounts (job seeker or recruiter)
- Saved/bookmarked jobs and an applications history on the profile
- Recruiter dashboard: companies, job posting, applicant review
- Hiring metrics: applicants per job, acceptance rate, time-to-hire, pipeline

## Tech stack

- React 19 + TanStack Start (file-based routing, SSR) + Vite
- TanStack Query for data fetching
- Tailwind CSS v4 + shadcn/ui (Radix) components, Sonner toasts
- Postgres + Auth (Supabase) via `@supabase/supabase-js`

## Getting started

```sh
npm i
npm run dev
```

Create a `.env` with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only
```

## Project structure

```
src/
├── components/   # UI components (header, job card, shadcn/ui)
├── lib/          # api.ts, queries.ts (TanStack Query), store.tsx, mock-data.ts
├── routes/       # file-based routes (home, jobs/$jobId, auth, profile, recruiter/*)
└── integrations/ # database + auth clients
```

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Add the environment variables above in Vercel project settings.
3. Build command `npm run build`, output handled by the Nitro Vercel preset
   (set `NITRO_PRESET=vercel` in the environment).
