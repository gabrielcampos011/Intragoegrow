import { redirect } from 'next/navigation'
import { normalizeRole } from '@/lib/role'
import { getAuthUser, getProfile } from '@/lib/supabase/auth'
import Sidebar from '@/components/layout/Sidebar'
import DashboardHeader from '@/components/layout/DashboardHeader'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const role = normalizeRole(profile?.role)

  return (
    <div className="min-h-screen bg-gogrow-gray-light flex">
      <Sidebar name={profile?.name || ''} role={role} />

      <main className="flex-1 min-h-screen flex flex-col lg:ml-64">
        <DashboardHeader />

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
