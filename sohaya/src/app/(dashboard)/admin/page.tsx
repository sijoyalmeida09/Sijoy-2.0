import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import { Shield, Users, Zap, DollarSign, AlertCircle, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/discover')

  // Use admin client for all queries (bypasses RLS)
  const admin = createAdminClient()

  const [
    { data: pendingProviders },
    { count: onlineProviders },
    { data: allBookings },
    { data: disputes },
    { count: totalProviders },
    { count: totalClients },
    { data: pendingUTR },
    { data: allProviders },
  ] = await Promise.all([
    admin.from('providers').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
    admin.from('providers').select('id', { count: 'exact', head: true }).eq('is_online', true),
    admin.from('bookings').select('*, provider:providers(display_name), client:clients(profile_id, profiles:profiles(full_name, email))').order('created_at', { ascending: false }).limit(50),
    admin.from('disputes').select('*, booking:bookings(event_type, event_date)').eq('status', 'open').limit(10),
    admin.from('providers').select('id', { count: 'exact', head: true }),
    admin.from('clients').select('id', { count: 'exact', head: true }),
    admin.from('bookings').select('id, event_type, total_amount_inr, utr_number, created_at, provider:providers(display_name)').eq('status', 'pending_verification').order('created_at', { ascending: false }),
    admin.from('providers').select('id, display_name, status, is_founder, avg_rating, total_gigs, base_rate_inr, city, categories, created_at').order('created_at', { ascending: false }).limit(20),
  ])

  const bookings = allBookings ?? []
  const totalGMV = bookings.reduce((sum, b: any) => sum + (b.total_amount_inr ?? 0), 0)
  const totalCommission = bookings.reduce((sum, b: any) => sum + (b.platform_commission_inr ?? 0), 0)
  const statusCounts: Record<string, number> = {}
  bookings.forEach((b: any) => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1 })

  // Server actions using admin client
  async function approveProvider(formData: FormData) {
    'use server'
    const id = formData.get('provider_id') as string
    const adminDb = createAdminClient()
    await adminDb.from('providers').update({ status: 'verified', updated_at: new Date().toISOString() }).eq('id', id)
    revalidatePath('/admin')
  }

  async function rejectProvider(formData: FormData) {
    'use server'
    const id = formData.get('provider_id') as string
    const adminDb = createAdminClient()
    await adminDb.from('providers').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', id)
    revalidatePath('/admin')
  }

  async function setFounder(formData: FormData) {
    'use server'
    const id = formData.get('provider_id') as string
    const adminDb = createAdminClient()
    await adminDb.from('providers').update({ is_founder: true, commission_tier: 'founder', updated_at: new Date().toISOString() }).eq('id', id)
    revalidatePath('/admin')
  }

  async function confirmBooking(formData: FormData) {
    'use server'
    const id = formData.get('booking_id') as string
    const adminDb = createAdminClient()
    await adminDb.from('bookings').update({ status: 'confirmed', updated_at: new Date().toISOString() }).eq('id', id)
    revalidatePath('/admin')
  }

  async function completeBooking(formData: FormData) {
    'use server'
    const id = formData.get('booking_id') as string
    const adminDb = createAdminClient()
    await adminDb.from('bookings').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', id)
    revalidatePath('/admin')
  }

  async function cancelBooking(formData: FormData) {
    'use server'
    const id = formData.get('booking_id') as string
    const adminDb = createAdminClient()
    await adminDb.from('bookings').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id)
    revalidatePath('/admin')
  }

  const statusColor = (s: string) => ({
    pending: 'bg-amber-500/20 text-amber-300',
    pending_verification: 'bg-yellow-500/20 text-yellow-300',
    confirmed: 'bg-green-500/20 text-green-300',
    completed: 'bg-emerald-500/20 text-emerald-200',
    cancelled: 'bg-red-500/20 text-red-400',
    disputed: 'bg-orange-500/20 text-orange-300',
  }[s] || 'bg-white/10 text-white')

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-accent" />
              Admin Portal
            </h1>
            <p className="text-text-muted text-sm mt-1">Sohaya Platform Management</p>
          </div>
          <a href="/discover" className="text-xs text-accent hover:underline">View Site</a>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'GMV', value: formatCurrency(totalGMV), icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Commission', value: formatCurrency(totalCommission), icon: CreditCard, color: 'text-amber-400' },
            { label: 'Artists', value: `${totalProviders ?? 0}`, icon: Users, color: 'text-accent' },
            { label: 'Live Now', value: `${onlineProviders ?? 0}`, icon: Zap, color: 'text-green-400' },
            { label: 'Clients', value: `${totalClients ?? 0}`, icon: Users, color: 'text-blue-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-white/5 rounded-2xl p-4">
              <Icon className={`h-4 w-4 ${color} mb-2`} />
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-text-muted text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([s, c]) => (
            <span key={s} className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(s)}`}>
              {s.replace('_', ' ')}: {c}
            </span>
          ))}
        </div>

        {/* UTR Pending Verification */}
        {(pendingUTR ?? []).length > 0 && (
          <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-2xl p-5">
            <h2 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Payments Awaiting Verification ({(pendingUTR ?? []).length})
            </h2>
            <div className="space-y-2">
              {(pendingUTR ?? []).map((b: any) => (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-card rounded-xl">
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-medium capitalize">{b.event_type?.replace('_', ' ')}</span>
                    <span className="text-text-muted text-xs ml-2">by {(b.provider as any)?.display_name}</span>
                    <div className="text-xs text-yellow-400 mt-0.5">UTR: {b.utr_number}</div>
                  </div>
                  <div className="text-white font-semibold text-sm">{formatCurrency(b.total_amount_inr)}</div>
                  <form action={confirmBooking}>
                    <input type="hidden" name="booking_id" value={b.id} />
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/20">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Confirm
                    </button>
                  </form>
                  <form action={cancelBooking}>
                    <input type="hidden" name="booking_id" value={b.id} />
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20">
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Artist Verifications */}
        <div className="bg-card border border-white/5 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Pending Verifications
            {(pendingProviders ?? []).length > 0 && (
              <Badge variant="featured">{(pendingProviders ?? []).length}</Badge>
            )}
          </h2>
          {(pendingProviders ?? []).length > 0 ? (
            <div className="space-y-3">
              {(pendingProviders ?? []).map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 p-4 bg-card-hover rounded-xl">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent font-bold">
                    {p.display_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white">{p.display_name}</div>
                    <div className="text-text-muted text-xs capitalize">
                      {p.entity_type} · {p.categories?.join(', ')} · {p.city} · {formatCurrency(p.base_rate_inr)}
                    </div>
                    <div className="text-text-muted text-xs">{timeAgo(p.created_at)}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={approveProvider}>
                      <input type="hidden" name="provider_id" value={p.id} />
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/20">
                        <CheckCircle className="h-3.5 w-3.5" />Approve
                      </button>
                    </form>
                    <form action={rejectProvider}>
                      <input type="hidden" name="provider_id" value={p.id} />
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20">
                        <XCircle className="h-3.5 w-3.5" />Reject
                      </button>
                    </form>
                    <form action={setFounder}>
                      <input type="hidden" name="provider_id" value={p.id} />
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/20">
                        Founder
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-3">No pending verifications</p>
          )}
        </div>

        {/* Revenue */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card border border-white/5 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-3">Revenue</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">GMV</span><span className="text-white font-semibold">{formatCurrency(totalGMV)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Commission</span><span className="text-emerald-400 font-semibold">{formatCurrency(totalCommission)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Avg Rate</span><span className="text-white">{totalGMV > 0 ? ((totalCommission / totalGMV) * 100).toFixed(1) : 0}%</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Total Bookings</span><span className="text-white">{bookings.length}</span></div>
            </div>
          </div>
          <div className="bg-card border border-white/5 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-3">Disputes</h2>
            {(disputes ?? []).length > 0 ? (
              <div className="space-y-2">
                {(disputes ?? []).map((d: any) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-text-secondary capitalize truncate">{d.reason?.slice(0, 50)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">No open disputes</p>
            )}
          </div>
        </div>

        {/* All Bookings Table */}
        <div className="bg-card border border-white/5 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">All Bookings ({bookings.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 text-text-muted text-xs">Type</th>
                  <th className="text-left py-2 px-2 text-text-muted text-xs">Date</th>
                  <th className="text-left py-2 px-2 text-text-muted text-xs">Artist</th>
                  <th className="text-left py-2 px-2 text-text-muted text-xs">Client</th>
                  <th className="text-right py-2 px-2 text-text-muted text-xs">Amount</th>
                  <th className="text-right py-2 px-2 text-text-muted text-xs">Commission</th>
                  <th className="text-center py-2 px-2 text-text-muted text-xs">Status</th>
                  <th className="text-center py-2 px-2 text-text-muted text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2 px-2 text-white capitalize">{b.event_type?.replace('_', ' ')}</td>
                    <td className="py-2 px-2 text-text-secondary">{formatDate(b.event_date)}</td>
                    <td className="py-2 px-2 text-text-secondary">{(b.provider as any)?.display_name || '—'}</td>
                    <td className="py-2 px-2 text-text-secondary">{(b.client as any)?.profiles?.full_name || (b.client as any)?.profiles?.email || '—'}</td>
                    <td className="py-2 px-2 text-white text-right">{formatCurrency(b.total_amount_inr)}</td>
                    <td className="py-2 px-2 text-amber-400 text-right">{formatCurrency(b.platform_commission_inr)}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusColor(b.status)}`}>
                        {b.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {b.status === 'pending' || b.status === 'pending_verification' ? (
                        <div className="flex gap-1 justify-center">
                          <form action={confirmBooking}>
                            <input type="hidden" name="booking_id" value={b.id} />
                            <button className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs hover:bg-green-500/20">Confirm</button>
                          </form>
                          <form action={cancelBooking}>
                            <input type="hidden" name="booking_id" value={b.id} />
                            <button className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs hover:bg-red-500/20">Cancel</button>
                          </form>
                        </div>
                      ) : b.status === 'confirmed' ? (
                        <form action={completeBooking}>
                          <input type="hidden" name="booking_id" value={b.id} />
                          <button className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs hover:bg-emerald-500/20">Complete</button>
                        </form>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Artists */}
        <div className="bg-card border border-white/5 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">All Artists ({totalProviders})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 text-text-muted text-xs">Name</th>
                  <th className="text-left py-2 px-2 text-text-muted text-xs">City</th>
                  <th className="text-left py-2 px-2 text-text-muted text-xs">Categories</th>
                  <th className="text-right py-2 px-2 text-text-muted text-xs">Rate</th>
                  <th className="text-center py-2 px-2 text-text-muted text-xs">Rating</th>
                  <th className="text-center py-2 px-2 text-text-muted text-xs">Gigs</th>
                  <th className="text-center py-2 px-2 text-text-muted text-xs">Status</th>
                  <th className="text-center py-2 px-2 text-text-muted text-xs">Founder</th>
                </tr>
              </thead>
              <tbody>
                {(allProviders ?? []).map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2 px-2 text-white font-medium">{p.display_name}</td>
                    <td className="py-2 px-2 text-text-secondary">{p.city}</td>
                    <td className="py-2 px-2 text-text-secondary text-xs">{p.categories?.join(', ')}</td>
                    <td className="py-2 px-2 text-white text-right">{formatCurrency(p.base_rate_inr)}</td>
                    <td className="py-2 px-2 text-center text-amber-400">{p.avg_rating || '—'}</td>
                    <td className="py-2 px-2 text-center text-text-secondary">{p.total_gigs}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        p.status === 'verified' ? 'bg-green-500/20 text-green-300' :
                        p.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-red-500/20 text-red-400'
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-2 px-2 text-center">{p.is_founder ? '★' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
