import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  profile_id: z.string().uuid(),
  entity_type: z.enum(['individual', 'band', 'agency']),
  display_name: z.string().min(2).max(100),
  band_name: z.string().optional().nullable(),
  categories: z.array(z.string()).min(1),
  ai_generated_bio: z.string().optional(),
  instruments: z.array(z.string()).optional(),
  base_rate_inr: z.number().positive(),
  hourly_rate_inr: z.number().positive().optional().nullable(),
  travel_radius_km: z.number().min(5).max(1000).default(50),
  city: z.string().min(2),
  state: z.string().min(2),
  languages: z.array(z.string()).min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)
    const supabase = createClient()

    // Verify the authenticated user matches profile_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== data.profile_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if profile exists, create if not
    await supabase.from('profiles').upsert({
      id: data.profile_id,
      email: user.email,
      full_name: data.display_name,
      role: 'provider',
    })

    // Calculate profile completeness
    const profileCompleteness = [
      data.display_name ? 20 : 0,
      data.categories.length > 0 ? 15 : 0,
      data.ai_generated_bio ? 20 : 0,
      data.base_rate_inr > 0 ? 15 : 0,
      data.city ? 10 : 0,
      data.languages.length > 0 ? 10 : 0,
      data.instruments && data.instruments.length > 0 ? 10 : 0,
    ].reduce((a, b) => a + b, 0)

    const { data: provider, error } = await supabase
      .from('providers')
      .insert({
        profile_id: data.profile_id,
        entity_type: data.entity_type,
        display_name: data.display_name,
        band_name: data.band_name,
        categories: data.categories,
        ai_generated_bio: data.ai_generated_bio,
        instruments: data.instruments ?? [],
        base_rate_inr: data.base_rate_inr,
        hourly_rate_inr: data.hourly_rate_inr,
        travel_radius_km: data.travel_radius_km,
        city: data.city,
        state: data.state,
        languages: data.languages,
        status: 'pending',
        is_online: false,
        is_founder: false,
        avg_rating: 0,
        total_gigs: 0,
        response_rate: 100,
        commission_tier: 'standard',
        band_promotion_tier: 'basic',
        subscription_tier: 'free',
        photo_urls: [],
        audio_urls: [],
        profile_completeness: profileCompleteness,
      })
      .select()
      .single()

    if (error) {
      console.error('Provider registration error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(provider, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
