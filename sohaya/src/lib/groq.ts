/**
 * Groq AI client — OpenAI-compatible, free tier
 * Model: llama-3.3-70b-versatile (best free model for Indian context parsing)
 * Fallback model: mixtral-8x7b-32768 (faster, slightly less accurate)
 */
import OpenAI from 'openai'
import { AISearchResponse, ChatMessage, PaletteSuggestion } from '@/types'

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1',
})

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
export const GROQ_FAST_MODEL = 'llama-3.1-8b-instant' // for cheap/fast calls

const SOHALA_SYSTEM_PROMPT = `You are Sohaya Concierge, an expert Vasaikar celebration marketplace assistant.
You help clients find the perfect artists for weddings, ceremonies, corporate events, and celebrations — rooted in Vasai and Maharashtra.
You understand Vasaikar cultural context deeply — from sangeet and religious ceremonies to corporate award nights, from classical ragas to Bollywood DJs.
You communicate warmly, knowledgeably, and with enthusiasm for Vasaikar performing arts.
Always respond in JSON format when asked to parse queries. Never expose commission rates or internal pricing data.`

export async function parseSearchQuery(query: string): Promise<AISearchResponse> {
  const res = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 512,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SOHALA_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Parse this entertainment search query and return a JSON object with these fields:
- categories: array of artist/entertainment category slugs (e.g. "bollywood-band", "ghazal", "dj", "classical", "folk", "dancer", "comedian", "dhol", "emcee", "speaker", "sound-light", "photographer")
- city: city name if mentioned
- state: state name if mentioned or inferred
- event_type: one of "wedding", "corporate", "restaurant", "small_party", "anniversary", "birthday", "sangeet", "engagement", "reception"
- mood: one of "romantic", "energetic", "elegant", "fun", "spiritual", "corporate", "festive"
- budget_hint: number in INR if mentioned, else null
- guest_count: number if mentioned, else null
- language_preference: language if mentioned, else null
- narrative: a friendly 1-sentence description of what they need

Query: "${query}"`,
      },
    ],
  })

  const text = res.choices[0]?.message?.content || '{}'
  try {
    return JSON.parse(text)
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
      { role: 'system', content: SOHALA_SYSTEM_PROMPT },
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
      { role: 'system', content: SOHALA_SYSTEM_PROMPT },
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
      { role: 'system', content: SOHALA_SYSTEM_PROMPT },
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
    ? `${SOHALA_SYSTEM_PROMPT}\n\nContext: ${context}`
    : SOHALA_SYSTEM_PROMPT

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
