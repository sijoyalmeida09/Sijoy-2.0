'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react'

interface CalEvent {
  id: string
  title: string
  event_type: string
  start_at: string
  end_at: string
  booking_id: string | null
  source: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => { loadEvents() }, [month, year]) // eslint-disable-line

  async function loadEvents() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!provider) { setLoading(false); return }

    const startDate = new Date(year, month, 1).toISOString()
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('provider_id', provider.id)
      .gte('start_at', startDate)
      .lte('start_at', endDate)
      .order('start_at', { ascending: true })

    setEvents(data || [])
    setLoading(false)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const today = new Date().toISOString().split('T')[0]

  function getEventsForDate(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.start_at.startsWith(dateStr))
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedEvents = selectedDate
    ? events.filter(e => e.start_at.startsWith(selectedDate))
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-accent" />
          My Calendar
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }}
            className="h-8 w-8 rounded-lg bg-card border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-white font-semibold min-w-[160px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }}
            className="h-8 w-8 rounded-lg bg-card border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs text-text-muted font-medium">{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-20 border-b border-r border-white/5" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const ds = dateStr(day)
            const dayEvents = getEventsForDate(day)
            const isToday = ds === today
            const isSelected = ds === selectedDate
            const hasEvents = dayEvents.length > 0

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                className={`h-20 border-b border-r border-white/5 p-1 text-left transition-colors hover:bg-white/5 ${
                  isSelected ? 'bg-accent/10 border-accent/30' : ''
                }`}
              >
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday ? 'bg-accent text-white' : 'text-text-secondary'
                }`}>
                  {day}
                </span>
                {hasEvents && (
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className="text-[9px] px-1 py-0.5 bg-accent/20 text-accent rounded truncate">
                        {e.title?.split('—')[0]?.trim() || e.event_type}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-text-muted px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="bg-card border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-text-muted text-sm">No events on this day. You&apos;re free!</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 bg-card-hover rounded-xl">
                  <div className="h-2 w-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{e.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(e.start_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(e.end_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="capitalize">{e.event_type?.replace('_', ' ')}</span>
                      <span className="text-accent-green text-[10px]">{e.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{events.length}</div>
          <div className="text-xs text-text-muted">Events this month</div>
        </div>
        <div className="bg-card border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {new Set(events.map(e => e.start_at.split('T')[0])).size}
          </div>
          <div className="text-xs text-text-muted">Booked days</div>
        </div>
        <div className="bg-card border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent-green">
            {daysInMonth - new Set(events.map(e => e.start_at.split('T')[0])).size}
          </div>
          <div className="text-xs text-text-muted">Available days</div>
        </div>
      </div>
    </div>
  )
}
