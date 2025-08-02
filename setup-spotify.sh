#!/bin/bash

echo "🎵 Spotify Authentication Setup for Rhythm Runner"
echo "================================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if user is logged in
echo "🔐 Checking Supabase login status..."
if ! supabase status &> /dev/null; then
    echo "❌ Not logged into Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Logged into Supabase"
echo ""

# Set Spotify Client ID
echo "📝 Setting Spotify Client ID..."
supabase secrets set SPOTIFY_CLIENT_ID=4a036982025f4178a9ad8b24c7864a96

if [ $? -eq 0 ]; then
    echo "✅ Spotify Client ID set successfully"
else
    echo "❌ Failed to set Spotify Client ID"
    exit 1
fi

echo ""
echo "🔑 Now you need to set your Spotify Client Secret:"
echo ""
echo "1. Go to https://developer.spotify.com/dashboard"
echo "2. Click on your app (or create one)"
echo "3. Click 'Settings'"
echo "4. Copy the 'Client Secret'"
echo "5. Run this command:"
echo ""
echo "   supabase secrets set SPOTIFY_CLIENT_SECRET=YOUR_SECRET_HERE"
echo ""
echo "6. Deploy your functions:"
echo ""
echo "   supabase functions deploy"
echo ""
echo "7. Make sure your Spotify app has these redirect URIs:"
echo "   - https://rhythm-runner.lovable.app/auth/spotify/callback"
echo "   - http://localhost:5173/auth/spotify/callback"
echo ""
echo "🎉 After completing these steps, your Spotify authentication should work!" 