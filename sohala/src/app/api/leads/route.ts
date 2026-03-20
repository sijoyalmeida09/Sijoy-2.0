import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const leadSchema = z.object({
  event_type: z.string().min(2),
  event_date: z.string(),
  event_time: z.string().optional(),
  duration_hours: z.number().optional(),
  location_text: z.string().min(2),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  budget_hint_inr: z.number().positive().optional(),
  notes: z.string().optional(),
  provider_id: z.string().uuid().optional(), // Direct booking to specific provider
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = leadSchema.parse(body)

    // Get or create client record
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? 'Client',
        role: 'client',
      })
    }

    let { data: clientRecord } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!clientRecord) {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ profile_id: user.id })
        .select()
        .single()
      clientRecord = newClient
    }

    if (!clientRecord) {
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        client_id: clientRecord.id,
        event_type: data.event_type,
        event_date: data.event_date,
        event_time: data.event_time,
        duration_hours: data.duration_hours,
        location_text: data.location_text,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        budget_hint_inr: data.budget_hint_inr,
        notes: data.notes,
        status: 'open',
      })
      .select()
      .single()

    if (leadError || !lead) throw leadError

    // If direct provider specified, send only to them
    if (data.provider_id) {
      await supabase.from('lead_providers').insert({
        lead_id: lead.id,
        provider_id: data.provider_id,
        sent_at: new Date().toISOString(),
      })
    } else {
      // Distribute to matching providers
      let matchQuery = supabase
        .from('providers')
        .select('id')
        .eq('status', 'verified')

      // Use inferred categories from event type
      const eventTypeCategories: Record<string, string[]> = {
        wedding: ['bollywood-band', 'wedding-specialist', 'dhol', 'emcee'],
        sangeet: ['bollywood-band', 'dj', 'dhol', 'dancer'],
        corporate: ['corporate-speaker', 'emcee', 'bollywood-band', 'dj'],
        birthday: ['dj', 'comedian', 'emcee'],
        anniversary: ['ghazal', 'classical', 'bollywood-band'],
      }

      const categories = eventTypeCategories[data.event_type] ?? []
      if (categories.length > 0) {
        matchQuery = matchQuery.overlaps('categories', categories)
      }

      if (data.budget_hint_inr) {
        matchQuery = matchQuery.lte('base_rate_inr', data.budget_hint_inr * 1.5)
      }

      const { data: matchedProviders } = await matchQuery.limit(10)

      if (matchedProviders && matchedProviders.length > 0) {
        await supabase.from('lead_providers').insert(
          matchedProviders.map((p) => ({
            lead_id: lead.id,
            provider_id: p.id,
            sent_at: new Date().toISOString(),
          }))
        )

        // Update lead status
        await supabase.from('leads').update({ status: 'matched' }).eq('id', lead.id)
      }
    }

    return NextResponse.json({ lead_id: lead.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Lead creation error:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!client) return NextResponse.json({ leads: [] })

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ leads: leads ?? [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
