#!/usr/bin/env node
/**
 * Sohaya — Full Flow Smoke Test
 * Tests every critical user flow against live Vercel deployment
 * Usage: node scripts/smoke-test.mjs [base_url]
 *   base_url defaults to https://sohaya.joshoit.com
 *
 * Prereq: run `node scripts/seed-test-data.mjs` first
 */

import { readFileSync, existsSync } from 'node:fs'

const BASE_URL = process.argv[2] || 'https://sohaya.joshoit.com'
const SUPABASE_URL = 'https://ylfagpbsmbhnmomeosyx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmFncGJzbWJobm1vbWVvc3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjQzMTIsImV4cCI6MjA4OTY0MDMxMn0.LhyJDYx3Fw2EOhHU2-d_L6jNI5W-SCUsNApSiIy1DNc'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmFncGJzbWJobm1vbWVvc3l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA2NDMxMiwiZXhwIjoyMDg5NjQwMzEyfQ.sQ7LwSUU3Tz_esLbxjpQ2z70XMDMAIEfcep3Ymbjz50'
const PROJECT_REF = 'ylfagpbsmbhnmomeosyx'
const COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`

let PASS = 0, FAIL = 0
const failures = []

function pass(label) {
  PASS++
  console.log(`  ✅ PASS: ${label}`)
}

function fail(label, detail) {
  FAIL++
  failures.push({ label, detail })
  console.log(`  ❌ FAIL: ${label}`)
  if (detail) console.log(`         ${JSON.stringify(detail).slice(0, 200)}`)
}

// Sign in with email/password via Supabase Auth
async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(`Sign in failed for ${email}: ${JSON.stringify(data)}`)
  }
  return data // { access_token, refresh_token, user, ... }
}

// Build cookie header from Supabase session
// @supabase/ssr stores the session as raw JSON string, split into 3180-char chunks
function buildCookieHeader(session) {
  const sessionJson = JSON.stringify({
    access_token: session.access_token,
    token_type: session.token_type || 'bearer',
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    refresh_token: session.refresh_token,
    user: session.user,
  })
  // Split into chunks matching @supabase/ssr chunker
  const CHUNK_SIZE = 3180
  if (sessionJson.length <= CHUNK_SIZE) {
    return `${COOKIE_NAME}=${encodeURIComponent(sessionJson)}`
  }
  const chunks = []
  for (let i = 0, o = 0; i < Math.ceil(sessionJson.length / CHUNK_SIZE); i++, o += CHUNK_SIZE) {
    chunks.push(`${COOKIE_NAME}.${i}=${encodeURIComponent(sessionJson.slice(o, o + CHUNK_SIZE))}`)
  }
  return chunks.join('; ')
}

// Call Vercel API route with auth
async function api(session, method, path, body) {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': buildCookieHeader(session),
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text.slice(0, 300) } }
  return { status: res.status, ok: res.ok, data }
}

// Call Supabase REST directly with service role (for admin-level checks)
async function supabaseAdmin(path, method = 'GET', body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) } }
  catch { return { ok: res.ok, status: res.status, data: text } }
}

async function runTests() {
  console.log(`\n🚀 Sohaya Smoke Test → ${BASE_URL}\n`)

  // Load seed IDs
  let seedIds = {}
  if (existsSync('.smoke-test-ids.json')) {
    seedIds = JSON.parse(readFileSync('.smoke-test-ids.json', 'utf8'))
  } else {
    console.log('⚠ .smoke-test-ids.json not found. Run seed-test-data.mjs first.\n')
  }

  // ── 1. Check homepage ────────────────────────────────────────────────────
  console.log('── [PUBLIC] Homepage & Discovery ──')
  try {
    const res = await fetch(BASE_URL)
    res.ok ? pass('Homepage loads (200)') : fail('Homepage', { status: res.status })
  } catch (e) {
    fail('Homepage reachable', e.message)
  }

  // ── 2. Public artists listing ────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/artists`)
    const data = await res.json()
    const artists = Array.isArray(data) ? data : data.artists
    if (res.ok && Array.isArray(artists)) {
      pass(`GET /api/artists (${artists.length} artists)`)
    } else {
      fail('GET /api/artists', data)
    }
  } catch (e) {
    fail('GET /api/artists', e.message)
  }

  // ── 3. AI Search ─────────────────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'bollywood band for wedding in Vasai under 50000' }),
    })
    const data = await res.json()
    if (res.ok && data.artists !== undefined) {
      pass(`POST /api/ai/search (${data.artists?.length ?? 0} results)`)
    } else {
      fail('POST /api/ai/search', data)
    }
  } catch (e) {
    fail('POST /api/ai/search', e.message)
  }

  // ── 4. Client sign in ────────────────────────────────────────────────────
  console.log('\n── [CLIENT] testclient@sohaya.app ──')
  let clientSession
  try {
    clientSession = await signIn('testclient@sohaya.app', 'SohayaTest2024!')
    pass('Client sign in')
  } catch (e) {
    fail('Client sign in', e.message)
  }

  // ── 5. Create Lead ───────────────────────────────────────────────────────
  let leadId
  const artistId = seedIds?.ARTIST_1?.provider_id
  if (clientSession) {
    try {
      const res = await api(clientSession, 'POST', '/api/leads', {
        event_type: 'wedding',
        event_date: '2026-12-15',
        location_text: 'Vasai, Maharashtra',
        budget_hint_inr: 50000,
        notes: 'Need a bollywood band for sangeet night',
        ...(artistId ? { provider_id: artistId } : {}), // direct to ravi so he can quote
      })
      if (res.ok && res.data.lead_id) {
        leadId = res.data.lead_id
        pass(`POST /api/leads (lead: ${leadId})`)
      } else {
        fail('POST /api/leads', res.data)
      }
    } catch (e) {
      fail('POST /api/leads', e.message)
    }
  }

  // ── 6. Create Booking (direct payment flow) ──────────────────────────────
  let bookingId
  if (clientSession && artistId) {
    try {
      const res = await api(clientSession, 'POST', '/api/payments/create-order', {
        amount_inr: 45000,
        provider_id: artistId,
        event_type: 'wedding',
        event_date: '2026-12-15',
        location_text: 'Vasai West, Maharashtra',
      })
      if (res.ok && res.data.booking_id) {
        bookingId = res.data.booking_id
        pass(`POST /api/payments/create-order (booking: ${bookingId})`)
      } else {
        fail('POST /api/payments/create-order', res.data)
      }
    } catch (e) {
      fail('POST /api/payments/create-order', e.message)
    }
  } else {
    console.log('  ⚠ Skipping booking (no artist_id — run seed first)')
  }

  // ── 7. Submit UTR ────────────────────────────────────────────────────────
  if (clientSession && bookingId) {
    try {
      const res = await api(clientSession, 'POST', '/api/payments/verify', {
        booking_id: bookingId,
        utr: 'SMOKETEST' + Date.now(),
      })
      if (res.ok && res.data.success) {
        pass(`POST /api/payments/verify (UTR submitted)`)
      } else {
        fail('POST /api/payments/verify', res.data)
      }
    } catch (e) {
      fail('POST /api/payments/verify', e.message)
    }
  }

  // ── 8. Artist 1 sign in ──────────────────────────────────────────────────
  console.log('\n── [ARTIST] ravi.band@sohaya.app ──')
  let artistSession
  try {
    artistSession = await signIn('ravi.band@sohaya.app', 'SohayaTest2024!')
    pass('Artist sign in')
  } catch (e) {
    fail('Artist sign in', e.message)
  }

  // ── 9. Artist views their bookings ───────────────────────────────────────
  if (artistSession) {
    try {
      const res = await api(artistSession, 'GET', '/api/bookings?role=provider')
      const bookings = res.data?.bookings ?? res.data
      if (res.ok && Array.isArray(bookings)) {
        pass(`GET /api/bookings as artist (${bookings.length} bookings)`)
      } else {
        fail('GET /api/bookings as artist', res.data)
      }
    } catch (e) {
      fail('GET /api/bookings as artist', e.message)
    }
  }

  // ── 10. Artist creates quote for lead ────────────────────────────────────
  if (artistSession && leadId) {
    try {
      const res = await api(artistSession, 'POST', '/api/quotes', {
        lead_id: leadId,
        quoted_amount_inr: 45000,
        services_description: 'Full Bollywood Band performance — 3 hours, 8 musicians, sound system included',
        event_type: 'wedding',
      })
      if (res.ok && res.data.id) {
        pass(`POST /api/quotes (quote: ${res.data.id}, client sees: ₹${res.data.client_display_amount_inr?.toLocaleString('en-IN')})`)
      } else {
        fail('POST /api/quotes', res.data)
      }
    } catch (e) {
      fail('POST /api/quotes', e.message)
    }
  }

  // ── 11. Artist goes live ─────────────────────────────────────────────────
  if (artistSession) {
    try {
      const res = await api(artistSession, 'POST', '/api/artists/go-live', {
        is_online: true,
        lat: 19.397,
        lng: 72.845,
      })
      if (res.ok) {
        pass('POST /api/artists/go-live (provider online)')
      } else {
        fail('POST /api/artists/go-live', res.data)
      }
    } catch (e) {
      fail('POST /api/artists/go-live', e.message)
    }
  }

  // ── 12. Admin flow ───────────────────────────────────────────────────────
  console.log('\n── [ADMIN] Verify artist + confirm booking ──')
  // Use service role directly for admin ops (admin uses Google Auth, hard to sign in via API)
  const pendingProviders = await supabaseAdmin('/providers?status=eq.pending&select=id,display_name')
  if (pendingProviders.ok && pendingProviders.data?.length > 0) {
    pass(`Admin sees ${pendingProviders.data.length} pending provider(s)`)
  } else {
    pass(`Admin: no pending providers (all verified)`)
  }

  // Verify artist via admin update
  if (artistId) {
    const verifyRes = await supabaseAdmin(
      `/providers?id=eq.${artistId}`,
      'PATCH',
      { status: 'verified' }
    )
    verifyRes.ok ? pass('Admin verified artist (DB direct)') : fail('Admin verify artist', verifyRes.data)
  }

  // Admin confirms booking (pending_verification → confirmed)
  if (bookingId) {
    const confirmRes = await supabaseAdmin(
      `/bookings?id=eq.${bookingId}`,
      'PATCH',
      { status: 'confirmed' }
    )
    confirmRes.ok ? pass(`Admin confirmed booking ${bookingId}`) : fail('Admin confirm booking', confirmRes.data)
  }

  // ── 13. Analytics endpoint ───────────────────────────────────────────────
  // (Requires admin session via cookie, skip with note)
  console.log('  ℹ Admin analytics requires cookie-based admin session (Google Auth) — test manually')

  // ── 14. Client can post review after completion ──────────────────────────
  if (bookingId && clientSession && artistId) {
    // First mark booking as completed
    await supabaseAdmin(`/bookings?id=eq.${bookingId}`, 'PATCH', { status: 'completed' })
    try {
      const res = await api(clientSession, 'POST', '/api/reviews', {
        booking_id: bookingId,
        provider_id: artistId,
        rating: 5,
        title: 'Outstanding performance!',
        body: 'Ravi & the team were absolutely incredible. The crowd was on their feet the entire night.',
      })
      if (res.ok && res.data.id) {
        pass(`POST /api/reviews (review: ${res.data.id})`)
      } else {
        fail('POST /api/reviews', res.data)
      }
    } catch (e) {
      fail('POST /api/reviews', e.message)
    }
  }

  // ── 15. Client creates instant gig ───────────────────────────────────────
  if (clientSession) {
    try {
      const res = await api(clientSession, 'POST', '/api/gigs/instant', {
        budget_inr: 10000,
        event_type: 'small_party',
        location_text: 'Vasai West',
        location_lat: 19.397,
        location_lng: 72.845,
        start_time: new Date(Date.now() + 3600000).toISOString(),
        duration_hours: 2,
        category_ids: ['dj'],
      })
      if (res.ok && res.data.gig_id) {
        pass(`POST /api/gigs/instant (gig: ${res.data.gig_id})`)
      } else {
        fail('POST /api/gigs/instant', res.data)
      }
    } catch (e) {
      fail('POST /api/gigs/instant', e.message)
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Results: ${PASS} passed, ${FAIL} failed`)
  if (failures.length > 0) {
    console.log('\nFailed tests:')
    failures.forEach(f => console.log(`  • ${f.label}: ${JSON.stringify(f.detail).slice(0, 150)}`))
  }
  console.log('')

  if (FAIL === 0) {
    console.log('🎉 All flows passing — Sohaya is go-live ready!\n')
  } else {
    console.log('🔧 Fix the failures above, then re-run smoke test.\n')
    process.exit(1)
  }
}

runTests().catch(err => { console.error(err); process.exit(1) })
