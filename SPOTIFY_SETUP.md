# Spotify Authentication Setup Guide

## Issues Fixed

1. ✅ Added missing callback route (`/auth/spotify/callback`) in `src/App.tsx`
2. ✅ Improved error handling in `src/hooks/useSpotify.tsx`
3. ⚠️ **Environment Variables Need to be Set** (see below)

## Required Environment Variables

Your Supabase Edge Functions need these environment variables to work:

### 1. Set Supabase Secrets

Run these commands in your terminal:

```bash
# Login to Supabase (if not already logged in)
supabase login

# Set the Spotify credentials
supabase secrets set SPOTIFY_CLIENT_ID=4a036982025f4178a9ad8b24c7864a96
supabase secrets set SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET_HERE
```

### 2. Get Your Spotify Client Secret

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app (or create one if you haven't)
3. Click "Settings"
4. Copy the "Client Secret"
5. Replace `YOUR_SPOTIFY_CLIENT_SECRET_HERE` in the command above

### 3. Configure Redirect URI in Spotify App

1. In your Spotify app settings, add this redirect URI:
   ```
   https://rhythm-runner.lovable.app/auth/spotify/callback
   ```
2. For local development, also add:
   ```
   http://localhost:5173/auth/spotify/callback
   ```

## Testing the Setup

1. Deploy your Supabase functions:
   ```bash
   supabase functions deploy
   ```

2. Start your development server:
   ```bash
   npm run dev
   ```

3. Try connecting to Spotify - you should now see detailed logs in the browser console

## Troubleshooting

### If you see "Spotify credentials not configured" error:
- Make sure you've set the Supabase secrets correctly
- Redeploy your functions after setting secrets

### If the callback doesn't work:
- Check that the redirect URI in your Spotify app matches exactly
- Verify the callback route is working by visiting `/auth/spotify/callback` directly

### If you get CORS errors:
- Make sure your Supabase functions are deployed
- Check that the CORS headers are set correctly in the functions

## Current Configuration

- **Client ID**: `4a036982025f4178a9ad8b24c7864a96`
- **Redirect URI**: `${window.location.origin}/auth/spotify/callback`
- **Scopes**: `streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing` 