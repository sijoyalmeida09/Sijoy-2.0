import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoLiveToggle } from '@/components/sohala/go-live-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  DollarSign, TrendingUp, Inbox, Calendar, Star, ArrowRight,
  Clock, ChevronRight
} from 'lucide-react'
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import { Booking, Lead, Review } from '@/types'

export default async function ProviderDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Complete Your Profile</h2>
        <p className="text-text-muted mb-4">You need to register as a provider first.</p>
        <Link href="/provider/join">
          <Button variant="primary">Join as Artist</Button>
        </Link>
      </div>
    )
  }

  // Fetch dashboard data
  const [
    { data: recentLeads },
    { data: upcomingBookings },
    { data: recentReviews },
    { data: earningsData },
  ] = await Promise.all([
    supabase
      .from('lead_providers')
      .select('*, lead:leads(*)')
      .eq('provider_id', provider.id)
      .order('sent_at', { ascending: false })
      .limit(5),
    supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', provider.id)
      .in('status', ['confirmed', 'pending'])
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(5),
    supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('bookings')
      .select('total_amount_inr, provider_payout_inr, created_at, status')
      .eq('provider_id', provider.id)
      .eq('status', 'completed'),
  ])

  const totalEarnings = (earningsData ?? []).reduce((sum, b) => sum + (b.provider_payout_inr ?? 0), 0)
  const thisMonthEarnings = (earningsData ?? [])
    .filter((b) => new Date(b.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + (b.provider_payout_inr ?? 0), 0)

  const STATS = [
    {
      label: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      icon: DollarSign,
      color: 'text-accent-gold',
      bg: 'bg-accent-gold/10',
    },
    {
      label: 'This Month',
      value: formatCurrency(thisMonthEarnings),
      icon: TrendingUp,
      color: 'text-accent-green',
      bg: 'bg-accent-green/10',
    },
    {
      label: 'Pending Leads',
      value: String(recentLeads?.length ?? 0),
      icon: Inbox,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Avg Rating',
      value: `${provider.avg_rating.toFixed(1)}★`,
      icon: Star,
      color: 'text-accent-gold',
      bg: 'bg-accent-gold/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {provider.display_name} 👋
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {provider.status === 'verified' ? (
              <span className="text-accent-green">Profile verified</span>
            ) : (
              <span className="text-yellow-400">Verification pending</span>
            )}
            {' · '}Profile {provider.profile_completeness}% complete
          </p>
        </div>

        {/* Go Live Toggle */}
        <div className="hidden md:block">
          <GoLiveToggle
            providerId={provider.id}
            initialIsLive={provider.is_online}
          />
        </div>
      </div>

      {/* Mobile Go Live */}
      <div className="md:hidden flex justify-center">
        <GoLiveToggle providerId={provider.id} initialIsLive={provider.is_online} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-white/5 rounded-2xl p-5">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-text-muted text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Earnings Bar Chart */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Earnings Overview</h2>
          <Link href="/provider/earnings" className="text-sm text-accent hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex items-end gap-2 h-24">
          {Array.from({ length: 7 }).map((_, i) => {
            const height = 20 + Math.random() * 80
            const isToday = i === 6
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? 'bg-accent' : 'bg-white/10'}`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-text-muted">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Inbox className="h-4 w-4 text-accent" />
              Recent Leads
            </h2>
            <Link href="/provider/leads" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {(recentLeads ?? []).length > 0 ? (
              (recentLeads ?? []).map((lp: any) => (
                <Link
                  key={lp.id}
                  href={`/provider/leads?id=${lp.lead_id}`}
                  className="flex items-center gap-3 p-3 bg-card-hover rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Inbox className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm capitalize truncate">
                      {lp.lead?.event_type?.replace('_', ' ')} — {lp.lead?.location_text}
                    </div>
                    <div className="text-text-muted text-xs">{timeAgo(lp.sent_at)}</div>
                  </div>
                  <Badge variant={lp.viewed_at ? 'default' : 'featured'}>
                    {lp.viewed_at ? 'Seen' : 'New'}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-text-muted text-sm text-center py-4">No leads yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent-green" />
              Upcoming Bookings
            </h2>
            <Link href="/provider/bookings" className="text-sm text-accent hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {(upcomingBookings ?? []).length > 0 ? (
              (upcomingBookings as Booking[]).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 p-3 bg-card-hover rounded-xl"
                >
                  <div className="h-10 w-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-accent-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm capitalize truncate">
                      {booking.event_type?.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      {formatDate(booking.event_date)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-white text-sm">
                      {formatCurrency(booking.provider_payout_inr)}
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-sm text-center py-4">No upcoming bookings</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {(recentReviews ?? []).length > 0 && (
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Star className="h-4 w-4 text-accent-gold" />
              Recent Reviews
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {(recentReviews as Review[]).map((review) => (
              <div key={review.id} className="bg-card-hover rounded-xl p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-accent-gold fill-accent-gold' : 'text-white/20'}`} />
                  ))}
                </div>
                <p className="text-text-secondary text-sm line-clamp-3">{review.body}</p>
                <p className="text-text-muted text-xs mt-2">{timeAgo(review.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
