'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lead } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Inbox, ChevronDown, ChevronUp, MapPin, Calendar, DollarSign, Send } from 'lucide-react'
import { formatDate, formatCurrency, timeAgo } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface LeadWithProvider {
  id: string
  lead_id: string
  sent_at: string
  viewed_at?: string
  lead: Lead
}

export default function ProviderLeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<LeadWithProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteDesc, setQuoteDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successId, setSuccessId] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!provider) return

      const { data } = await supabase
        .from('lead_providers')
        .select('*, lead:leads(*)')
        .eq('provider_id', provider.id)
        .order('sent_at', { ascending: false })

      setLeads((data ?? []) as LeadWithProvider[])
      setLoading(false)
    }
    fetchLeads()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = async (lp: LeadWithProvider) => {
    if (expandedId === lp.id) {
      setExpandedId(null)
    } else {
      setExpandedId(lp.id)
      // Mark as viewed
      if (!lp.viewed_at) {
        await supabase
          .from('lead_providers')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', lp.id)
      }
    }
  }

  const submitQuote = async (leadId: string) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          quoted_amount_inr: parseFloat(quoteAmount),
          services_description: quoteDesc,
        }),
      })
      if (res.ok) {
        setSuccessId(leadId)
        setQuoteAmount('')
        setQuoteDesc('')
        setExpandedId(null)
      }
    } catch {
      alert('Failed to submit quote.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Inbox className="h-6 w-6 text-accent" />
            My Leads
          </h1>
          <p className="text-text-muted text-sm mt-1">{leads.length} leads received</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 bg-card rounded-2xl skeleton" />
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="space-y-3">
          {leads.map((lp) => (
            <div
              key={lp.id}
              className="bg-card border border-white/5 rounded-2xl overflow-hidden"
            >
              {/* Lead Summary Row */}
              <button
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/2 transition-colors"
                onClick={() => toggleExpand(lp)}
              >
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Inbox className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white capitalize">
                      {lp.lead?.event_type?.replace('_', ' ')}
                    </span>
                    {!lp.viewed_at && <Badge variant="featured">New</Badge>}
                    {successId === lp.lead_id && <Badge variant="success">Quote Sent</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {lp.lead?.location_text}
                    </span>
                    {lp.lead?.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(lp.lead.event_date)}
                      </span>
                    )}
                    {lp.lead?.budget_hint_inr && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Budget: {formatCurrency(lp.lead.budget_hint_inr)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-text-muted">{timeAgo(lp.sent_at)}</span>
                  {expandedId === lp.id ? (
                    <ChevronUp className="h-4 w-4 text-text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  )}
                </div>
              </button>

              {/* Expanded Details + Quote Form */}
              <AnimatePresence>
                {expandedId === lp.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 p-4 space-y-4">
                      {/* Full Lead Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          { label: 'Event Type', value: lp.lead?.event_type?.replace('_', ' ') },
                          { label: 'Date', value: lp.lead?.event_date ? formatDate(lp.lead.event_date) : 'TBD' },
                          { label: 'Location', value: lp.lead?.location_text },
                          { label: 'Budget', value: lp.lead?.budget_hint_inr ? formatCurrency(lp.lead.budget_hint_inr) : 'Not specified' },
                          { label: 'Duration', value: lp.lead?.duration_hours ? `${lp.lead.duration_hours}h` : 'TBD' },
                          { label: 'Status', value: lp.lead?.status },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div className="text-text-muted">{label}</div>
                            <div className="text-white font-medium capitalize">{value}</div>
                          </div>
                        ))}
                      </div>

                      {lp.lead?.notes && (
                        <div>
                          <div className="text-text-muted text-sm mb-1">Client Notes</div>
                          <p className="text-text-secondary text-sm bg-card-hover rounded-xl p-3">{lp.lead.notes}</p>
                        </div>
                      )}

                      {/* Quote Form */}
                      {successId !== lp.lead_id && (
                        <div className="border-t border-white/5 pt-4">
                          <h3 className="font-semibold text-white mb-3">Send Quote</h3>
                          <div className="space-y-3">
                            <Input
                              label="Your Quote (₹)"
                              type="number"
                              value={quoteAmount}
                              onChange={(e) => setQuoteAmount(e.target.value)}
                              placeholder="e.g. 15000"
                              icon={<DollarSign className="h-4 w-4" />}
                            />
                            <Textarea
                              label="Services Included"
                              value={quoteDesc}
                              onChange={(e) => setQuoteDesc(e.target.value)}
                              placeholder="Describe exactly what's included in your quote..."
                              rows={3}
                            />
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => submitQuote(lp.lead_id)}
                              loading={submitting}
                              disabled={!quoteAmount || !quoteDesc}
                              className="gap-2"
                            >
                              <Send className="h-4 w-4" />
                              Send Quote
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Inbox className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No leads yet</h3>
          <p className="text-text-muted">Complete your profile and go live to start receiving leads.</p>
        </div>
      )}
    </div>
  )
}
