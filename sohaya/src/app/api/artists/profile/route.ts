import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: provider } = await supabase
      .from('providers')
      .select('*, portfolio:artist_portfolio(*), services:artist_services(*)')
      .eq('profile_id', user.id)
      .single()

    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

    return NextResponse.json(provider)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Whitelist allowed fields
    const allowed = [
      'display_name', 'band_name', 'bio', 'ai_generated_bio',
      'categories', 'instruments', 'city', 'state', 'languages',
      'base_rate_inr', 'hourly_rate_inr', 'travel_radius_km',
      'photo_urls', 'audio_urls', 'video_preview_url', 'entity_type',
    ]

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    // Recalculate profile completeness
    const completeness = [
      body.display_name || updates.display_name ? 20 : 0,
      (body.categories || []).length > 0 ? 15 : 0,
      body.bio || body.ai_generated_bio ? 20 : 0,
      (body.base_rate_inr || 0) > 0 ? 15 : 0,
      body.city ? 10 : 0,
      (body.languages || []).length > 0 ? 10 : 0,
      (body.photo_urls || []).length > 0 ? 10 : 0,
    ].reduce((a, b) => a + b, 0)
    updates.profile_completeness = completeness

    const { data, error } = await supabase
      .from('providers')
      .update(updates)
      .eq('profile_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
