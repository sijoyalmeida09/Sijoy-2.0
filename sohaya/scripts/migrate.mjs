#!/usr/bin/env node
/**
 * Sohaya — Migration Runner
 * Runs all SQL migrations against the remote Supabase database.
 *
 * Usage:
 *   node scripts/migrate.mjs <db_password>
 *
 * The DB password is found in:
 *   Supabase Dashboard → Settings → Database → Database password
 *
 * Connection string used:
 *   postgresql://postgres.<ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
 */

import { execSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_REF = 'ylfagpbsmbhnmomeosyx'
const MIGRATIONS_DIR = join(__dirname, '../supabase/migrations')

const dbPassword = process.argv[2]

if (!dbPassword) {
  console.error('\n❌ Usage: node scripts/migrate.mjs <db_password>')
  console.error('\n   Get your DB password from:')
  console.error('   Supabase Dashboard → Settings → Database → Database password\n')
  process.exit(1)
}

// Supabase pooler connection (port 6543 = transaction mode, works everywhere)
const DB_URL = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`

console.log(`\n🚀 Sohaya — Running migrations`)
console.log(`   Project: ${PROJECT_REF}`)
console.log(`   Mode: Remote (Supabase pooler)\n`)

// Get all migration files sorted
const files = readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort()

console.log(`📋 Migrations to apply:`)
files.forEach(f => console.log(`   - ${f}`))
console.log('')

try {
  execSync(
    `npx supabase db push --db-url "${DB_URL}" --include-all`,
    {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
    }
  )
  console.log('\n✅ All migrations applied successfully!')
  console.log('\nNext step: Set admin role')
  console.log('   Run in Supabase SQL Editor:')
  console.log(`   update profiles set role = 'admin' where email = 'sijoyalmeida@gmail.com';\n`)
} catch (err) {
  console.error('\n❌ Migration failed. Check the error above.')
  console.error('   If "relation already exists" errors appear, migrations already ran — that\'s OK.')
  process.exit(1)
}
