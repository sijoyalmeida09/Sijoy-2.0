export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { parseSearchQuery, assemblePalette } from '@/lib/groq'
import { createClient } from '@/lib/supabase/server'
import { Provider, SearchResult } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { query }: { query: string } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // Parse query with AI
    const interpretation = await parseSearchQuery(query)

    const supabase = createClient()

    // Mumbai metro proximity: if user says Vasai, also search Mumbai/Thane/Navi Mumbai
    const MUMBAI_METRO = ['Mumbai', 'Vasai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik']
    const isMetro = interpretation.city && MUMBAI_METRO.some(c => c.toLowerCase() === interpretation.city?.toLowerCase())

    // STRATEGY: Try strict match first, then progressively relax filters
    const searchArtists = async (categories: string[], city: string | null, budget: number | null, expandCity: boolean) => {
      let q = supabase
        .from('providers')
        .select('*')
        .eq('status', 'verified')
        .order('avg_rating', { ascending: false })
        .limit(15)

      if (categories.length > 0) {
        q = q.overlaps('categories', categories)
      }

      if (city && !expandCity) {
        q = q.ilike('city', `%${city}%`)
      } else if (city && expandCity && isMetro) {
        // Search entire Mumbai metro area
        q = q.or(MUMBAI_METRO.map(c => `city.ilike.%${c}%`).join(','))
      }

      if (budget && budget > 0) {
        q = q.lte('base_rate_inr', budget)
      }

      const { data } = await q
      return (data ?? []) as Provider[]
    }

    let finalArtists: Provider[] = []

    // Step 1: Strict match (category + city + budget)
    finalArtists = await searchArtists(
      interpretation.categories || [],
      interpretation.city || null,
      interpretation.budget_hint || null,
      false
    )

    // Step 2: If <3 results, expand to metro area
    if (finalArtists.length < 3 && interpretation.city) {
      finalArtists = await searchArtists(
        interpretation.categories || [],
        interpretation.city,
        interpretation.budget_hint || null,
        true
      )
    }

    // Step 3: If still <3, drop budget filter
    if (finalArtists.length < 3 && interpretation.budget_hint) {
      finalArtists = await searchArtists(
        interpretation.categories || [],
        interpretation.city || null,
        null,
        true
      )
    }

    // Step 4: If still <3, drop city filter (nationwide for this category)
    if (finalArtists.length < 3 && interpretation.categories?.length > 0) {
      finalArtists = await searchArtists(
        interpretation.categories,
        null,
        null,
        false
      )
    }

    // Step 5: Last resort — top rated in relevant categories or overall
    if (finalArtists.length === 0) {
      const { data: fallback } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'verified')
        .order('avg_rating', { ascending: false })
        .limit(6)
      finalArtists = (fallback ?? []) as Provider[]
    }

    // Generate palette suggestion if we have a budget
    let palette_suggestion = undefined
    if (interpretation.budget_hint && interpretation.budget_hint > 0) {
      try {
        palette_suggestion = await assemblePalette(
          interpretation.event_type,
          interpretation.city ?? 'India',
          interpretation.budget_hint
        )
      } catch {
        // Palette suggestion is optional
      }
    }

    // Log search for market intelligence (fire-and-forget)
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminDb = createAdminClient()
    Promise.resolve(adminDb.from('search_analytics').insert({
      query,
      parsed_categories: interpretation.categories || [],
      parsed_city: interpretation.city || null,
      parsed_budget: interpretation.budget_hint || null,
      parsed_event_type: interpretation.event_type || null,
      results_count: finalArtists.length,
    })).catch(() => {})

    const result: SearchResult = {
      interpretation,
      artists: finalArtists,
      palette_suggestion,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
