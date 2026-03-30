import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { normalizeRole } from '@/lib/role'
import { getAuthUser, getProfile } from '@/lib/supabase/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const role = normalizeRole(profile?.role)

  if (role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gogrow-gray-light flex">
      <Sidebar name={profile?.name || ''} role={role} />

      <main className="flex-1 min-h-screen flex flex-col lg:ml-64">
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm shrink-0 sticky top-0 z-20">
          <div className="lg:hidden w-10 shrink-0" />
          <h1 className="text-xl font-bold text-gogrow-black flex items-center gap-2">
            <Settings className="text-gogrow-red" size={22} />
            Administração da Plataforma
          </h1>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
