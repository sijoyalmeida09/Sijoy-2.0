import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') ?? 'client'

    if (role === 'provider') {
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!provider) return NextResponse.json({ bookings: [] })

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', provider.id)
        .order('event_date', { ascending: true })

      return NextResponse.json({ bookings: bookings ?? [] })
    } else {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!client) return NextResponse.json({ bookings: [] })

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, provider:providers(display_name, photo_urls, avg_rating, categories, city)')
        .eq('client_id', client.id)
        .order('event_date', { ascending: false })

      return NextResponse.json({ bookings: bookings ?? [] })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
