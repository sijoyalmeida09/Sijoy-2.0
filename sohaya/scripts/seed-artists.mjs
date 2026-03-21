#!/usr/bin/env node
/**
 * Sohaya — Seed 50 diverse Indian artists via Admin API
 * Usage: node scripts/seed-artists.mjs
 */

const SUPABASE_URL = 'https://ylfagpbsmbhnmomeosyx.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmFncGJzbWJobm1vbWVvc3l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA2NDMxMiwiZXhwIjoyMDg5NjQwMzEyfQ.sQ7LwSUU3Tz_esLbxjpQ2z70XMDMAIEfcep3Ymbjz50'

const H = { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }

const ARTISTS = [
  // Bollywood Bands
  { name: 'Raj & The Bollywood Kings', email: 'raj.bollywood@sohaya.app', cat: ['bollywood-band'], city: 'Vasai', state: 'Maharashtra', rate: 45000, gigs: 200, rating: 4.8, founder: true },
  { name: 'Mumbai Beats Orchestra', email: 'mumbai.beats@sohaya.app', cat: ['bollywood-band', 'classical-music'], city: 'Mumbai', state: 'Maharashtra', rate: 75000, gigs: 150, rating: 4.7, founder: false },
  { name: 'Filmi Dhamaka Band', email: 'filmi.dhamaka@sohaya.app', cat: ['bollywood-band'], city: 'Pune', state: 'Maharashtra', rate: 35000, gigs: 89, rating: 4.5, founder: false },
  { name: 'Desi Beats Collective', email: 'desi.beats@sohaya.app', cat: ['bollywood-band', 'folk-music'], city: 'Thane', state: 'Maharashtra', rate: 28000, gigs: 120, rating: 4.4, founder: false },
  { name: 'Aaroha Music Group', email: 'aaroha.music@sohaya.app', cat: ['bollywood-band'], city: 'Navi Mumbai', state: 'Maharashtra', rate: 55000, gigs: 175, rating: 4.9, founder: true },

  // DJs
  { name: 'DJ Max Fernandez', email: 'dj.max@sohaya.app', cat: ['dj'], city: 'Vasai', state: 'Maharashtra', rate: 18000, gigs: 312, rating: 4.6, founder: false },
  { name: 'DJ Priya Beats', email: 'dj.priya@sohaya.app', cat: ['dj'], city: 'Mumbai', state: 'Maharashtra', rate: 25000, gigs: 200, rating: 4.7, founder: false },
  { name: 'DJ Rohit Remix', email: 'dj.rohit@sohaya.app', cat: ['dj'], city: 'Pune', state: 'Maharashtra', rate: 15000, gigs: 450, rating: 4.5, founder: false },
  { name: 'DJ Zara Nightlife', email: 'dj.zara@sohaya.app', cat: ['dj'], city: 'Goa', state: 'Goa', rate: 35000, gigs: 280, rating: 4.8, founder: false },
  { name: 'DJ Karan Soni', email: 'dj.karan@sohaya.app', cat: ['dj'], city: 'Delhi', state: 'Delhi', rate: 40000, gigs: 160, rating: 4.6, founder: false },

  // Classical
  { name: 'Pandit Suresh Sharma', email: 'pandit.suresh@sohaya.app', cat: ['classical-music'], city: 'Mumbai', state: 'Maharashtra', rate: 30000, gigs: 95, rating: 4.9, founder: false },
  { name: 'Raga Ensemble', email: 'raga.ensemble@sohaya.app', cat: ['classical-music'], city: 'Pune', state: 'Maharashtra', rate: 40000, gigs: 60, rating: 4.8, founder: false },
  { name: 'Tansen Music Academy Band', email: 'tansen.band@sohaya.app', cat: ['classical-music', 'folk-music'], city: 'Vasai', state: 'Maharashtra', rate: 22000, gigs: 45, rating: 4.7, founder: true },

  // Ghazal
  { name: 'Ustad Feroz Khan', email: 'feroz.ghazal@sohaya.app', cat: ['ghazal'], city: 'Mumbai', state: 'Maharashtra', rate: 50000, gigs: 80, rating: 4.9, founder: false },
  { name: 'Mehfil-e-Ghazal', email: 'mehfil.ghazal@sohaya.app', cat: ['ghazal'], city: 'Hyderabad', state: 'Telangana', rate: 35000, gigs: 65, rating: 4.8, founder: false },
  { name: 'Shayari Night Ensemble', email: 'shayari.night@sohaya.app', cat: ['ghazal'], city: 'Lucknow', state: 'Uttar Pradesh', rate: 28000, gigs: 40, rating: 4.6, founder: false },

  // Dancers
  { name: 'Priya Nair — Bharatanatyam', email: 'priya.dancer@sohaya.app', cat: ['classical-dance'], city: 'Mumbai', state: 'Maharashtra', rate: 25000, gigs: 85, rating: 4.6, founder: false },
  { name: 'Kathak Masters Group', email: 'kathak.masters@sohaya.app', cat: ['classical-dance', 'folk-dance'], city: 'Jaipur', state: 'Rajasthan', rate: 30000, gigs: 110, rating: 4.7, founder: false },
  { name: 'Bollywood Dance Crew', email: 'bollywood.dance@sohaya.app', cat: ['folk-dance'], city: 'Mumbai', state: 'Maharashtra', rate: 20000, gigs: 200, rating: 4.5, founder: false },
  { name: 'Nritya Sangam Academy', email: 'nritya.sangam@sohaya.app', cat: ['classical-dance', 'folk-dance'], city: 'Pune', state: 'Maharashtra', rate: 18000, gigs: 75, rating: 4.4, founder: false },

  // Dhol
  { name: 'Dhol Waaley', email: 'dhol.waaley@sohaya.app', cat: ['dhol-player'], city: 'Vasai', state: 'Maharashtra', rate: 8000, gigs: 500, rating: 4.7, founder: true },
  { name: 'Nashik Dhol Tasha Group', email: 'nashik.dhol@sohaya.app', cat: ['dhol-player'], city: 'Nashik', state: 'Maharashtra', rate: 12000, gigs: 300, rating: 4.8, founder: false },
  { name: 'Baraat Squad Dhol', email: 'baraat.dhol@sohaya.app', cat: ['dhol-player'], city: 'Mumbai', state: 'Maharashtra', rate: 10000, gigs: 250, rating: 4.6, founder: false },

  // Emcee/Host
  { name: 'Vivek Sharma — MC', email: 'vivek.mc@sohaya.app', cat: ['emcee'], city: 'Mumbai', state: 'Maharashtra', rate: 20000, gigs: 400, rating: 4.8, founder: false },
  { name: 'Anchor Ananya Mehta', email: 'ananya.anchor@sohaya.app', cat: ['emcee'], city: 'Pune', state: 'Maharashtra', rate: 15000, gigs: 220, rating: 4.7, founder: false },
  { name: 'Bilingual Host Rohan', email: 'rohan.host@sohaya.app', cat: ['emcee'], city: 'Vasai', state: 'Maharashtra', rate: 12000, gigs: 180, rating: 4.5, founder: true },

  // Comedian
  { name: 'Standup Star Akash', email: 'akash.standup@sohaya.app', cat: ['comedian'], city: 'Mumbai', state: 'Maharashtra', rate: 35000, gigs: 150, rating: 4.7, founder: false },
  { name: 'Comedy Club Crew', email: 'comedy.crew@sohaya.app', cat: ['comedian'], city: 'Bangalore', state: 'Karnataka', rate: 25000, gigs: 90, rating: 4.6, founder: false },

  // Folk Music
  { name: 'Rajasthani Folk Ensemble', email: 'rajasthani.folk@sohaya.app', cat: ['folk-music'], city: 'Jaipur', state: 'Rajasthan', rate: 22000, gigs: 130, rating: 4.7, founder: false },
  { name: 'Lavani Troupe Mumbai', email: 'lavani.troupe@sohaya.app', cat: ['folk-music', 'folk-dance'], city: 'Mumbai', state: 'Maharashtra', rate: 18000, gigs: 95, rating: 4.6, founder: false },
  { name: 'Goa Groove Band', email: 'goa.groove@sohaya.app', cat: ['folk-music', 'bollywood-band'], city: 'Goa', state: 'Goa', rate: 30000, gigs: 200, rating: 4.8, founder: false },

  // Corporate speakers
  { name: 'Motivational Speaker Arjun', email: 'arjun.speaker@sohaya.app', cat: ['corporate-speaker'], city: 'Mumbai', state: 'Maharashtra', rate: 60000, gigs: 70, rating: 4.9, founder: false },
  { name: 'Leadership Coach Kavita', email: 'kavita.coach@sohaya.app', cat: ['corporate-speaker'], city: 'Bangalore', state: 'Karnataka', rate: 45000, gigs: 55, rating: 4.8, founder: false },

  // Photographers
  { name: 'Clicks by Santosh', email: 'santosh.photo@sohaya.app', cat: ['photographer'], city: 'Mumbai', state: 'Maharashtra', rate: 25000, gigs: 350, rating: 4.8, founder: false },
  { name: 'Wedding Frame Studio', email: 'wedding.frame@sohaya.app', cat: ['photographer'], city: 'Pune', state: 'Maharashtra', rate: 20000, gigs: 200, rating: 4.7, founder: false },
  { name: 'Candid Moments Photography', email: 'candid.moments@sohaya.app', cat: ['photographer'], city: 'Vasai', state: 'Maharashtra', rate: 15000, gigs: 120, rating: 4.6, founder: true },

  // Sound & Light
  { name: 'Sound Masters AV', email: 'soundmasters.av@sohaya.app', cat: ['sound-light'], city: 'Mumbai', state: 'Maharashtra', rate: 30000, gigs: 400, rating: 4.7, founder: false },
  { name: 'Vasai Event Tech', email: 'vasai.tech@sohaya.app', cat: ['sound-light'], city: 'Vasai', state: 'Maharashtra', rate: 18000, gigs: 250, rating: 4.5, founder: true },

  // More variety
  { name: 'Shehnai Maestro Ramesh', email: 'shehnai.ramesh@sohaya.app', cat: ['classical-music'], city: 'Varanasi', state: 'Uttar Pradesh', rate: 20000, gigs: 60, rating: 4.9, founder: false },
  { name: 'Jugalbandi Duo', email: 'jugalbandi@sohaya.app', cat: ['classical-music'], city: 'Mumbai', state: 'Maharashtra', rate: 40000, gigs: 45, rating: 5.0, founder: false },
  { name: 'Rock the Baraat Band', email: 'rock.baraat@sohaya.app', cat: ['bollywood-band', 'dhol-player'], city: 'Delhi', state: 'Delhi', rate: 65000, gigs: 180, rating: 4.8, founder: false },
  { name: 'Kolkata Fusion Ensemble', email: 'kolkata.fusion@sohaya.app', cat: ['bollywood-band', 'classical-music'], city: 'Kolkata', state: 'West Bengal', rate: 35000, gigs: 90, rating: 4.7, founder: false },
  { name: 'Chennai Classical Collective', email: 'chennai.classical@sohaya.app', cat: ['classical-music', 'classical-dance'], city: 'Chennai', state: 'Tamil Nadu', rate: 28000, gigs: 75, rating: 4.8, founder: false },
  { name: 'Hyderabad Fusion Band', email: 'hyd.fusion@sohaya.app', cat: ['bollywood-band', 'folk-music'], city: 'Hyderabad', state: 'Telangana', rate: 40000, gigs: 130, rating: 4.6, founder: false },
  { name: 'Qawwali Nights Group', email: 'qawwali.nights@sohaya.app', cat: ['folk-music'], city: 'Delhi', state: 'Delhi', rate: 30000, gigs: 85, rating: 4.8, founder: false },
  { name: 'Carnatic Vocal Trio', email: 'carnatic.trio@sohaya.app', cat: ['classical-music'], city: 'Bangalore', state: 'Karnataka', rate: 22000, gigs: 55, rating: 4.7, founder: false },
  { name: 'Wedding Sangeet Specialists', email: 'sangeet.specialist@sohaya.app', cat: ['bollywood-band', 'emcee'], city: 'Mumbai', state: 'Maharashtra', rate: 80000, gigs: 220, rating: 4.9, founder: false },
  { name: 'Neon DJ Experience', email: 'neon.dj@sohaya.app', cat: ['dj', 'sound-light'], city: 'Mumbai', state: 'Maharashtra', rate: 45000, gigs: 300, rating: 4.8, founder: false },
  { name: 'Kids Entertainment Crew', email: 'kids.crew@sohaya.app', cat: ['comedian', 'emcee'], city: 'Pune', state: 'Maharashtra', rate: 12000, gigs: 180, rating: 4.6, founder: false },
  { name: 'Sufi Soul Singers', email: 'sufi.soul@sohaya.app', cat: ['ghazal', 'folk-music'], city: 'Mumbai', state: 'Maharashtra', rate: 35000, gigs: 70, rating: 4.8, founder: false },
]

async function adminFetch(path, method = 'GET', body) {
  const res = await fetch(SUPABASE_URL + path, {
    method, headers: H, body: body ? JSON.stringify(body) : undefined
  })
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => null) }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('\n🎵 Seeding 50 Sohaya artists...\n')
  let created = 0, skipped = 0

  for (const [i, a] of ARTISTS.entries()) {
    process.stdout.write(`[${i+1}/50] ${a.name}... `)

    // Check if user exists
    const listRes = await adminFetch('/auth/v1/admin/users?page=1&per_page=1000')
    const existing = listRes.data?.users?.find(u => u.email === a.email)

    let userId
    if (existing) {
      userId = existing.id
      process.stdout.write('exists ')
    } else {
      const createRes = await adminFetch('/auth/v1/admin/users', 'POST', {
        email: a.email,
        password: 'SohayaArtist2024!',
        email_confirm: true,
        user_metadata: { full_name: a.name, role: 'provider' },
      })
      if (!createRes.ok) {
        console.log('FAILED:', createRes.data?.msg)
        continue
      }
      userId = createRes.data.id
      created++
      await sleep(100) // avoid rate limiting
    }

    // Upsert profile
    await adminFetch('/rest/v1/profiles', 'POST', {
      id: userId, email: a.email, full_name: a.name, role: 'provider'
    })

    // Check/create provider
    const provCheck = await adminFetch(`/rest/v1/providers?profile_id=eq.${userId}&select=id`)
    if (provCheck.data?.length > 0) {
      process.stdout.write('(provider exists)\n')
      skipped++
      continue
    }

    const provRes = await adminFetch('/rest/v1/providers', 'POST', {
      profile_id: userId,
      entity_type: 'individual',
      display_name: a.name,
      categories: a.cat,
      ai_generated_bio: `${a.name} is one of ${a.city}'s most sought-after performers with ${a.gigs}+ events. Known for their signature style and crowd connection, they bring energy and artistry to every celebration.`,
      instruments: [],
      base_rate_inr: a.rate,
      travel_radius_km: 100,
      city: a.city,
      state: a.state,
      languages: ['Hindi', 'English', 'Marathi'],
      status: 'verified',
      is_online: Math.random() > 0.7,
      is_founder: a.founder,
      avg_rating: a.rating,
      total_gigs: a.gigs,
      response_rate: 95,
      commission_tier: a.founder ? 'founder' : 'standard',
      band_promotion_tier: 'basic',
      subscription_tier: 'free',
      photo_urls: [`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(a.name)}`],
      audio_urls: [],
      profile_completeness: 85,
    })

    if (provRes.ok) {
      console.log(`✓`)
    } else {
      console.log(`PROV FAILED: ${JSON.stringify(provRes.data).slice(0, 100)}`)
    }
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
