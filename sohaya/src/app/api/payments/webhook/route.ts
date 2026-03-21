import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature') ?? ''

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = createAdminClient()

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        const bookingId = payment.notes?.booking_id

        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              razorpay_payment_id: payment.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
        }
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        const bookingId = payment.notes?.booking_id

        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              status: 'cancelled',
              notes: `Payment failed: ${payment.error_description}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
        }
        break
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity
        // Handle refund — update booking status
        console.log('Refund created:', refund.id)
        break
      }

      default:
        console.log('Unhandled Razorpay event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
