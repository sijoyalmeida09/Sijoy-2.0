import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProviderSidebar } from '@/components/sohala/sidebar'

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/provider/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-primary">
      <ProviderSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
