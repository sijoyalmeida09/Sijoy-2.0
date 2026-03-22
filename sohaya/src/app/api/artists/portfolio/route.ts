import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get('provider_id')
  if (!providerId) return NextResponse.json({ error: 'provider_id required' }, { status: 400 })

  const supabase = createClient()
  const { data } = await supabase
    .from('artist_portfolio')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_public', true)
    .order('sort_order', { ascending: true })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 })

    const body = await req.json()
    const { item_type, title, description, media_url, thumbnail_url, metadata } = body

    if (!item_type || !title) {
      return NextResponse.json({ error: 'item_type and title required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('artist_portfolio')
      .insert({
        provider_id: provider.id,
        item_type,
        title,
        description: description || null,
        media_url: media_url || null,
        thumbnail_url: thumbnail_url || null,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase
      .from('artist_portfolio')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
