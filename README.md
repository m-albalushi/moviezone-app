
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
- Netlify (deployment)  // Currently the platform is disabled by the Owner

## 🛠️ Getting Started

To run the project locally:

**Make sure you have **Node.js** and **npm** installed.**

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a .env file in the root directory and add:

  ```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
   ```


3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Supabase Setup Summary

To connect your project to Supabase:

1. Create a Supabase account and a new project.
2. Get the following from your Supabase dashboard:

- Project URL
- Anon Public API Key

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
2. Connect your GitHub repo to Netlify.
3. Add these environment variables in Netlify Dashboard → Site Settings → Environment:

- VITE_SUPABASE_URL

- VITE_SUPABASE_ANON_KEY



4. Set build settings:
- Build command: `npm run build`
- Publish directory: `dist`

5. Deploy the site.

## 🛡 Maintenance Mode (Optional)

Choose one of these options when your site is under maintenance:

### 🔹 Option 1: Rename
Option 1: Manual File Rename Method (Recommended)

This method uses a simple file rename to switch between your actual homepage (index.html) and your maintenance page (maintenance.html).

🔁 To Enable Maintenance Mode:
:
Open VS Code Terminal in the root folder.


 ```bash
Rename-Item index.html index_backup.html
Rename-Item maintenance.html index.html

   ```
Push changes to GitHub
```bash
npm run build
git add .
git commit -m "Disable maintenance mode"
git push origin main

   ```


   🔄 To Disable Maintenance Mode:
In the same terminal, restore the original index.html:


 ```bash
Rename-Item index.html maintenance.html
Rename-Item index_backup.html index.html

   ```
Push changes to GitHub
```bash
npm run build
git add .
git commit -m "Disable maintenance mode"
git push origin main

   ```



### 🔹 Option 2: Redirect (Netlify) // still not working 

Add this to a file called `netlify.toml` in your root:
```toml
[[redirects]]
  from = "/*"
  to = "/maintenance.html"
  status = 200
```
- Rebuild and deploy

⚠️ Use only one method only.
