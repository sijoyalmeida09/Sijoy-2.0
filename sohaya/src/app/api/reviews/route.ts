import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const reviewSchema = z.object({
  booking_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10).max(2000),
  photo_urls: z.array(z.string().url()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = reviewSchema.parse(body)

    // Get client
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Verify booking belongs to this client
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', data.booking_id)
      .eq('client_id', client.id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed bookings' }, { status: 400 })
    }

    // Check no existing review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', data.booking_id)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'Already reviewed this booking' }, { status: 409 })
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        booking_id: data.booking_id,
        provider_id: data.provider_id,
        client_id: client.id,
        rating: data.rating,
        title: data.title,
        body: data.body,
        photo_urls: data.photo_urls ?? [],
        is_verified: true, // verified because it's from a completed booking
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
