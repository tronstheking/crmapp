import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VERIFY_TOKEN = Deno.env.get('VERIFY_TOKEN')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  const { method } = req

  // GET request for webhook verification
  if (method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // POST request for webhook events
  if (method === 'POST') {
    try {
      const body = await req.json()
      console.log('Webhook payload:', JSON.stringify(body, null, 2))

      // Process each entry
      for (const entry of body.entry) {
        for (const messaging of (entry.messaging || [])) {
          const senderId = messaging.sender.id
          const messageText = messaging.message?.text

          if (messageText) {
            // 1. Get or Create Contact
            const { data: contact, error: contactError } = await supabase
              .from('contacts')
              .upsert({ instagram_username: senderId }, { onConflict: 'instagram_username' })
              .select()
              .single()

            if (contactError) throw contactError

            // 2. Save Interaction
            await supabase.from('interactions').insert({
              contact_id: contact.id,
              type: 'dm',
              content: messageText
            })

            // 3. Trigger Lead Qualification (Async call to another function)
            fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/calificar-lead`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ contact_id: contact.id, message: messageText })
            }).catch(err => console.error('Error triggering qualification:', err))
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
      console.error('Webhook error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
