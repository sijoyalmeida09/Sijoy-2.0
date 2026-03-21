import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status, notes }: { status: string; notes?: string } = await req.json()

    const validStatuses = ['confirmed', 'completed', 'cancelled', 'disputed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify caller is the provider or client on this booking
    const [{ data: provider }, { data: client }] = await Promise.all([
      supabase.from('providers').select('id').eq('profile_id', user.id).single(),
      supabase.from('clients').select('id').eq('profile_id', user.id).single(),
    ])

    const isOwner =
      (provider && booking.provider_id === provider.id) ||
      (client && booking.client_id === client.id)

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (notes) updateData.notes = notes

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Booking status error:', error)
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
  }
}
