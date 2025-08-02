import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { access_token, action, data } = await req.json()

    if (!access_token) {
      throw new Error('Access token is required')
    }

    let response;
    let endpoint = '';

    switch (action) {
      case 'search': {
        const { query, type = 'track', limit = 20 } = data
        endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
        break
      }
        
      case 'play':
        endpoint = 'https://api.spotify.com/v1/me/player/play'
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        return new Response(
          JSON.stringify({ success: response.ok }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'pause':
        endpoint = 'https://api.spotify.com/v1/me/player/pause'
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${access_token}` }
        })
        return new Response(
          JSON.stringify({ success: response.ok }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'next':
        endpoint = 'https://api.spotify.com/v1/me/player/next'
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${access_token}` }
        })
        return new Response(
          JSON.stringify({ success: response.ok }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'current':
        endpoint = 'https://api.spotify.com/v1/me/player/currently-playing'
        break

      case 'audio-features': {
        const { track_id } = data
        endpoint = `https://api.spotify.com/v1/audio-features/${track_id}`
        break
      }

      default:
        throw new Error('Invalid action')
    }

    if (!response) {
      response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      })
    }

    const result = await response.json()

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.ok ? 200 : 400
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})