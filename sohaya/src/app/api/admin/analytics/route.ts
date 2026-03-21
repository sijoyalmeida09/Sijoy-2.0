export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
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

    const adminSupabase = createAdminClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      { count: online_providers },
      { count: active_gigs },
      { count: pending_leads },
      { count: pending_verifications },
      { data: todayBookings },
      { data: monthBookings },
      { count: total_providers },
      { count: total_clients },
    ] = await Promise.all([
      adminSupabase.from('providers').select('id', { count: 'exact' }).eq('is_online', true),
      adminSupabase.from('instant_gigs').select('id', { count: 'exact' }).eq('status', 'broadcast'),
      adminSupabase.from('leads').select('id', { count: 'exact' }).eq('status', 'open'),
      adminSupabase.from('providers').select('id', { count: 'exact' }).eq('status', 'pending'),
      adminSupabase.from('bookings').select('total_amount_inr, platform_commission_inr').gte('created_at', today.toISOString()),
      adminSupabase.from('bookings').select('total_amount_inr, platform_commission_inr').gte('created_at', monthStart.toISOString()),
      adminSupabase.from('providers').select('id', { count: 'exact' }),
      adminSupabase.from('clients').select('id', { count: 'exact' }),
    ])

    const gmv_today = (todayBookings ?? []).reduce((sum, b) => sum + (b.total_amount_inr ?? 0), 0)
    const gmv_month = (monthBookings ?? []).reduce((sum, b) => sum + (b.total_amount_inr ?? 0), 0)
    const commission_today = (todayBookings ?? []).reduce((sum, b) => sum + (b.platform_commission_inr ?? 0), 0)
    const commission_month = (monthBookings ?? []).reduce((sum, b) => sum + (b.platform_commission_inr ?? 0), 0)

    return NextResponse.json({
      online_providers: online_providers ?? 0,
      active_gigs: active_gigs ?? 0,
      pending_leads: pending_leads ?? 0,
      pending_verifications: pending_verifications ?? 0,
      gmv_today_inr: gmv_today,
      gmv_month_inr: gmv_month,
      commission_today_inr: commission_today,
      commission_month_inr: commission_month,
      total_providers: total_providers ?? 0,
      total_clients: total_clients ?? 0,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
