import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url?: string;
}

interface SpotifyAudioFeatures {
  tempo: number;
  energy: number;
  danceability: number;
}

export const useSpotify = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const CLIENT_ID = "your_spotify_client_id"; // This will need to be replaced with actual client ID
  const REDIRECT_URI = `${window.location.origin}/auth/spotify/callback`;

  useEffect(() => {
    // Check for stored access token
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsAuthenticated(true);
    }

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !accessToken) {
      exchangeCodeForToken(code);
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { code, redirect_uri: REDIRECT_URI }
      });

      if (error) throw error;

      if (data.access_token) {
        setAccessToken(data.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('spotify_access_token', data.access_token);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  };

  const login = () => {
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
      show_dialog: 'true'
    })}`;

    window.location.href = authUrl;
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('spotify_access_token');
  };

  const searchTracks = async (query: string, targetBPM?: number): Promise<SpotifyTrack[]> => {
    if (!accessToken) return [];

    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: {
          access_token: accessToken,
          action: 'search',
          data: { query, type: 'track', limit: 50 }
        }
      });

      if (error) throw error;

      let tracks = data.tracks?.items || [];

      // If we have a target BPM, filter and sort by tempo
      if (targetBPM && tracks.length > 0) {
        const tracksWithTempo = await Promise.all(
          tracks.map(async (track: SpotifyTrack) => {
            const audioFeatures = await getAudioFeatures(track.id);
            return { ...track, tempo: audioFeatures?.tempo || 0 };
          })
        );

        // Sort by closest tempo to target BPM
        tracks = tracksWithTempo
          .filter(track => track.tempo > 0)
          .sort((a, b) => 
            Math.abs(a.tempo - targetBPM) - Math.abs(b.tempo - targetBPM)
          );
      }

      return tracks;
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  };

  const getAudioFeatures = async (trackId: string): Promise<SpotifyAudioFeatures | null> => {
    if (!accessToken) return null;

    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: {
          access_token: accessToken,
          action: 'audio-features',
          data: { track_id: trackId }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting audio features:', error);
      return null;
    }
  };

  const play = async (trackUris?: string[]) => {
    if (!accessToken) return false;

    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: {
          access_token: accessToken,
          action: 'play',
          data: trackUris ? { uris: trackUris } : {}
        }
      });

      if (error) throw error;
      setIsPlaying(true);
      return data.success;
    } catch (error) {
      console.error('Error playing:', error);
      return false;
    }
  };

  const pause = async () => {
    if (!accessToken) return false;

    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: {
          access_token: accessToken,
          action: 'pause'
        }
      });

      if (error) throw error;
      setIsPlaying(false);
      return data.success;
    } catch (error) {
      console.error('Error pausing:', error);
      return false;
    }
  };

  const next = async () => {
    if (!accessToken) return false;

    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: {
          access_token: accessToken,
          action: 'next'
        }
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Error skipping:', error);
      return false;
    }
  };

  const getCurrentTrack = async () => {
    if (!accessToken) return null;

    try {
      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: {
          access_token: accessToken,
          action: 'current'
        }
      });

      if (error) throw error;
      
      if (data.item) {
        setCurrentTrack(data.item);
        setIsPlaying(data.is_playing);
        return data.item;
      }
      return null;
    } catch (error) {
      console.error('Error getting current track:', error);
      return null;
    }
  };

  return {
    isAuthenticated,
    accessToken,
    currentTrack,
    isPlaying,
    login,
    logout,
    searchTracks,
    getAudioFeatures,
    play,
    pause,
    next,
    getCurrentTrack
  };
};