# KBeauty Salon Website

React home page for a modern, simple, responsive salon website.

## Stack decision

- Frontend: React + Vite + TypeScript
- Backend: Supabase
- Database: Supabase Postgres
- Authentication: Supabase Auth
- Image storage: Supabase Storage
- Hosting: Vercel or Netlify free tier

This is a good beginner-friendly setup because Supabase handles secure login, database APIs, row-level security, and storage without needing to build and host a separate backend server immediately.

## Run locally

```bash
npm install
npm run dev
```

## Replace the logo

The temporary logo is the `KB` circle in `src/App.tsx`. Later, add your real logo file to `public/logo.svg` or `public/logo.png`, then replace the `brand-mark` span inside the `Header` component with an image.

## Current scope

- Home page layout
- Founder story placeholder
- Service preview
- Booking preview panel
- Gallery preview
- Responsive mobile layout

Next pages to build: About Us, Services, Gallery, Contact Us, Book Now / Manage Booking, Login / Sign Up.
