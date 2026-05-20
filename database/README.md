# Database Scripts

This folder contains the database setup files for Supabase.

## 1. Create Supabase project

Create a free Supabase project, then copy:

- Project URL
- Anon public key
- Service role key

## 2. Create local env file

Copy `.env.example` to `.env` and fill in the real values.

Do not commit `.env`.

## 3. Run schema

Open Supabase Dashboard → SQL Editor, paste the contents of:

`database/migrations/001_initial_schema.sql`

Run it once.

## 4. Create first admin account

After `.env` is filled:

```bash
npm run db:seed-admin
```

This creates the auth user and a matching `profiles` row with `role = admin`.

## 5. App connection

The React app reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Locally, restart `npm run dev` after editing `.env`.

In Vercel, add the same two `VITE_` values to Project Settings → Environment Variables.
