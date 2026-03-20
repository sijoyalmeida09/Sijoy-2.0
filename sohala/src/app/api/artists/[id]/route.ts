import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Artist fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch artist' }, { status: 500 })
  }
}
