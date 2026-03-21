import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/sohala/navbar'
import { Footer } from '@/components/sohala/footer'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role ?? null
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar user={user} userRole={userRole} />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  )
}
