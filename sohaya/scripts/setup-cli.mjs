#!/usr/bin/env node
/**
 * Sohaya — Supabase CLI Full Setup
 *
 * Run once to link this project to Supabase CLI.
 * After this: `npm run db:push` and `npm run db:status` work directly.
 *
 * Usage:
 *   node scripts/setup-cli.mjs <personal_access_token> <db_password>
 *
 * Get Personal Access Token from:
 *   https://supabase.com/dashboard/account/tokens
 *   → "Generate new token" → copy the sbp_... token
 *
 * Get DB password from:
 *   Supabase Dashboard → Settings → Database → Database password
 */

import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PROJECT_REF = 'ylfagpbsmbhnmomeosyx'

const [pat, dbPassword] = process.argv.slice(2)

if (!pat || !dbPassword) {
  console.error('\n❌ Usage: node scripts/setup-cli.mjs <pat_token> <db_password>')
  console.error('\n   PAT: https://supabase.com/dashboard/account/tokens')
  console.error('   DB password: Supabase Dashboard → Settings → Database\n')
  process.exit(1)
}

const run = (cmd, label) => {
  console.log(`\n⏳ ${label}`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
}

try {
  run(`npx supabase login --token ${pat}`, 'Logging in to Supabase CLI...')
  run(`npx supabase link --project-ref ${PROJECT_REF} -p "${dbPassword}"`, 'Linking project...')
  run(`npx supabase db push --linked --include-all`, 'Pushing all migrations...')
  console.log('\n✅ CLI fully set up! You can now use:')
  console.log('   npm run db:push    — push new migrations')
  console.log('   npm run db:status  — see migration history')
  console.log('   npm run db:diff    — diff local vs remote\n')
} catch (err) {
  console.error('\n❌ Setup failed. Check error above.\n')
  process.exit(1)
}
