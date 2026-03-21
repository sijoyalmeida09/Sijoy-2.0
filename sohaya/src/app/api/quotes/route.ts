import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const quoteSchema = z.object({
  lead_id: z.string().uuid(),
  quoted_amount_inr: z.number().positive(),
  services_description: z.string().min(10),
})

// Commission rates (NEVER exposed to clients)
const COMMISSION_RATES: Record<string, number> = {
  restaurant_live: 0.05,
  restaurant: 0.05,
  small_party: 0.10,
  birthday: 0.10,
  corporate: 0.15,
  anniversary: 0.12,
  wedding: 0.20,
  sangeet: 0.18,
  reception: 0.18,
  engagement: 0.15,
}

const DEFAULT_COMMISSION = 0.12

function getCommissionRate(
  eventType: string,
  isFounder: boolean,
  bandPromotionTier: string
): number {
  if (isFounder) return 0

  const base = COMMISSION_RATES[eventType] ?? DEFAULT_COMMISSION

  // Band without paid placement gets +5% penalty
  if (bandPromotionTier === 'standard_penalty') {
    return Math.min(base + 0.05, 0.30) // Cap at 30%
  }

  return base
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = quoteSchema.parse(body)

    // Get provider
    const { data: provider } = await supabase
      .from('providers')
      .select('id, is_founder, commission_tier, band_promotion_tier')
      .eq('profile_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Get lead for event type
    const { data: lead } = await supabase
      .from('leads')
      .select('event_type, status')
      .eq('id', data.lead_id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Calculate invisible commission
    const commissionRate = getCommissionRate(
      lead.event_type,
      provider.is_founder,
      provider.band_promotion_tier
    )

    // Client sees a higher number without knowing it's markup
    const clientDisplayAmount = Math.ceil(data.quoted_amount_inr * (1 + commissionRate))
    const platformCommission = clientDisplayAmount - data.quoted_amount_inr

    // Set validity to 48 hours
    const validUntil = new Date()
    validUntil.setHours(validUntil.getHours() + 48)

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        lead_id: data.lead_id,
        provider_id: provider.id,
        quoted_amount_inr: data.quoted_amount_inr,
        event_type: lead.event_type,
        commission_rate: commissionRate,   // stored internally
        client_display_amount_inr: clientDisplayAmount,
        services_description: data.services_description,
        valid_until: validUntil.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Update lead status
    await supabase.from('leads').update({ status: 'quoted' }).eq('id', data.lead_id)

    // Return quote WITHOUT exposing commission_rate to provider
    const { commission_rate: _, ...safeQuote } = quote as typeof quote & { commission_rate: number }

    return NextResponse.json(safeQuote, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Quote creation error:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
