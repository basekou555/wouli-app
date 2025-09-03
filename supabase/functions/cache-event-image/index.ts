import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { eventId, imageUrl } = await req.json()

    if (!eventId || !imageUrl) {
      throw new Error('eventId and imageUrl are required')
    }

    console.log(`Caching image for event ${eventId}: ${imageUrl}`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the image from the external URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
    }

    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()

    // Generate filename
    const timestamp = Date.now()
    const fileName = `cached-event-${eventId}-${timestamp}.jpg`
    const filePath = `events/${fileName}`

    console.log(`Uploading image to storage: ${filePath}`)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('events-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('events-images')
      .getPublicUrl(filePath)

    const cachedImageUrl = urlData.publicUrl

    console.log(`Image uploaded successfully: ${cachedImageUrl}`)

    // Update the event with the new cached image URL
    const { error: updateError } = await supabase
      .from('events')
      .update({ image_url: cachedImageUrl })
      .eq('id', eventId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error(`Failed to update event: ${updateError.message}`)
    }

    console.log(`Event ${eventId} updated with cached image URL`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        cachedImageUrl,
        message: 'Image cached successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in cache-event-image function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})