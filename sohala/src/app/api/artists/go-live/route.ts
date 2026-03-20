import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { is_online, lat, lng }: { is_online: boolean; lat?: number; lng?: number } = await req.json()

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      is_online,
      updated_at: new Date().toISOString(),
    }

    if (is_online && lat && lng) {
      updateData.live_location = { lat, lng }
    }

    if (!is_online) {
      updateData.live_location = null
    }

    const { error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', provider.id)

    if (error) throw error

    // Broadcast via Realtime if going live
    if (is_online) {
      const { data: fullProvider } = await supabase
        .from('providers')
        .select('id, display_name, categories, base_rate_inr, city, state')
        .eq('id', provider.id)
        .single()

      await supabase.channel('gig_feed_events').send({
        type: 'broadcast',
        event: 'provider_online',
        payload: {
          provider_id: provider.id,
          ...fullProvider,
          location: lat && lng ? { lat, lng } : null,
        },
      })
    }

    return NextResponse.json({ success: true, is_online })
  } catch (error) {
    console.error('Go live error:', error)
    return NextResponse.json({ error: 'Failed to update live status' }, { status: 500 })
  }
}
