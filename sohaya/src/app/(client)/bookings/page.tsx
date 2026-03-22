import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar, MapPin, Clock, CreditCard, Music } from 'lucide-react'
import Link from 'next/link'

export default async function MyBookingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/bookings')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  const { data: bookings } = client
    ? await supabase
        .from('bookings')
        .select('*, provider:providers(display_name, city, categories, photo_urls)')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const statusColor = (s: string) => ({
    pending: 'bg-amber-500/20 text-amber-300',
    pending_verification: 'bg-yellow-500/20 text-yellow-300',
    confirmed: 'bg-green-500/20 text-green-300',
    completed: 'bg-emerald-500/20 text-emerald-200',
    cancelled: 'bg-red-500/20 text-red-400',
  }[s] || 'bg-white/10 text-white')

  return (
    <div className="min-h-screen bg-primary py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">My Bookings</h1>
        <p className="text-text-muted text-sm mb-6">{(bookings ?? []).length} total bookings</p>

        {(bookings ?? []).length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">No bookings yet</h2>
            <p className="text-text-muted text-sm mb-4">Find your perfect artist and book your celebration</p>
            <Link href="/discover" className="inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent/90">
              Discover Artists
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(bookings ?? []).map((b: any) => {
              const artist = b.provider as { display_name: string; city: string; categories: string[]; photo_urls: string[] } | null
              const heroImg = artist?.photo_urls?.[0] || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(artist?.display_name || 'artist')}`

              return (
                <div key={b.id} className="bg-card border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
                  <div className="flex gap-4">
                    {/* Artist avatar */}
                    <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-card-hover">
                      <img src={heroImg} alt="" className="h-full w-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{artist?.display_name || 'Artist'}</h3>
                          <p className="text-text-muted text-xs capitalize">{b.event_type?.replace('_', ' ')}</p>
                        </div>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${statusColor(b.status)}`}>
                          {b.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(b.event_date)}
                        </span>
                        {b.event_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {b.event_time?.slice(0, 5)}
                          </span>
                        )}
                        {b.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {b.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-white font-semibold text-sm">{formatCurrency(b.total_amount_inr)}</span>
                        <div className="flex gap-2">
                          {b.status === 'pending' && (
                            <Link
                              href={`/book?provider=${b.provider_id}`}
                              className="text-xs text-accent hover:underline"
                            >
                              Complete Payment
                            </Link>
                          )}
                          {b.status === 'completed' && (
                            <Link
                              href={`/artists/${b.provider_id}`}
                              className="text-xs text-accent hover:underline"
                            >
                              Leave Review
                            </Link>
                          )}
                          {b.utr_number && (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <CreditCard className="h-3 w-3" />
                              UTR: {b.utr_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
