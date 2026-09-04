# Wristlist cloud sync setup

This setup uses a personal Supabase project and Google OAuth. It does not require connecting ChatGPT to GitHub.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard and create a new project under your personal account.
2. Use a strong generated database password and save it in your password manager. Wristlist does not need this password in its code or Vercel settings.
3. Wait for the project to finish provisioning.

## 2. Create the database table

1. In Supabase, open **SQL Editor**.
2. Create a new query.
3. Paste the complete contents of `supabase/schema.sql`.
4. Click **Run**.

The script enables Row Level Security. Each signed-in user can only read and update their own state record.

## 3. Configure Google sign-in

1. In Google Cloud Console, create or select a personal project.
2. Configure the OAuth consent screen.
3. While the OAuth app remains in testing mode, add your own Google account and any invited beta testers under **Test users**.
4. Create an OAuth client for a web application.
5. Copy the Supabase Google callback URL from **Supabase > Authentication > Sign In / Providers > Google** into Google’s **Authorized redirect URIs**.
6. Copy the Google client ID and client secret into the Supabase Google provider settings, then enable the provider.

## 4. Configure allowed app URLs

In **Supabase > Authentication > URL Configuration**:

- Set **Site URL** to the production Vercel URL, such as `https://your-project.vercel.app`.
- Add `http://localhost:3000/**` under **Redirect URLs** for local testing.
- Add the exact production URL followed by `/**` under **Redirect URLs**.

## 5. Add Vercel environment variables

Find the values in **Supabase > Project Settings > API**. In **Vercel > Project > Settings > Environment Variables**, add:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Add both variables to Production, Preview, and Development. The publishable key is intended for browser use. Never add the database password or a Supabase secret/service-role key to the frontend.

## 6. Redeploy and test

1. Redeploy the latest Vercel deployment after adding the environment variables.
2. Open Wristlist and select the profile button.
3. Sign in with Google.
4. Confirm the account panel says the watch box is synced.
5. Open the app in another browser and sign into the same Google account.
6. Confirm the collection, saved watches, preferences, challenges, and streak appear.

If the environment variables are missing, Wristlist remains fully functional in local-browser mode.
