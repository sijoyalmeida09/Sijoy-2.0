#!/usr/bin/env node
/**
 * Sohaya — Test Data Seeder
 * Creates test users (admin, client, 2 artists) using Supabase Admin API
 * Usage: node scripts/seed-test-data.mjs
 */

const SUPABASE_URL = 'https://ylfagpbsmbhnmomeosyx.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmFncGJzbWJobm1vbWVvc3l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA2NDMxMiwiZXhwIjoyMDg5NjQwMzEyfQ.sQ7LwSUU3Tz_esLbxjpQ2z70XMDMAIEfcep3Ymbjz50'

const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
}

// Test users definition
const TEST_USERS = [
  {
    email: 'testclient@sohaya.app',
    password: 'SohayaTest2024!',
    role: 'client',
    full_name: 'Test Client Riya',
    label: 'CLIENT',
  },
  {
    email: 'ravi.band@sohaya.app',
    password: 'SohayaTest2024!',
    role: 'provider',
    full_name: 'Ravi & The Bollywood Kings',
    label: 'ARTIST_1',
    provider: {
      entity_type: 'band',
      display_name: 'Ravi & The Bollywood Kings',
      band_name: 'Bollywood Kings',
      categories: ['bollywood-band'],
      ai_generated_bio: 'Ravi & The Bollywood Kings electrify every wedding with 3 hours of non-stop Bollywood hits, seamlessly blending retro classics with modern chartbusters. Based in Vasai, they have entertained over 200 weddings across Maharashtra with their signature dhol-tasha fusion opening.',
      instruments: ['guitar', 'tabla', 'keyboard', 'violin'],
      base_rate_inr: 45000,
      hourly_rate_inr: 15000,
      travel_radius_km: 100,
      city: 'Vasai',
      state: 'Maharashtra',
      languages: ['Hindi', 'Marathi', 'English'],
      status: 'verified',
      is_founder: true,
      commission_tier: 'founder',
      avg_rating: 4.8,
      total_gigs: 200,
    },
  },
  {
    email: 'priya.dancer@sohaya.app',
    password: 'SohayaTest2024!',
    role: 'provider',
    full_name: 'Priya Nair',
    label: 'ARTIST_2',
    provider: {
      entity_type: 'individual',
      display_name: 'Priya Nair — Classical Dancer',
      categories: ['classical-dance', 'folk-dance'],
      ai_generated_bio: 'Priya Nair brings two decades of Bharatanatyam mastery to every stage, transforming corporate galas and wedding receptions into cultural spectacles. Her choreography, steeped in Kerala temple tradition yet adapted for modern audiences, has won the Maharashtra Kala Ratna Award twice.',
      instruments: [],
      base_rate_inr: 25000,
      travel_radius_km: 75,
      city: 'Mumbai',
      state: 'Maharashtra',
      languages: ['Hindi', 'Marathi', 'Malayalam', 'English'],
      status: 'verified',
      is_founder: false,
      commission_tier: 'standard',
      avg_rating: 4.6,
      total_gigs: 85,
    },
  },
  {
    email: 'dj.max@sohaya.app',
    password: 'SohayaTest2024!',
    role: 'provider',
    full_name: 'DJ Max Fernandez',
    label: 'ARTIST_3',
    provider: {
      entity_type: 'individual',
      display_name: 'DJ Max Fernandez',
      categories: ['dj'],
      ai_generated_bio: 'DJ Max Fernandez is Vasai\'s most-booked DJ, seamlessly mixing Bollywood, EDM, and Goan beats for crowds of 50 to 5000. His signature "Bollywood x Trance" sets have become the stuff of legend at Vasai weddings and Goa corporate retreats alike.',
      instruments: [],
      base_rate_inr: 18000,
      travel_radius_km: 150,
      city: 'Vasai',
      state: 'Maharashtra',
      languages: ['Hindi', 'English', 'Konkani'],
      status: 'verified',
      is_founder: false,
      commission_tier: 'standard',
      avg_rating: 4.5,
      total_gigs: 312,
    },
  },
]

async function adminFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: { ...ADMIN_HEADERS, ...(options.headers || {}) },
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, ok: res.ok, data }
}

async function createOrGetUser(user) {
  // Check if user exists
  const listRes = await adminFetch(`/auth/v1/admin/users?page=1&per_page=1000`)
  const existing = listRes.data?.users?.find(u => u.email === user.email)

  if (existing) {
    console.log(`  ✓ User exists: ${user.email} (${existing.id})`)
    return existing
  }

  const res = await adminFetch('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role },
    }),
  })

  if (!res.ok) {
    console.error(`  ✗ Failed to create ${user.email}:`, res.data)
    return null
  }
  console.log(`  ✓ Created: ${user.email} (${res.data.id})`)
  return res.data
}

async function upsertProfile(userId, user) {
  const res = await adminFetch('/rest/v1/profiles', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: userId,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    }),
  })
  if (!res.ok) {
    console.error(`  ✗ Profile upsert failed:`, res.data)
  } else {
    console.log(`  ✓ Profile upserted for ${user.email}`)
  }
}

async function upsertClient(userId) {
  const res = await adminFetch('/rest/v1/clients', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ profile_id: userId }),
  })
  if (!res.ok) {
    console.error(`  ✗ Client record failed:`, res.data)
  } else {
    console.log(`  ✓ Client record created`)
  }
}

async function upsertProvider(userId, providerData) {
  // Check if provider already exists
  const checkRes = await adminFetch(`/rest/v1/providers?profile_id=eq.${userId}&select=id`)
  if (checkRes.ok && checkRes.data?.length > 0) {
    console.log(`  ✓ Provider exists (${checkRes.data[0].id})`)
    return checkRes.data[0]
  }

  const res = await adminFetch('/rest/v1/providers', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify({
      profile_id: userId,
      ...providerData,
      is_online: false,
      response_rate: 100,
      band_promotion_tier: 'basic',
      subscription_tier: 'free',
      photo_urls: [],
      audio_urls: [],
      profile_completeness: 90,
    }),
  })
  if (!res.ok) {
    console.error(`  ✗ Provider insert failed:`, res.data)
    return null
  }
  console.log(`  ✓ Provider created (${res.data[0]?.id})`)
  return res.data[0]
}

async function setAdminRole() {
  const adminEmail = 'sijoyalmeida@gmail.com'
  const listRes = await adminFetch(`/auth/v1/admin/users?page=1&per_page=1000`)
  const admin = listRes.data?.users?.find(u => u.email === adminEmail)
  if (!admin) {
    console.log(`  ⚠ Admin user ${adminEmail} not found — please sign up first`)
    return
  }
  const res = await adminFetch('/rest/v1/profiles', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ id: admin.id, email: adminEmail, role: 'admin', full_name: 'Sijoy Almeida' }),
  })
  if (!res.ok) {
    console.error(`  ✗ Admin role failed:`, res.data)
  } else {
    console.log(`  ✓ Admin role set for ${adminEmail}`)
  }
}

async function main() {
  console.log('\n🌱 Sohaya — Seeding Test Data\n')

  // Set admin role for real account
  console.log('→ Setting admin role...')
  await setAdminRole()

  const createdUsers = {}

  for (const user of TEST_USERS) {
    console.log(`\n→ [${user.label}] ${user.email}`)

    const authUser = await createOrGetUser(user)
    if (!authUser) continue

    createdUsers[user.label] = { ...authUser, ...user }

    await upsertProfile(authUser.id, user)

    if (user.role === 'client') {
      await upsertClient(authUser.id)
    }

    if (user.role === 'provider' && user.provider) {
      const provider = await upsertProvider(authUser.id, user.provider)
      if (provider) createdUsers[user.label].provider_id = provider.id
    }
  }

  console.log('\n✅ Seed complete!\n')
  console.log('Test credentials:')
  console.log('  Admin:    sijoyalmeida@gmail.com / [your Google auth]')
  for (const user of TEST_USERS) {
    console.log(`  ${user.label.padEnd(10)}: ${user.email} / SohayaTest2024!`)
  }

  // Write IDs to a temp file for smoke test
  const ids = {}
  for (const [key, val] of Object.entries(createdUsers)) {
    ids[key] = { id: val.id, email: val.email, provider_id: val.provider_id }
  }
  const fs = await import('node:fs')
  fs.writeFileSync('.smoke-test-ids.json', JSON.stringify(ids, null, 2))
  console.log('\nIDs saved to .smoke-test-ids.json for smoke test\n')
}

main().catch(err => { console.error(err); process.exit(1) })
