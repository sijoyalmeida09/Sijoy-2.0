export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getGroq() {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY!,
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

export const runtime = 'nodejs'

// Commission engine (invisible to UI)
const COMMISSIONS: Record<string, number> = {
  restaurant_live: 0.05, small_party: 0.10, corporate: 0.15, wedding: 0.20,
}

function calcClientPrice(providerQuote: number, eventType: string, isFounder: boolean, bandPenalty: boolean): number {
  if (isFounder) return providerQuote
  const base = COMMISSIONS[eventType] ?? 0.10
  const rate = bandPenalty ? base + 0.05 : base
  return Math.ceil(providerQuote * (1 + rate))
}

function emit(controller: ReadableStreamDefaultController, event: object) {
  const data = `data: ${JSON.stringify(event)}\n\n`
  controller.enqueue(new TextEncoder().encode(data))
}

export async function POST(req: NextRequest) {
  const { query, budget, city: clientCity } = await req.json()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const cookieStore = cookies()
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
        )

        // Step 1: Parse intent
        emit(controller, { type: 'parsing', message: 'Understanding your celebration...' })

        const groq = getGroq()
        const VALID_CATS = ['bollywood-band','classical-music','folk-music','dj','emcee','folk-dance','dhol-player','ghazal','classical-dance','photographer','comedian','sound-light','corporate-speaker']
        const parseResponse = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 512,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [{
            role: 'system',
            content: 'You are Sohaya search engine. Parse queries into exact DB filter values. Always valid JSON.',
          }, {
            role: 'user',
            content: `Parse this Indian entertainment query.
Query: "${query}"
City hint: "${clientCity || ''}"
Budget hint: "${budget || ''}"

CRITICAL — "categories" MUST be from this EXACT list:
${VALID_CATS.map(c => `"${c}"`).join(', ')}

Mapping: band/orchestra→bollywood-band, DJ→dj, singer/ghazal/sufi→ghazal or classical-music, dancer/kathak/bharatanatyam→classical-dance or folk-dance, dhol/nagada/baraat drums→dhol-player, host/anchor/MC→emcee, comedian/standup→comedian, photographer→photographer, sound/lights→sound-light, speaker→corporate-speaker, classical/raga/sitar→classical-music, folk/rajasthani/marathi→folk-music or folk-dance

Cities: Mumbai, Vasai, Pune, Thane, Navi Mumbai, Bangalore, Delhi, Goa, Hyderabad, Jaipur

Return: {"event_type":"wedding|corporate|small_party|restaurant_live|anniversary|birthday|sangeet|reception","city":null_or_exact_city,"state":null_or_state,"categories":["exact-slugs"],"mood":"romantic|energetic|devotional|fun|professional|festive","budget_inr":number_or_null,"summary":"1 sentence","palette_types":[["cat1","cat2"]],"search_tags":["tag1"]}`,
          }],
        })

        let intent: any = {}
        try {
          const raw = parseResponse.choices[0]?.message?.content || '{}'
          intent = JSON.parse(raw)
        } catch {
          intent = { event_type: 'small_party', categories: [], budget_inr: budget || null }
        }

        const detectedBudget = intent.budget_inr || budget || null
        const detectedCity = intent.city || clientCity || null

        emit(controller, { type: 'intent', data: { ...intent, budget_inr: detectedBudget } })
        emit(controller, { type: 'matching', message: `Finding artists${detectedCity ? ` near ${detectedCity}` : ''}...` })

        // Step 2: Query artists — smart progressive search
        const METRO = ['Mumbai', 'Vasai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik']
        const isMetro = detectedCity && METRO.some(c => c.toLowerCase() === detectedCity.toLowerCase())

        // Sanitize categories
        const validCats = (intent.categories || []).filter((c: string) => VALID_CATS.includes(c))

        const queryArtists = async (cats: string[], city: string | null, budget: number | null, expandMetro: boolean) => {
          let q = supabase.from('providers').select('*').eq('status', 'verified')
            .order('avg_rating', { ascending: false }).limit(40)
          if (cats.length > 0) q = q.overlaps('categories', cats)
          if (city && !expandMetro) q = q.ilike('city', `%${city}%`)
          else if (city && expandMetro && isMetro) q = q.or(METRO.map(c => `city.ilike.%${c}%`).join(','))
          if (budget && budget > 0) q = q.lte('base_rate_inr', budget)
          const { data } = await q
          return data || []
        }

        // Progressive: strict → metro → no budget → no city → all
        let artists = await queryArtists(validCats, detectedCity, detectedBudget, false)
        if (artists.length < 3 && detectedCity) artists = await queryArtists(validCats, detectedCity, detectedBudget, true)
        if (artists.length < 3 && detectedBudget) artists = await queryArtists(validCats, detectedCity, null, true)
        if (artists.length < 3 && validCats.length > 0) artists = await queryArtists(validCats, null, null, false)
        if (artists.length === 0) {
          const { data: fallback } = await supabase.from('providers').select('*')
            .eq('status', 'verified').order('avg_rating', { ascending: false }).limit(20)
          artists = fallback || []
        }

        // Attach client display prices
        const artistsWithPricing = artists.map((a: any) => ({
          ...a,
          client_display_price: calcClientPrice(
            a.base_rate_inr || 5000,
            intent.event_type || 'small_party',
            a.is_founder || false,
            a.band_promotion_tier === 'standard_penalty'
          ),
          match_score: calcMatchScore(a, intent),
        }))
        .sort((a: any, b: any) => b.match_score - a.match_score)

        // Stream artists in 3 batches for progressive UI loading
        const batch1 = artistsWithPricing.slice(0, 6)
        const batch2 = artistsWithPricing.slice(6, 18)
        const batch3 = artistsWithPricing.slice(18)

        emit(controller, { type: 'artists_batch', batch: 1, data: batch1, total: artistsWithPricing.length })
        await delay(300)
        if (batch2.length) {
          emit(controller, { type: 'artists_batch', batch: 2, data: batch2, total: artistsWithPricing.length })
        }
        await delay(200)
        if (batch3.length) {
          emit(controller, { type: 'artists_batch', batch: 3, data: batch3, total: artistsWithPricing.length })
        }

        // Step 3: Assemble palettes
        emit(controller, { type: 'assembling', message: 'Building your perfect packages...' })
        await delay(400)

        const palettes = assemblePalettes(artistsWithPricing, intent, detectedBudget)
        for (const palette of palettes) {
          emit(controller, { type: 'palette', data: palette })
          await delay(250)
        }

        // Step 4: Generate upsells
        const upsells = generateUpsells(artistsWithPricing, palettes, intent, detectedBudget)
        emit(controller, { type: 'upsells', data: upsells })

        // Step 5: AI narrative summary
        emit(controller, { type: 'narrating', message: 'Preparing your summary...' })

        const narrative = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          max_tokens: 200,
          temperature: 0.7,
          messages: [{
            role: 'system',
            content: 'You are Sohaya, a warm Vasaikar celebration marketplace. Write brief, celebratory messages.',
          }, {
            role: 'user',
            content: `Write a warm 1-2 sentence message for a user who searched: "${query}".
Found ${artistsWithPricing.length} artists, ${palettes.length} packages.
City: ${detectedCity || 'India'}. Budget: ${detectedBudget ? '₹' + detectedBudget.toLocaleString('en-IN') : 'flexible'}.
Be warm, brief, celebratory. No markdown, no asterisks.`,
          }],
        })

        emit(controller, {
          type: 'done',
          summary: narrative.choices[0]?.message?.content?.trim() || `Found ${artistsWithPricing.length} artists for your celebration!`,
          stats: {
            artists_found: artistsWithPricing.length,
            palettes_built: palettes.length,
            live_now: artistsWithPricing.filter((a: any) => a.is_online).length,
            within_budget: detectedBudget
              ? artistsWithPricing.filter((a: any) => a.client_display_price <= detectedBudget).length
              : artistsWithPricing.length,
          }
        })

      } catch (err: any) {
        emit(controller, { type: 'error', message: err.message || 'Something went wrong' })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function calcMatchScore(artist: any, intent: any): number {
  let score = (artist.avg_rating || 3) * 20
  if (artist.is_online) score += 15
  if (artist.is_founder) score += 10
  if (artist.total_gigs > 10) score += 10
  if (artist.profile_completeness > 80) score += 5
  return score
}

function assemblePalettes(artists: any[], intent: any, budget: number | null) {
  const palettes: any[] = []
  const eventType = intent.event_type || 'small_party'

  const templates: Record<string, { name: string; roles: string[]; icon: string; description: string }[]> = {
    wedding: [
      { name: 'The Royal Sangeet Package', roles: ['DJ', 'Dhol Player', 'Emcee'], icon: '💍', description: 'Everything for an unforgettable Sangeet night' },
      { name: 'Classical Ceremony Setup', roles: ['Shehnai', 'Classical Singer', 'Tabla'], icon: '🪷', description: 'Traditional and soulful wedding ambience' },
    ],
    corporate: [
      { name: 'Premium Corporate Entertainment', roles: ['Emcee', 'Stand-Up Comedian', 'Jazz Band'], icon: '💼', description: 'Professional entertainment for your corporate event' },
    ],
    small_party: [
      { name: 'Party Starter Pack', roles: ['DJ', 'Bollywood Band', 'Dhol'], icon: '🎉', description: 'Get the party started and keep it going' },
    ],
    anniversary: [
      { name: 'Romance & Melody Package', roles: ['Ghazal Singer', 'Tabla', 'Violinist'], icon: '💕', description: 'Serenade your love story with timeless music' },
    ],
    birthday: [
      { name: 'Birthday Bash Bundle', roles: ['DJ', 'Emcee', 'Live Band'], icon: '🎂', description: 'Make it a birthday they will never forget' },
    ],
  }

  const eventTemplates = templates[eventType] || templates.small_party

  for (const template of eventTemplates) {
    const members = template.roles.map((role, i) => {
      const artist = artists[i % artists.length]
      return artist ? { ...artist, palette_role: role } : null
    }).filter(Boolean)

    if (members.length < 2) continue

    const totalProviderPrice = members.reduce((sum: number, m: any) => sum + (m.base_rate_inr || 5000), 0)
    const totalClientPrice = members.reduce((sum: number, m: any) => sum + (m.client_display_price || 6000), 0)
    const packageDiscount = Math.ceil(totalClientPrice * 0.05)
    const packagePrice = totalClientPrice - packageDiscount

    if (budget && packagePrice > budget * 1.3) continue

    palettes.push({
      id: `palette-${eventType}-${template.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: template.name,
      icon: template.icon,
      description: template.description,
      event_type: eventType,
      members,
      total_provider_price: totalProviderPrice,
      total_client_price: totalClientPrice,
      package_price: packagePrice,
      saving: packageDiscount,
      within_budget: budget ? packagePrice <= budget : true,
    })
  }

  return palettes
}

function generateUpsells(artists: any[], palettes: any[], intent: any, budget: number | null) {
  const upsells: any[] = []

  const photographer = artists.find((a: any) =>
    (a.categories || []).some((c: string) => c.includes('photo'))
  ) || artists[Math.floor(artists.length * 0.7)]

  if (photographer) {
    upsells.push({
      id: 'upsell-photo',
      type: 'add_on',
      title: '📸 Add a Wedding Photographer',
      description: `${photographer.display_name} is available. Capture every moment.`,
      artist: photographer,
      add_price: photographer.client_display_price || 8000,
      badge: 'Popular Add-on',
    })
  }

  if (palettes.length > 0 && budget) {
    const headroom = budget - palettes[0].package_price
    if (headroom > 3000) {
      const extraArtist = artists.find((a: any) => (a.client_display_price || 5000) <= headroom)
      if (extraArtist) {
        upsells.push({
          id: 'upsell-upgrade',
          type: 'upgrade',
          title: `✨ Upgrade: Add ${extraArtist.display_name}`,
          description: 'Within your budget — add them to make it extraordinary',
          artist: extraArtist,
          add_price: extraArtist.client_display_price || 4000,
          badge: 'Within Budget',
        })
      }
    }
  }

  return upsells
}
