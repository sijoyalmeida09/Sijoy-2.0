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

    // Parse query with Claude
    const interpretation = await parseSearchQuery(query)

    // Build Supabase query
    const supabase = createClient()
    let dbQuery = supabase
      .from('providers')
      .select('*')
      .eq('status', 'verified')
      .order('avg_rating', { ascending: false })
      .limit(12)

    if (interpretation.categories?.length > 0) {
      dbQuery = dbQuery.overlaps('categories', interpretation.categories)
    }

    if (interpretation.city) {
      dbQuery = dbQuery.ilike('city', `%${interpretation.city}%`)
    }

    if (interpretation.budget_hint && interpretation.budget_hint > 0) {
      dbQuery = dbQuery.lte('base_rate_inr', interpretation.budget_hint)
    }

    const { data: artists, error } = await dbQuery

    if (error) {
      console.error('Supabase query error:', error)
    }

    // Fallback: if no results with filters, fetch top artists
    let finalArtists: Provider[] = (artists ?? []) as Provider[]
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
