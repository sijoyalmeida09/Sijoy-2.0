import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { provider_id, action, is_founder } = await req.json()

    if (!provider_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'provider_id and action required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    const updateData: Record<string, unknown> = {
      status: action === 'approve' ? 'verified' : 'rejected',
      updated_at: new Date().toISOString(),
    }

    if (action === 'approve' && typeof is_founder === 'boolean') {
      updateData.is_founder = is_founder
      if (is_founder) {
        updateData.commission_tier = 'founder'
      }
    }

    const { data, error } = await adminSupabase
      .from('providers')
      .update(updateData)
      .eq('id', provider_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, provider: data })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
