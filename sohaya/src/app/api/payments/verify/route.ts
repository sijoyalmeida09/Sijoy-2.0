import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { booking_id, utr } = await req.json()

    if (!booking_id || !utr) {
      return NextResponse.json({ error: 'booking_id and utr required' }, { status: 400 })
    }

    // Resolve client_id for ownership check
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'pending_verification',
        utr_number: utr.trim().toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id)
      .eq('client_id', client.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('UTR submit error:', error)
    return NextResponse.json({ error: 'Failed to submit payment proof' }, { status: 500 })
  }
}
