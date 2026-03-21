import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Booking } from '@/types'

export default async function ProviderEarningsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: provider } = await supabase
    .from('providers')
    .select('id, display_name, commission_tier, is_founder')
    .eq('profile_id', user.id)
    .single()

  if (!provider) redirect('/provider/join')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const allBookings = (bookings ?? []) as Booking[]
  const completedBookings = allBookings.filter((b) => b.status === 'completed')
  const pendingBookings = allBookings.filter((b) => b.status === 'confirmed')

  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.provider_payout_inr, 0)
  const pendingPayout = pendingBookings.reduce((sum, b) => sum + b.provider_payout_inr, 0)

  const now = new Date()
  const thisMonth = completedBookings.filter((b) => {
    const d = new Date(b.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthEarnings = thisMonth.reduce((sum, b) => sum + b.provider_payout_inr, 0)

  const STATS = [
    { label: 'Total Earnings', value: formatCurrency(totalEarnings), icon: DollarSign, color: 'text-accent-gold' },
    { label: 'This Month', value: formatCurrency(thisMonthEarnings), icon: TrendingUp, color: 'text-accent-green' },
    { label: 'Pending Payout', value: formatCurrency(pendingPayout), icon: Clock, color: 'text-yellow-400' },
    { label: 'Completed Gigs', value: String(completedBookings.length), icon: CheckCircle, color: 'text-accent' },
  ]

  // Monthly breakdown (last 6 months)
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const month = date.getMonth()
    const year = date.getFullYear()
    const monthBookings = completedBookings.filter((b) => {
      const d = new Date(b.created_at)
      return d.getMonth() === month && d.getFullYear() === year
    })
    return {
      label: date.toLocaleString('en-IN', { month: 'short' }),
      amount: monthBookings.reduce((sum, b) => sum + b.provider_payout_inr, 0),
      count: monthBookings.length,
    }
  })

  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Earnings</h1>
        <p className="text-text-muted text-sm mt-1">
          Commission tier: <span className="capitalize text-accent-gold">{provider.commission_tier}</span>
          {provider.is_founder && <span className="ml-2 text-purple-300">· Founder (0% commission)</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-white/5 rounded-2xl p-5">
            <Icon className={`h-5 w-5 ${color} mb-3`} />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-text-muted text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-6">Monthly Earnings</h2>
        <div className="flex items-end gap-4 h-40">
          {monthlyData.map(({ label, amount, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-text-muted">{amount > 0 ? formatCurrency(amount).replace('₹', '₹') : ''}</div>
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-accent to-red-400 transition-all duration-700"
                style={{ height: `${(amount / maxMonthly) * 100}%`, minHeight: amount > 0 ? '8px' : '2px' }}
              />
              <div className="text-xs text-text-muted">{label}</div>
              <div className="text-xs text-text-muted">{count > 0 ? `${count} gigs` : ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-4">Payout History</h2>
        {allBookings.length > 0 ? (
          <div className="space-y-3">
            {allBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-3 bg-card-hover rounded-xl">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  booking.status === 'completed' ? 'bg-accent-green/10' : 'bg-yellow-500/10'
                }`}>
                  {booking.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-accent-green" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm capitalize">
                    {booking.event_type?.replace('_', ' ')}
                  </div>
                  <div className="text-text-muted text-xs">{formatDate(booking.event_date)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{formatCurrency(booking.provider_payout_inr)}</div>
                  <div className={`text-xs capitalize ${
                    booking.status === 'completed' ? 'text-accent-green' :
                    booking.status === 'confirmed' ? 'text-yellow-400' : 'text-text-muted'
                  }`}>{booking.status}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-center py-8">No payouts yet. Complete gigs to earn!</p>
        )}
      </div>
    </div>
  )
}
