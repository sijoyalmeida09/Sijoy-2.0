export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { ChatMessage } from '@/types'

const SYSTEM_PROMPT = `You are Sohaya Concierge, a warm and knowledgeable Vasaikar entertainment expert.
You help clients find perfect artists for weddings, ceremonies, corporate events, and celebrations — starting from Vasai and Maharashtra.
You understand Vasaikar cultural nuances — from Sangeet and religious ceremonies to corporate events.
When recommending artists, consider: event type, city, budget, guest count, cultural preferences.
Be warm, enthusiastic, and helpful. Use a conversational tone with occasional Hindi/Marathi phrases.
When the user describes their event, extract key details and provide structured recommendations.
Always end with 1-2 specific follow-up questions to refine the search.`

export async function POST(req: NextRequest) {
  try {
    const { messages, context }: { messages: ChatMessage[]; context?: string } = await req.json()

    const systemContent = context ? `${SYSTEM_PROMPT}\n\nContext: ${context}` : SYSTEM_PROMPT

    const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY!, baseURL: 'https://api.groq.com/openai/v1' })
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemContent },
        ...messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return Response.json({ error: 'AI service error' }, { status: 500 })
  }
}
