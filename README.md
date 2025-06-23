
# 🎬 MovieZone – Streaming Web Application

MovieZone is a personal streaming platform that allows users to browse, watch, and download movies. It includes an admin panel for managing content. This project was built to learn and apply practical web development skills using Supabase, PostgreSQL, and modern frontend technologies.

## ✨ Features

- Email-based user authentication via Supabase
- Admin login and dashboard for uploading, editing, and deleting movies
- Video upload and hosting via Supabase Storage
- View and download counters using PostgreSQL functions
- Responsive UI with React and Tailwind CSS

## 🧰 Technologies Used

- React + TypeScript
- Tailwind CSS
- Vite (build tool)
- Supabase (Auth, Storage, and PostgreSQL DB)
- PostgreSQL

## 🛠️ Getting Started

To run the project locally:

**Make sure Node.js is installed.**

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Supabase Setup Summary

To connect your project to Supabase:

1. Create a Supabase account and a new project.
2. Get the following from your Supabase dashboard:

- Project URL
- Anon Public API Key

3. Add them in `supabaseClient.ts`:
   ```ts
   const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
   ```

4. In Supabase:

- ✅ Create a table named `movies` (check `types.ts` for required columns)
- ✅ Enable Email Authentication
- ✅ Manually create an admin user (e.g. admin@moviezone.com)
- ✅ Create a public storage bucket named `movie-videos`
- ✅ Create two SQL Functions (from Supabase SQL Editor):
   ```sql
   -- Increment views
   CREATE OR REPLACE FUNCTION increment_views (movie_id_param uuid)
   RETURNS void
   LANGUAGE plpgsql AS $$
   BEGIN
     UPDATE public.movies
     SET views = views + 1
     WHERE id = movie_id_param;
   END;
   $$;

   -- Increment downloads
   CREATE OR REPLACE FUNCTION increment_downloads (movie_id_param uuid)
   RETURNS void
   LANGUAGE plpgsql AS $$
   BEGIN
     UPDATE public.movies
     SET downloads = downloads + 1
     WHERE id = movie_id_param;
   END;
   $$;
   ```

- (Recommended) Add Row Level Security (RLS) policies for `movies`:
  - Allow read for all users
  - Allow insert/update/delete for authenticated (admin) users

## 🚀 Deploying to Netlify (Free Hosting)

1. Push your project to GitHub.
2. Sign in to Netlify and connect your GitHub repo.
3. Set the build settings:

- Build command: `npm run build`
- Publish directory: `dist`

4. Deploy the site.

## 🛡 Maintenance Mode (Optional)

Choose one of these options when your site is under maintenance:

### 🔹 Option 1: Rename

- Rename `index.html` → `index_backup.html`
- Rename `maintenance.html` → `index.html`
- Rebuild and redeploy

### 🔹 Option 2: Redirect (Netlify)

Add this to a file called `netlify.toml` in your root:
```toml
[[redirects]]
  from = "/*"
  to = "/maintenance.html"
  status = 200
```
- Rebuild and deploy

⚠️ Use only one method at a time.
