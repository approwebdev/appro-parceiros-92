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
    const googleMapsKey = 'AIzaSyBPTdjV1MZ_cdQdaypI-8zjtFOx3EnGYIA';
    console.log('Google Maps Key configurada: SIM');
    
    console.log('Retornando chave Google Maps com sucesso');
    return new Response(
      JSON.stringify({ key: googleMapsKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})