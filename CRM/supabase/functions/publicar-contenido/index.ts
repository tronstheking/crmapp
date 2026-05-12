import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const META_TOKEN = Deno.env.get('META_TOKEN')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    const now = new Date().toISOString()

    // 1. Find scheduled content for today
    const { data: scheduledItems, error } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('status', 'programado')
      .lte('scheduled_date', now)

    if (error) throw error

    const results = []

    for (const item of scheduledItems) {
      try {
        // 2. Publish to Instagram via Meta Graph API
        // This is a simplified version. Actual publishing requires container creation + publishing steps.
        const igUserId = 'YOUR_IG_USER_ID' // This should be configured
        
        // Step A: Create Media Container
        const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(item.image_url)}&caption=${encodeURIComponent(item.caption + '\n\n' + item.hashtags)}&access_token=${META_TOKEN}`, {
          method: 'POST'
        })
        const containerData = await containerRes.json()
        
        if (containerData.id) {
          // Step B: Publish Container
          const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${containerData.id}&access_token=${META_TOKEN}`, {
            method: 'POST'
          })
          const publishData = await publishRes.json()

          if (publishData.id) {
            await supabase.from('content_calendar').update({ status: 'publicado' }).eq('id', item.id)
            results.push({ id: item.id, status: 'success' })
          } else {
            throw new Error(JSON.stringify(publishData))
          }
        } else {
          throw new Error(JSON.stringify(containerData))
        }
      } catch (err) {
        console.error(`Failed to publish item ${item.id}:`, err)
        await supabase.from('content_calendar').update({ status: 'fallido' }).eq('id', item.id)
        results.push({ id: item.id, status: 'error', message: err.message })
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), { status: 200 })
  } catch (error) {
    console.error('Publishing error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
