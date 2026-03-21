import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import { Shield, Users, Zap, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/discover')

  // Fetch analytics
  const [
    { data: pendingProviders },
    { data: liveProviders },
    { data: recentBookings },
    { data: disputes },
    { count: totalProviders },
    { count: totalClients },
  ] = await Promise.all([
    supabase.from('providers').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
    supabase.from('providers').select('id', { count: 'exact' }).eq('is_online', true),
    supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('disputes').select('*, booking:bookings(event_type, event_date)').eq('status', 'open').limit(10),
    supabase.from('providers').select('id', { count: 'exact' }),
    supabase.from('clients').select('id', { count: 'exact' }),
  ])

  const totalGMV = (recentBookings ?? []).reduce((sum, b) => sum + (b.total_amount_inr ?? 0), 0)
  const totalCommission = (recentBookings ?? []).reduce((sum, b) => sum + (b.platform_commission_inr ?? 0), 0)

  const STATS = [
    { label: 'Total Providers', value: String(totalProviders ?? 0), icon: Users, color: 'text-accent' },
    { label: 'Live Right Now', value: String(liveProviders?.length ?? 0), icon: Zap, color: 'text-accent-green' },
    { label: 'Recent GMV', value: formatCurrency(totalGMV), icon: DollarSign, color: 'text-accent-gold' },
    { label: 'Total Clients', value: String(totalClients ?? 0), icon: Users, color: 'text-blue-400' },
  ]

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-accent" />
              Admin Dashboard
            </h1>
            <p className="text-text-muted text-sm mt-1">Sohaya Platform Management</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-white/5 rounded-2xl p-5">
              <Icon className={`h-5 w-5 ${color} mb-3`} />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-text-muted text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue Summary */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card border border-white/5 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-3">Revenue Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Gross Merchandise Value</span>
                <span className="text-white font-semibold">{formatCurrency(totalGMV)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Platform Commission</span>
                <span className="text-accent-green font-semibold">{formatCurrency(totalCommission)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Commission %</span>
                <span className="text-white font-semibold">
                  {totalGMV > 0 ? ((totalCommission / totalGMV) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-3">Open Disputes</h2>
            {(disputes ?? []).length > 0 ? (
              <div className="space-y-2">
                {(disputes ?? []).slice(0, 3).map((d: any) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span className="text-text-secondary capitalize truncate">
                      {d.booking?.event_type?.replace('_', ' ')} · {d.reason.slice(0, 40)}...
                    </span>
                    <Badge variant="featured" className="flex-shrink-0">Open</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">No open disputes 🎉</p>
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Pending Verifications
              {(pendingProviders ?? []).length > 0 && (
                <Badge variant="featured">{(pendingProviders ?? []).length}</Badge>
              )}
            </h2>
          </div>
          {(pendingProviders ?? []).length > 0 ? (
            <div className="space-y-3">
              {(pendingProviders ?? []).map((provider: any) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-4 p-4 bg-card-hover rounded-xl"
                >
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    {provider.photo_urls?.[0] ? (
                      <img src={provider.photo_urls[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Users className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{provider.display_name}</div>
                    <div className="text-text-muted text-xs capitalize">
                      {provider.entity_type} · {provider.categories?.join(', ')} · {provider.city}
                    </div>
                    <div className="text-text-muted text-xs">{timeAgo(provider.created_at)}</div>
                  </div>
                  <div className="flex gap-2">
                    <form action={async () => {
                      'use server'
                      // Would call admin verify endpoint
                    }}>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-lg text-xs hover:bg-accent-green/20 transition-colors"
                        formAction={async () => {
                          'use server'
                          const admin = createClient()
                          await admin.from('providers').update({ status: 'verified' }).eq('id', provider.id)
                        }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    </form>
                    <form>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
                        formAction={async () => {
                          'use server'
                          const admin = createClient()
                          await admin.from('providers').update({ status: 'rejected' }).eq('id', provider.id)
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </form>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/20 transition-colors"
                      onClick={async () => {
                        // Set founder status — would call API
                      }}
                    >
                      Set Founder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-4">All caught up! No pending verifications.</p>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Recent Bookings</h2>
          {(recentBookings ?? []).length > 0 ? (
            <div className="space-y-2">
              {(recentBookings ?? []).map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-3 p-3 bg-card-hover rounded-xl text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium capitalize">
                      {booking.event_type?.replace('_', ' ')}
                    </span>
                    <span className="text-text-muted mx-2">·</span>
                    <span className="text-text-muted">{formatDate(booking.event_date)}</span>
                  </div>
                  <div className="text-white font-semibold">{formatCurrency(booking.total_amount_inr)}</div>
                  <Badge
                    variant={
                      booking.status === 'completed' ? 'success' :
                      booking.status === 'confirmed' ? 'live' :
                      booking.status === 'cancelled' ? 'featured' : 'default'
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-4">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
