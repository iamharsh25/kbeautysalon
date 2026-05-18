# Free Hosting Guide

## Recommended beginner setup

- Host the React website on Vercel free tier.
- Use Supabase free tier for database, authentication, and image storage.
- Buy the domain from the client-selected provider.
- Point the domain DNS to Vercel.

## Why this setup

- No separate server to maintain at the beginning.
- Secure login is handled by Supabase Auth.
- Database is real Postgres, so it can grow with the business.
- Gallery images can be stored in Supabase Storage.
- Vercel deploys automatically when you push to GitHub.

## Deployment steps later

1. Create a GitHub repository.
2. Push this project to GitHub.
3. Create a Supabase project.
4. Run the SQL from `DATABASE_DESIGN.md` in Supabase SQL editor.
5. Create a Vercel project from the GitHub repo.
6. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy.
8. Add the purchased custom domain in Vercel.

## Free tier notes

Free tiers are suitable for a small salon website, but they can change over time. Before launch, confirm the current limits on Vercel and Supabase and keep a simple backup/export plan for the database.
