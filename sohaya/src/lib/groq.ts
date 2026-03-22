/**
 * Groq AI client — OpenAI-compatible, free tier
 * Model: llama-3.3-70b-versatile (best free model for Indian context parsing)
 * Fallback model: mixtral-8x7b-32768 (faster, slightly less accurate)
 */
import OpenAI from 'openai'
import { AISearchResponse, ChatMessage, PaletteSuggestion } from '@/types'

// Lazy-initialized to avoid module-level errors during Next.js build
let _groq: OpenAI | null = null
export function getGroq(): OpenAI {
  if (!_groq) {
    _groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY!, baseURL: 'https://api.groq.com/openai/v1' })
  }
  return _groq
}
/** @deprecated use getGroq() */
export const groq = new Proxy({} as OpenAI, { get: (_, prop) => getGroq()[prop as keyof OpenAI] })

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
export const GROQ_FAST_MODEL = 'llama-3.1-8b-instant' // for cheap/fast calls

const SOHAYA_SYSTEM_PROMPT = `You are Sohaya's search engine for an Indian entertainment booking marketplace.
You parse user queries to find the right artists. You MUST return category slugs that EXACTLY match these available values.
Never expose commission rates or internal pricing. Always respond in JSON.`

// Exact DB category slugs — the LLM MUST output ONLY these values
const VALID_CATEGORIES = [
  'bollywood-band', 'classical-music', 'folk-music', 'dj', 'emcee',
  'folk-dance', 'dhol-player', 'ghazal', 'classical-dance',
  'photographer', 'comedian', 'sound-light', 'corporate-speaker',
]

// Mumbai metro area cities that are close to each other
const MUMBAI_METRO = ['Mumbai', 'Vasai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik']

export async function parseSearchQuery(query: string): Promise<AISearchResponse> {
  const res = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 512,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SOHAYA_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Parse this Indian entertainment search query. Return JSON with:

IMPORTANT — "categories" MUST be from this EXACT list (use multiple if relevant):
${VALID_CATEGORIES.map(c => `"${c}"`).join(', ')}

Mapping guide:
- "band"/"live band"/"orchestra" → "bollywood-band"
- "DJ"/"disc jockey"/"EDM" → "dj"
- "singer"/"vocalist"/"ghazal"/"sufi" → "ghazal" or "folk-music" or "classical-music"
- "dancer"/"bharatanatyam"/"kathak" → "classical-dance" or "folk-dance"
- "dhol"/"nagada"/"tasha"/"drums for baraat" → "dhol-player"
- "host"/"anchor"/"MC"/"emcee" → "emcee"
- "comedian"/"standup"/"comedy" → "comedian"
- "photographer"/"videographer"/"photo" → "photographer"
- "sound"/"lights"/"AV"/"PA system" → "sound-light"
- "speaker"/"motivational"/"corporate speaker" → "corporate-speaker"
- "classical"/"raga"/"sitar"/"flute"/"tabla" → "classical-music"
- "folk"/"rajasthani"/"marathi"/"lavani" → "folk-music" or "folk-dance"

Available cities: Mumbai, Vasai, Pune, Thane, Navi Mumbai, Bangalore, Delhi, Goa, Hyderabad, Jaipur, Lucknow, Nashik, Chennai, Kolkata, Varanasi

Return:
{
  "categories": ["exact-slug-from-list"],
  "city": "exact city name or null",
  "event_type": "wedding|corporate|restaurant|small_party|anniversary|birthday|sangeet|engagement|reception",
  "budget_hint": number_in_INR_or_null,
  "mood": "romantic|energetic|elegant|fun|spiritual|corporate|festive",
  "narrative": "friendly 1-sentence summary"
}

Query: "${query}"`,
      },
    ],
  })

  const text = res.choices[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(text)
    // Sanitize: only keep valid categories
    if (parsed.categories) {
      parsed.categories = parsed.categories.filter((c: string) => VALID_CATEGORIES.includes(c))
    }
    return parsed
  } catch {
    return { categories: [], event_type: 'small_party', mood: 'festive', narrative: query }
  }
}

export async function generateBio(bullets: string[], category: string, city: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 300,
    temperature: 0.7,
    messages: [
      { role: 'system', content: SOHAYA_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Create a cinematic, compelling artist bio for a ${category} performer based in ${city}.
Use these bullet points as the basis:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Write 2-3 sentences in third person. Make it evocative, professional, and capture the essence of Indian performing arts.
Do not use generic phrases. Make it feel like a Netflix documentary intro. Return only the bio text, no quotes.`,
      },
    ],
  })
  return res.choices[0]?.message?.content?.trim() || ''
}

export async function suggestPrice(
  category: string,
  city: string,
  eventType: string
): Promise<{ min: number; max: number; message: string }> {
  const res = await groq.chat.completions.create({
    model: GROQ_FAST_MODEL,
    max_tokens: 150,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SOHAYA_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest a realistic price range in INR for a ${category} artist performing at a ${eventType} in ${city}, India.
Return JSON: {"min": number, "max": number, "message": "brief context string"}
Consider Indian market rates. Prices should be per event/gig.`,
      },
    ],
  })
  const text = res.choices[0]?.message?.content || '{}'
  try {
    return JSON.parse(text)
  } catch {
    return { min: 5000, max: 25000, message: 'Typical market rate' }
  }
}

export async function assemblePalette(
  eventType: string,
  city: string,
  budgetInr: number
): Promise<PaletteSuggestion> {
  const res = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 400,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SOHAYA_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest a complete entertainment package for a ${eventType} in ${city} with a budget of ₹${budgetInr.toLocaleString('en-IN')}.
Return JSON: {
  "title": "package name",
  "description": "2-sentence description of why this package works",
  "provider_types": ["array of 2-4 artist/service types needed"],
  "estimated_total_inr": number,
  "savings_percentage": number
}
Make it culturally relevant to ${eventType} in India.`,
      },
    ],
  })
  const text = res.choices[0]?.message?.content || '{}'
  try {
    return JSON.parse(text)
  } catch {
    return {
      title: 'Complete Entertainment Package',
      description: 'A curated selection of performers for your celebration.',
      provider_types: ['Band', 'DJ', 'Emcee'],
      estimated_total_inr: budgetInr,
      savings_percentage: 10,
    }
  }
}

export async function chatWithSohala(
  messages: ChatMessage[],
  context?: string
): Promise<AsyncIterable<string>> {
  const systemContent = context
    ? `${SOHAYA_SYSTEM_PROMPT}\n\nContext: ${context}`
    : SOHAYA_SYSTEM_PROMPT

  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 1024,
    stream: true,
    messages: [
      { role: 'system', content: systemContent },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
  })

  async function* generateChunks() {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  }

  return generateChunks()
}
