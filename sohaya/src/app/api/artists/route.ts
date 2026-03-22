export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const event_type = searchParams.get('event_type')
    const is_online = searchParams.get('is_online')
    const is_founder = searchParams.get('is_founder')
    const budget_max = searchParams.get('budget_max')
    const sort = searchParams.get('sort') ?? 'rating'
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const supabase = createClient()

    let query = supabase
      .from('providers')
      .select('*', { count: 'exact' })
      .eq('status', 'verified')
      .range((page - 1) * limit, page * limit - 1)

    if (category) {
      query = query.contains('categories', [category])
    }
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }
    if (is_online === 'true') {
      query = query.eq('is_online', true)
    }
    if (is_founder === 'true') {
      query = query.eq('is_founder', true)
    }
    if (budget_max) {
      query = query.lte('base_rate_inr', parseInt(budget_max))
    }

    // Sorting
    switch (sort) {
      case 'rating':
        query = query.order('avg_rating', { ascending: false })
        break
      case 'price_asc':
        query = query.order('base_rate_inr', { ascending: true })
        break
      case 'price_desc':
        query = query.order('base_rate_inr', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'gigs':
        query = query.order('total_gigs', { ascending: false })
        break
      default:
        query = query.order('avg_rating', { ascending: false })
    }

    const { data, count, error } = await query

    if (error) {
      // Range out of bounds returns 416 from PostgREST — return empty array
      if (error.code === 'PGRST103' || error.message?.includes('range')) {
        return NextResponse.json({ artists: [], total: count ?? 0, page, limit, pages: 0 })
      }
      throw error
    }

    return NextResponse.json({
      artists: data,
      total: count ?? 0,
      page,
      limit,
      pages: Math.ceil((count ?? 0) / limit),
    })
  } catch (error) {
    console.error('Artists fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}
