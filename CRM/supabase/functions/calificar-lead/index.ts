import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const { contact_id, message } = await req.json()

    // Call Gemini API
    const prompt = `Analiza el siguiente mensaje de un usuario en Instagram y clasifica su intención como 'interesado', 'consulta' o 'spam'. 
    Responde ÚNICAMENTE con la palabra de la categoría.
    Mensaje: "${message}"`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const data = await response.json()
    const rawIntent = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim() || 'consulta'
    
    let status = 'Nuevo Lead'
    if (rawIntent.includes('interesado')) status = 'Interesado'
    else if (rawIntent.includes('spam')) status = 'Nuevo Lead' // Or some other handling
    else status = 'Contactado'

    // Update Contact Status
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', contact_id)

    if (error) throw error

    return new Response(JSON.stringify({ success: true, status }), { status: 200 })
  } catch (error) {
    console.error('Qualification error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
