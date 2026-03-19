import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('sector_id')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gogrow-black mb-6">Seus Treinamentos</h2>
      <DashboardClient userSectorId={profile?.sector_id || null} />
    </div>
  )
}
