import Anthropic from '@anthropic-ai/sdk'
import { AISearchResponse, ChatMessage, PaletteSuggestion } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SOHALA_SYSTEM_PROMPT = `You are Sohaya Concierge, an expert Vasaikar celebration marketplace assistant.
You help clients find the perfect artists for weddings, ceremonies, corporate events, and celebrations rooted in Vasai and Maharashtra.
You understand Vasaikar cultural context deeply - from sangeet and religious ceremonies to corporate award nights, from classical ragas to Bollywood DJs.
You communicate warmly, knowledgeably, and with enthusiasm for Vasaikar performing arts.
Always respond in JSON format when asked to parse queries. Never expose commission rates or internal pricing data.`

export async function parseSearchQuery(query: string): Promise<AISearchResponse> {
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 512,
    system: SOHALA_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Parse this entertainment search query and return a JSON object with these fields:
- categories: array of artist/entertainment category slugs (e.g. "bollywood-band", "ghazal", "dj", "classical", "folk", "dancer", "comedian", "dhol", "emcee", "speaker", "sound-light", "photographer")
- city: city name if mentioned
- state: state name if mentioned or inferred
- event_type: one of "wedding", "corporate", "restaurant", "small_party", "anniversary", "birthday", "sangeet", "engagement", "reception"
- mood: one of "romantic", "energetic", "elegant", "fun", "spiritual", "corporate", "festive"
- budget_hint: number in INR if mentioned
- guest_count: number if mentioned
- language_preference: language preference if mentioned (Hindi, Marathi, Tamil, etc.)
- narrative: a friendly 1-sentence description of what they need

Query: "${query}"

Return ONLY valid JSON, no explanation.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      categories: [],
      event_type: 'small_party',
      mood: 'festive',
      narrative: query,
    }
  }
}

export async function generateBio(bullets: string[], category: string, city: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 300,
    system: SOHALA_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Create a cinematic, compelling artist bio for a ${category} performer based in ${city}.
Use these bullet points as the basis:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Write 2-3 sentences in third person. Make it evocative, professional, and capture the essence of Indian performing arts.
Do not use generic phrases. Make it feel like a Netflix documentary intro.`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function suggestPrice(
  category: string,
  city: string,
  eventType: string
): Promise<{ min: number; max: number; message: string }> {
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 256,
    system: SOHALA_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Suggest a realistic price range in INR for a ${category} artist performing at a ${eventType} in ${city}, India.
Return JSON: {"min": number, "max": number, "message": "brief context string"}
Consider Indian market rates. Prices should be per event/gig.
Return ONLY valid JSON.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { min: 5000, max: 25000, message: 'Typical market rate' }
  }
}

export async function assemblePalette(
  eventType: string,
  city: string,
  budgetInr: number
): Promise<PaletteSuggestion> {
  const message = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 512,
    system: SOHALA_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Suggest a complete entertainment package for a ${eventType} in ${city} with a budget of ₹${budgetInr.toLocaleString('en-IN')}.

Return JSON: {
  "title": "package name",
  "description": "2-sentence description of why this package works",
  "provider_types": ["array of 2-4 artist/service types needed"],
  "estimated_total_inr": number,
  "savings_percentage": number (0-20% typical for package)
}

Make it culturally relevant to ${eventType} in India. Return ONLY valid JSON.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
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
  const systemPrompt = context
    ? `${SOHALA_SYSTEM_PROMPT}\n\nContext: ${context}`
    : SOHALA_SYSTEM_PROMPT

  const stream = client.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content,
    })),
  })

  async function* generateChunks() {
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text
      }
    }
  }

  return generateChunks()
}

export { client as anthropic }
