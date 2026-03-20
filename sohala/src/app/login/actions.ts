'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginWithEmail(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/discover')
}

export async function loginWithMagicLink(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const redirectTo = formData.get('redirectTo') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=${redirectTo ?? '/discover'}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signupWithEmail(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = (formData.get('role') as string) ?? 'client'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile record
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    })
  }

  return { success: true }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
