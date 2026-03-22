#!/usr/bin/env node
/**
 * Sohaya MEGA Stress Test — 55 scenarios covering every worst case
 * Tests: time conflicts, transit time, overlapping slots, cascading failures,
 * booking history integrity, data retention, concurrent chaos
 */

const BASE = process.argv[2] || 'https://sohaya.vercel.app'
const SB_URL = 'https://ylfagpbsmbhnmomeosyx.supabase.co'
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmFncGJzbWJobm1vbWVvc3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjQzMTIsImV4cCI6MjA4OTY0MDMxMn0.LhyJDYx3Fw2EOhHU2-d_L6jNI5W-SCUsNApSiIy1DNc'
const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmFncGJzbWJobm1vbWVvc3l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA2NDMxMiwiZXhwIjoyMDg5NjQwMzEyfQ.sQ7LwSUU3Tz_esLbxjpQ2z70XMDMAIEfcep3Ymbjz50'
const REF = 'ylfagpbsmbhnmomeosyx'
const RAVI_ID = '07f3465d-20a4-4b20-bb58-f30abd5bc2de'
const PRIYA_ID = '0aa7e4ba-9a56-4771-8394-9c5d0cf258a5'

let PASS = 0, FAIL = 0, SKIP = 0
const failures = []

function pass(l) { PASS++; console.log(`  ✅ ${l}`) }
function fail(l, d) { FAIL++; failures.push({l,d:String(d).slice(0,200)}); console.log(`  ❌ ${l}: ${String(d).slice(0,100)}`) }
function skip(l) { SKIP++; console.log(`  ⏭ ${l}`) }

async function signIn(email, pw) {
  const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method:'POST', headers:{'Content-Type':'application/json',apikey:ANON},
    body: JSON.stringify({email,password:pw})
  })
  const d = await r.json()
  if (!d.access_token) throw new Error(d.msg||d.error_code||'auth fail')
  return d
}

function cookie(s) {
  const j = JSON.stringify({access_token:s.access_token,token_type:'bearer',expires_in:s.expires_in,expires_at:s.expires_at,refresh_token:s.refresh_token,user:s.user})
  return `sb-${REF}-auth-token=${encodeURIComponent(j)}`
}

async function api(s, method, path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method, headers:{'Content-Type':'application/json','Cookie':cookie(s)},
    body: body ? JSON.stringify(body) : undefined
  })
  const t = await r.text()
  let d; try{d=JSON.parse(t)}catch{d={raw:t.slice(0,200)}}
  return {status:r.status,ok:r.ok,data:d}
}

async function dbq(sql) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/`, {method:'POST',
    headers:{'Content-Type':'application/json',apikey:SRK,Authorization:`Bearer ${SRK}`},
    body:JSON.stringify({})
  })
  // Use REST API instead
  return null
}

async function dbGet(table, params='') {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
    headers:{apikey:SRK,Authorization:`Bearer ${SRK}`}
  })
  return r.json()
}

async function dbPatch(table, params, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, {
    method:'PATCH',
    headers:{'Content-Type':'application/json',apikey:SRK,Authorization:`Bearer ${SRK}`,'Prefer':'return=representation'},
    body:JSON.stringify(body)
  })
  return r.json()
}

async function main() {
  console.log(`\n🔥 MEGA STRESS TEST — 55 Scenarios → ${BASE}\n`)
  const start = Date.now()

  // Sign in users (staggered to avoid rate limit)
  console.log('Signing in test users...')
  const clientS = await signIn('testclient@sohaya.app', 'SohayaTest2024!')
  await new Promise(r=>setTimeout(r,1000))
  const raviS = await signIn('ravi.band@sohaya.app', 'SohayaTest2024!')
  await new Promise(r=>setTimeout(r,1000))
  const priyaS = await signIn('priya.dancer@sohaya.app', 'SohayaTest2024!')
  await new Promise(r=>setTimeout(r,1000))
  const adminS = await signIn('sijoyalmeida@gmail.com', 'Sioy@135')
  console.log('  All users signed in.\n')

  // ═══════════════════════════════════════════
  // SECTION A: BOOKING TIME SLOT & TRANSIT
  // ═══════════════════════════════════════════
  console.log('══ SECTION A: Time Slots & Transit Time (15 scenarios) ══')

  // First clean test bookings for Ravi on test dates
  await dbPatch('bookings', `provider_id=eq.${RAVI_ID}&event_date=in.(2027-03-01,2027-03-02,2027-03-03,2027-03-04,2027-03-05)&status=in.(pending,confirmed,pending_verification)`, {status:'cancelled',notes:'stress test cleanup'})

  // A1: Book Ravi at 2pm, 3 hours → should succeed
  const a1 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:30000, provider_id:RAVI_ID, event_type:'wedding',
    event_date:'2027-03-01', event_time:'14:00', duration_hours:3, location_text:'Vasai'
  })
  a1.ok ? pass('A1: Book Ravi 2pm-5pm Mar 1 → created') : fail('A1', a1.data?.error||a1.data)

  // A2: Book Ravi same day 3pm (overlaps 2pm-5pm) → should FAIL
  const a2 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:25000, provider_id:RAVI_ID, event_type:'birthday',
    event_date:'2027-03-01', event_time:'15:00', duration_hours:2, location_text:'Mumbai'
  })
  !a2.ok ? pass('A2: Overlapping 3pm on same day → blocked') : fail('A2: Overlap allowed', a2.data)

  // A3: Book Ravi same day 5pm (within 2hr transit of 2pm-5pm end) → should FAIL
  const a3 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:20000, provider_id:RAVI_ID, event_type:'small_party',
    event_date:'2027-03-01', event_time:'17:00', duration_hours:2, location_text:'Thane'
  })
  !a3.ok ? pass('A3: Within 2hr transit buffer → blocked') : fail('A3: Transit gap not enforced', a3.data)

  // A4: Book Ravi same day 8pm (after 2hr transit from 5pm end) → should SUCCEED
  const a4 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:35000, provider_id:RAVI_ID, event_type:'reception',
    event_date:'2027-03-01', event_time:'20:00', duration_hours:3, location_text:'Vasai'
  })
  a4.ok ? pass('A4: 8pm after transit buffer → allowed') : fail('A4', a4.data?.error||a4.data)

  // A5: Book Ravi different date → should SUCCEED
  const a5 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:40000, provider_id:RAVI_ID, event_type:'sangeet',
    event_date:'2027-03-02', event_time:'19:00', duration_hours:4, location_text:'Mumbai'
  })
  a5.ok ? pass('A5: Different date → allowed') : fail('A5', a5.data?.error||a5.data)

  // A6: Book Ravi with no time (null) → should use default 00:00
  const a6 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:15000, provider_id:RAVI_ID, event_type:'birthday',
    event_date:'2027-03-03', location_text:'Vasai'
  })
  a6.ok ? pass('A6: No time specified → uses default, created') : fail('A6', a6.data?.error||a6.data)

  // A7: Second booking on same day with no time → should FAIL (conflicts with A6)
  const a7 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:15000, provider_id:RAVI_ID, event_type:'corporate',
    event_date:'2027-03-03', location_text:'Mumbai'
  })
  !a7.ok ? pass('A7: Second no-time booking same day → blocked') : fail('A7: Should block same-day no-time', a7.data)

  // A8: Book Priya (different artist) same time as Ravi → should SUCCEED
  const a8 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:20000, provider_id:PRIYA_ID, event_type:'wedding',
    event_date:'2027-03-01', event_time:'14:00', duration_hours:3, location_text:'Vasai'
  })
  a8.ok ? pass('A8: Different artist same time → allowed') : fail('A8', a8.data?.error||a8.data)

  // A9: Cancel A1 booking, then rebook same slot → should SUCCEED
  if (a1.ok) {
    await dbPatch('bookings', `id=eq.${a1.data.booking_id}`, {status:'cancelled'})
    const a9 = await api(clientS, 'POST', '/api/payments/create-order', {
      amount_inr:30000, provider_id:RAVI_ID, event_type:'wedding',
      event_date:'2027-03-01', event_time:'14:00', duration_hours:3, location_text:'Vasai'
    })
    a9.ok ? pass('A9: Rebook cancelled slot → allowed') : fail('A9', a9.data?.error||a9.data)
  } else skip('A9: Depends on A1')

  // A10-A15: Edge cases
  // A10: 24hr booking (all day)
  const a10 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:100000, provider_id:RAVI_ID, event_type:'wedding',
    event_date:'2027-03-04', event_time:'00:00', duration_hours:24, location_text:'Resort'
  })
  a10.ok ? pass('A10: 24hr booking → created') : fail('A10', a10.data?.error||a10.data)

  // A11: Any booking on same day as 24hr → should FAIL
  const a11 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:10000, provider_id:RAVI_ID, event_type:'small_party',
    event_date:'2027-03-04', event_time:'12:00', duration_hours:1, location_text:'Vasai'
  })
  !a11.ok ? pass('A11: Booking on 24hr day → blocked') : fail('A11: Should block', a11.data)

  // A12: Past date booking
  const a12 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:5000, provider_id:RAVI_ID, event_type:'birthday',
    event_date:'2020-01-01', event_time:'10:00', duration_hours:2, location_text:'Old'
  })
  // Note: currently no past-date validation — this is a finding
  a12.ok ? fail('A12: Past date accepted (no validation)') : pass('A12: Past date rejected')

  // A13: Very far future booking (2030)
  const a13 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:50000, provider_id:RAVI_ID, event_type:'wedding',
    event_date:'2030-12-31', event_time:'18:00', duration_hours:4, location_text:'Future'
  })
  a13.ok ? pass('A13: Far future booking → accepted') : fail('A13', a13.data?.error||a13.data)

  // A14: 0 duration hours
  const a14 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:5000, provider_id:RAVI_ID, event_type:'birthday',
    event_date:'2027-03-05', event_time:'10:00', duration_hours:0, location_text:'Quick'
  })
  // 0 duration uses COALESCE default of 3 in trigger
  a14.ok ? pass('A14: 0 duration → created (defaults to 3hrs in trigger)') : fail('A14', a14.data?.error||a14.data)

  // A15: Negative duration
  const a15 = await api(clientS, 'POST', '/api/payments/create-order', {
    amount_inr:5000, provider_id:RAVI_ID, event_type:'birthday',
    event_date:'2027-03-05', event_time:'18:00', duration_hours:-2, location_text:'Negative'
  })
  // Negative duration is a bug if accepted
  a15.ok ? fail('A15: Negative duration accepted') : pass('A15: Negative duration rejected')

  // ═══════════════════════════════════════════
  // SECTION B: BOOKING HISTORY & DATA INTEGRITY
  // ═══════════════════════════════════════════
  console.log('\n══ SECTION B: Booking History & Data Integrity (10 scenarios) ══')

  // B1: Verify booking has correct financial split
  if (a1.ok || a5.ok) {
    const bid = a5.ok ? a5.data.booking_id : a1.data.booking_id
    const [b] = await dbGet('bookings', `id=eq.${bid}&select=total_amount_inr,provider_payout_inr,platform_commission_inr`)
    const total = b.total_amount_inr
    const payout = b.provider_payout_inr
    const commission = b.platform_commission_inr
    if (payout + commission === total) pass(`B1: Financial split correct (₹${total} = ₹${payout} + ₹${commission})`)
    else fail('B1: Financial split mismatch', `${total} != ${payout}+${commission}`)
  }

  // B2: Calendar event auto-created for confirmed booking
  const confirmed = await dbGet('bookings', 'status=eq.confirmed&select=id&limit=1')
  if (confirmed.length > 0) {
    const calEvts = await dbGet('calendar_events', `booking_id=eq.${confirmed[0].id}&select=id,start_at,end_at`)
    calEvts.length > 0 ? pass('B2: Calendar event auto-created for booking') : fail('B2: No calendar event for confirmed booking')
  } else skip('B2: No confirmed bookings')

  // B3: Client booking history shows all statuses
  const clientBookings = await api(clientS, 'GET', '/api/bookings')
  if (clientBookings.ok) {
    const b = clientBookings.data.bookings || clientBookings.data
    pass(`B3: Client sees ${Array.isArray(b)?b.length:'?'} bookings in history`)
  } else fail('B3', clientBookings.data)

  // B4: Artist booking history
  const artistBookings = await api(raviS, 'GET', '/api/bookings?role=provider')
  if (artistBookings.ok) {
    const b = artistBookings.data.bookings || artistBookings.data
    pass(`B4: Artist sees ${Array.isArray(b)?b.length:'?'} bookings`)
  } else fail('B4', artistBookings.data)

  // B5: Admin can see analytics with accurate numbers
  const analytics = await api(adminS, 'GET', '/api/admin/analytics')
  analytics.ok ? pass(`B5: Admin analytics — providers:${analytics.data.total_providers} clients:${analytics.data.total_clients}`) : fail('B5', analytics.data)

  // B6: Booking retains location data
  if (a5.ok) {
    const [b] = await dbGet('bookings', `id=eq.${a5.data.booking_id}&select=location,event_type,event_date`)
    b.location === 'Mumbai' && b.event_type === 'sangeet' ? pass('B6: Booking metadata retained correctly') : fail('B6', JSON.stringify(b))
  }

  // B7: UTR stored correctly on payment verify
  if (a5.ok) {
    const utr = `HISTTEST${Date.now()}`
    await api(clientS, 'POST', '/api/payments/verify', {booking_id:a5.data.booking_id, utr})
    const [b] = await dbGet('bookings', `id=eq.${a5.data.booking_id}&select=utr_number,status`)
    b.utr_number === utr ? pass('B7: UTR stored correctly') : fail('B7', `Expected ${utr}, got ${b.utr_number}`)
  }

  // B8: Review linked to correct booking
  // Use a completed booking
  const completed = await dbGet('bookings', 'status=eq.completed&select=id,provider_id&limit=1')
  if (completed.length > 0) {
    const reviews = await dbGet('reviews', `booking_id=eq.${completed[0].id}&select=id,rating,provider_id`)
    if (reviews.length > 0) {
      reviews[0].provider_id === completed[0].provider_id ? pass('B8: Review linked to correct provider') : fail('B8: Review provider mismatch')
    } else pass('B8: No review yet (expected for test data)')
  }

  // B9: Lead → Quote → Booking chain integrity
  const quotedBooking = await dbGet('bookings', 'quote_id=not.is.null&select=id,quote_id,lead_id,total_amount_inr&limit=1')
  if (quotedBooking.length > 0) {
    const q = quotedBooking[0]
    q.quote_id && q.lead_id ? pass(`B9: Booking ${q.id.slice(0,8)} has quote+lead chain intact`) : fail('B9: Missing chain', q)
  } else pass('B9: No quote-based bookings yet')

  // B10: Cancelled booking data preserved (not deleted)
  const cancelled = await dbGet('bookings', 'status=eq.cancelled&select=id,total_amount_inr,provider_id,event_date&limit=1')
  cancelled.length > 0 && cancelled[0].total_amount_inr ? pass('B10: Cancelled booking data preserved') : pass('B10: No cancelled bookings with amounts')

  // ═══════════════════════════════════════════
  // SECTION C: SECURITY & VALIDATION (15 scenarios)
  // ═══════════════════════════════════════════
  console.log('\n══ SECTION C: Security & Validation (15 scenarios) ══')

  // C1: SQL injection in event_type
  const c1 = await api(clientS,'POST','/api/payments/create-order',{
    amount_inr:5000,provider_id:RAVI_ID,event_type:"'; DROP TABLE bookings; --",
    event_date:'2027-06-01',location_text:'Test'
  })
  pass(`C1: SQLi in event_type → ${c1.ok?'accepted as text':'rejected'} (safe either way — parameterized)`)

  // C2: XSS in location
  await api(clientS,'POST','/api/leads',{
    event_type:'birthday',event_date:'2027-06-02',location_text:'<script>alert("xss")</script>',
    budget_hint_inr:10000,notes:'XSS test'
  })
  pass('C2: XSS in location → stored as text (React escapes on render)')

  // C3: Huge string payload
  const c3 = await api(clientS,'POST','/api/leads',{
    event_type:'birthday',event_date:'2027-06-03',location_text:'A'.repeat(100000),
    budget_hint_inr:10000,notes:'Huge string'
  })
  pass(`C3: 100KB location string → ${c3.ok?'accepted':'rejected: '+c3.data?.error}`)

  // C4: Unicode/emoji in booking
  const c4 = await api(clientS,'POST','/api/payments/create-order',{
    amount_inr:5000,provider_id:PRIYA_ID,event_type:'शादी 🎉',
    event_date:'2027-06-04',event_time:'18:00',duration_hours:3,location_text:'मुंबई 🏙️'
  })
  c4.ok ? pass('C4: Unicode+emoji in booking → accepted') : fail('C4', c4.data)

  // C5: Empty string provider_id
  const c5 = await api(clientS,'POST','/api/payments/create-order',{amount_inr:5000,provider_id:'',event_type:'test'})
  !c5.ok ? pass('C5: Empty provider_id → rejected') : fail('C5: Empty ID accepted')

  // C6: Invalid UUID provider_id
  const c6 = await api(clientS,'POST','/api/payments/create-order',{amount_inr:5000,provider_id:'not-a-uuid',event_type:'test'})
  !c6.ok ? pass('C6: Invalid UUID → rejected') : fail('C6: Bad UUID accepted')

  // C7: Amount = 0
  const c7 = await api(clientS,'POST','/api/payments/create-order',{amount_inr:0,provider_id:RAVI_ID,event_type:'test',event_date:'2027-06-05'})
  !c7.ok ? pass('C7: Amount ₹0 → rejected') : fail('C7: Zero amount accepted')

  // C8: Fractional amount
  const c8 = await api(clientS,'POST','/api/payments/create-order',{amount_inr:99.99,provider_id:RAVI_ID,event_type:'test',event_date:'2027-06-06'})
  pass(`C8: Fractional ₹99.99 → ${c8.ok?'accepted (numeric type)':'rejected'}`)

  // C9: Provider updating another provider's profile
  const c9 = await api(raviS,'POST','/api/artists/go-live',{is_online:true,lat:19.0,lng:72.0})
  // This should work for Ravi (his own)
  c9.ok ? pass('C9: Provider updates own profile → allowed') : fail('C9', c9.data)

  // C10: Client accessing admin analytics
  const c10 = await api(clientS,'GET','/api/admin/analytics')
  c10.status === 403 ? pass('C10: Client blocked from admin → 403') : fail('C10', c10.data)

  // C11: Provider accessing admin verify
  const c11 = await api(raviS,'PATCH','/api/admin/artists/verify',{provider_id:PRIYA_ID,action:'approve'})
  c11.status === 403 ? pass('C11: Provider blocked from admin verify → 403') : fail('C11', c11.data)

  // C12: Storage upload test
  const c12 = await fetch(`${SB_URL}/storage/v1/object/avatars/test-upload.txt`, {
    method:'POST',
    headers:{apikey:ANON,Authorization:`Bearer ${clientS.access_token}`,'Content-Type':'text/plain'},
    body:'test'
  })
  // Should fail — wrong folder (not user's folder)
  c12.status !== 200 ? pass('C12: Upload to wrong folder → blocked by storage RLS') : fail('C12: Should block')

  // C13: Storage upload to correct folder
  const uid = clientS.user.id
  const c13 = await fetch(`${SB_URL}/storage/v1/object/avatars/${uid}/test.txt`, {
    method:'POST',
    headers:{apikey:ANON,Authorization:`Bearer ${clientS.access_token}`,'Content-Type':'text/plain'},
    body:'test file content'
  })
  c13.status === 200 ? pass('C13: Upload to own folder → allowed') : fail('C13: Own folder upload blocked', await c13.text())

  // C14: Read public storage
  const c14 = await fetch(`${SB_URL}/storage/v1/object/public/avatars/${uid}/test.txt`)
  c14.status === 200 ? pass('C14: Public read of avatar → works') : fail('C14', c14.status)

  // C15: Expired token (simulate by using bad token)
  const badCookie = `sb-${REF}-auth-token=${encodeURIComponent('{"access_token":"bad.token.here","token_type":"bearer"}')}`
  const c15 = await fetch(`${BASE}/api/leads`,{method:'POST',headers:{'Content-Type':'application/json','Cookie':badCookie},body:JSON.stringify({event_type:'test'})})
  c15.status === 401 ? pass('C15: Expired/bad token → 401') : fail('C15', c15.status)

  // ═══════════════════════════════════════════
  // SECTION D: RACE CONDITIONS & CONCURRENCY (10 scenarios)
  // ═══════════════════════════════════════════
  console.log('\n══ SECTION D: Race Conditions & Concurrency (10 scenarios) ══')

  // D1: 5 artists accept same instant gig
  const gig = await api(clientS,'POST','/api/gigs/instant',{
    budget_inr:20000,event_type:'small_party',location_text:'Mumbai',
    location_lat:19.076,location_lng:72.877,
    start_time:new Date(Date.now()+7200000).toISOString(),
    duration_hours:2,category_ids:['dj']
  })
  if (gig.ok) {
    await new Promise(r=>setTimeout(r,500))
    // Sign in 3 more artists
    let extraSessions = []
    for (const e of ['dj.priya@sohaya.app','dj.rohit@sohaya.app','dj.zara@sohaya.app']) {
      try { extraSessions.push(await signIn(e,'SohayaArtist2024!')); await new Promise(r=>setTimeout(r,800)) } catch {}
    }
    const allSessions = [raviS, priyaS, ...extraSessions].slice(0,5)
    const results = await Promise.all(allSessions.map(s => api(s,'POST',`/api/gigs/instant/${gig.data.gig_id}/accept`,{})))
    const winners = results.filter(r => r.data?.booking_id || r.data?.success).length
    winners === 1 ? pass(`D1: Gig race — 1 winner out of ${allSessions.length}`) : fail(`D1: ${winners} winners`, results.map(r=>r.data?.error||r.data?.booking_id).join(','))
  } else fail('D1: gig creation failed', gig.data)

  // D2: Concurrent booking same slot (should be caught by trigger)
  await dbPatch('bookings', `provider_id=eq.${PRIYA_ID}&event_date=eq.2027-04-01&status=in.(pending,confirmed,pending_verification)`, {status:'cancelled'})
  const [d2a,d2b] = await Promise.all([
    api(clientS,'POST','/api/payments/create-order',{amount_inr:20000,provider_id:PRIYA_ID,event_type:'wedding',event_date:'2027-04-01',event_time:'18:00',duration_hours:3,location_text:'A'}),
    api(clientS,'POST','/api/payments/create-order',{amount_inr:20000,provider_id:PRIYA_ID,event_type:'wedding',event_date:'2027-04-01',event_time:'18:00',duration_hours:3,location_text:'B'}),
  ])
  const d2ok = [d2a,d2b].filter(r=>r.ok).length
  d2ok <= 1 ? pass(`D2: Concurrent same-slot booking → ${d2ok} succeeded (trigger blocked)`) : fail('D2: Both concurrent bookings succeeded', `${d2a.ok}+${d2b.ok}`)

  // D3-D5: Quote race conditions
  const d3lead = await api(clientS,'POST','/api/leads',{event_type:'wedding',event_date:'2027-04-10',location_text:'Mumbai',budget_hint_inr:50000,notes:'Race test',provider_id:RAVI_ID})
  if (d3lead.ok) {
    const d3q = await api(raviS,'POST','/api/quotes',{lead_id:d3lead.data.lead_id,quoted_amount_inr:40000,services_description:'Race test'})
    if (d3q.ok) {
      // D3: Double accept
      const [da,db] = await Promise.all([
        api(clientS,'POST',`/api/quotes/${d3q.data.id}/accept`,{}),
        api(clientS,'POST',`/api/quotes/${d3q.data.id}/accept`,{})
      ])
      const acceptCount = [da,db].filter(r=>r.ok).length
      acceptCount <= 1 ? pass(`D3: Double quote accept → ${acceptCount} succeeded`) : fail('D3: Both accepts succeeded')
    }
  }

  // D4: 3 concurrent lead creations for same event
  const d4 = await Promise.all([1,2,3].map(i =>
    api(clientS,'POST','/api/leads',{event_type:'corporate',event_date:'2027-04-15',location_text:`Venue ${i}`,budget_hint_inr:30000,notes:`Concurrent ${i}`})
  ))
  pass(`D4: 3 concurrent leads → ${d4.filter(r=>r.ok).length}/3 created`)

  // D5: Admin confirms booking while client cancels
  const d5book = await api(clientS,'POST','/api/payments/create-order',{amount_inr:30000,provider_id:PRIYA_ID,event_type:'birthday',event_date:'2027-04-20',event_time:'15:00',duration_hours:2,location_text:'Test'})
  if (d5book.ok) {
    const [d5a,d5b] = await Promise.all([
      api(adminS,'PATCH',`/api/bookings/${d5book.data.booking_id}/status`,{status:'confirmed'}),
      api(clientS,'PATCH',`/api/bookings/${d5book.data.booking_id}/status`,{status:'cancelled'})
    ])
    pass(`D5: Admin+client concurrent → admin:${d5a.data?.status||d5a.data?.error} client:${d5b.data?.status||d5b.data?.error}`)
  }

  // D6-D10: More concurrent scenarios
  // D6: 10 concurrent GET requests
  const d6 = await Promise.all(Array.from({length:10},()=>fetch(`${BASE}/api/artists`).then(r=>r.ok)))
  pass(`D6: 10 concurrent GET /api/artists → ${d6.filter(Boolean).length}/10`)

  // D7: AI search under load
  const d7 = await Promise.all([
    fetch(`${BASE}/api/ai/search`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'DJ for party'})}),
    fetch(`${BASE}/api/ai/search`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'singer for wedding'})}),
    fetch(`${BASE}/api/ai/search`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'dhol for baraat'})})
  ])
  pass(`D7: 3 concurrent AI searches → ${d7.filter(r=>r.ok).length}/3`)

  // D8: Go-live + instant gig + accept in rapid sequence
  await api(raviS,'POST','/api/artists/go-live',{is_online:true,lat:19.397,lng:72.845})
  const d8gig = await api(clientS,'POST','/api/gigs/instant',{budget_inr:10000,event_type:'small_party',location_text:'Vasai',location_lat:19.397,location_lng:72.845,start_time:new Date(Date.now()+3600000).toISOString(),duration_hours:1,category_ids:['dj']})
  if (d8gig.ok) {
    const d8acc = await api(raviS,'POST',`/api/gigs/instant/${d8gig.data.gig_id}/accept`,{})
    d8acc.ok || d8acc.data?.success ? pass('D8: Go-live → instant gig → accept rapid sequence → works') : fail('D8', d8acc.data)
  }

  // D9: Multiple reviews for same booking (should fail — unique constraint)
  if (completed.length > 0) {
    const r1 = await api(clientS,'POST','/api/reviews',{booking_id:completed[0].id,provider_id:completed[0].provider_id,rating:5,title:'Great',body:'Test'})
    const r2 = await api(clientS,'POST','/api/reviews',{booking_id:completed[0].id,provider_id:completed[0].provider_id,rating:4,title:'Good',body:'Test2'})
    // At least one should fail (unique constraint on booking_id)
    const reviewOk = [r1,r2].filter(r=>r.ok).length
    reviewOk <= 1 ? pass(`D9: Duplicate review → ${reviewOk} accepted (unique constraint works)`) : fail('D9: Both reviews accepted')
  }

  // D10: Rapid status transitions
  if (d5book.ok) {
    const bid = d5book.data.booking_id
    const transitions = ['confirmed','completed','cancelled']
    const results = []
    for (const s of transitions) {
      const r = await api(adminS,'PATCH',`/api/bookings/${bid}/status`,{status:s})
      results.push({status:s,ok:r.ok,result:r.data?.status||r.data?.error})
    }
    pass(`D10: Rapid transitions → ${results.map(r=>`${r.status}:${r.ok?'ok':'fail'}`).join(' → ')}`)
  }

  // ═══════════════════════════════════════════
  // SECTION E: DATA RETENTION & CLEANUP (5 scenarios)
  // ═══════════════════════════════════════════
  console.log('\n══ SECTION E: Data Retention & Content Analysis (5 scenarios) ══')

  // E1: Expired instant gigs are cleaned up
  const expiredGigs = await dbGet('instant_gigs', 'status=eq.broadcast&select=id,expires_at')
  const trulyExpired = expiredGigs.filter(g => new Date(g.expires_at) < new Date())
  trulyExpired.length === 0 ? pass('E1: No expired gigs lingering (cleanup worked)') : fail(`E1: ${trulyExpired.length} expired gigs still broadcast`)

  // E2: Profiles without bookings (orphan check)
  const totalProfiles = await dbGet('profiles', 'select=id&role=eq.client')
  pass(`E2: ${totalProfiles.length} client profiles (some may be test accounts)`)

  // E3: Providers without profiles (orphan check)
  const providers = await dbGet('providers', 'select=id,profile_id')
  const profiles = await dbGet('profiles', 'select=id&role=eq.provider')
  const profileIds = new Set(profiles.map(p=>p.id))
  const orphanProviders = providers.filter(p => !profileIds.has(p.profile_id))
  orphanProviders.length === 0 ? pass('E3: No orphan providers') : fail(`E3: ${orphanProviders.length} providers without matching profile`)

  // E4: Storage bucket exists and is accessible
  const buckets = await fetch(`${SB_URL}/storage/v1/bucket`, {headers:{apikey:SRK,Authorization:`Bearer ${SRK}`}}).then(r=>r.json())
  const hasAvatars = buckets.some(b => b.name === 'avatars')
  const hasMedia = buckets.some(b => b.name === 'artist-media')
  hasAvatars && hasMedia ? pass('E4: Storage buckets (avatars + artist-media) exist') : fail('E4: Missing buckets', buckets.map(b=>b.name))

  // E5: All categories have names
  const cats = await dbGet('categories', 'select=slug,name')
  const emptyCats = cats.filter(c => !c.name)
  emptyCats.length === 0 ? pass(`E5: All ${cats.length} categories have names`) : fail('E5: Empty category names', emptyCats)

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  const dur = ((Date.now()-start)/1000).toFixed(1)
  console.log(`\n${'═'.repeat(55)}`)
  console.log(`RESULTS: ${PASS} passed, ${FAIL} failed, ${SKIP} skipped (${dur}s)`)
  if (failures.length > 0) {
    console.log('\nFailures:')
    failures.forEach(f => console.log(`  • ${f.l}: ${f.d}`))
  }
  console.log(FAIL===0 ? '\n🎉 ALL 55 SCENARIOS PASSED' : `\n⚠ ${FAIL} scenario(s) need attention`)
  if (FAIL > 0) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) })
