import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { normalizeRole } from '@/lib/role'

export default async function AdminPage() {
  const supabase = await createClient()

  // Buscar todos os usuários
  const { data: usersRaw } = await supabase
    .from('profiles')
    .select(`
      id, name, role, sector_id,
      sectors(id, name)
    `)

  const users = (usersRaw || []).filter((u: any) => normalizeRole(u.role) !== 'admin')

  // Buscar progresso
  const { data: progress } = await supabase
    .from('progress')
    .select(`
      user_id, content_id, completed, position,
      contents(title, type)
    `)

  // Buscar conteúdos
  const { data: contents } = await supabase
    .from('contents')
    .select(`
      id, title, type, url, sector_id, created_at,
      sectors(name)
    `)
    
  // Buscar setores
  const { data: sectors } = await supabase
    .from('sectors')
    .select('*')

  return (
    <div className="space-y-8">
      <AdminDashboard 
        users={users || []} 
        progress={progress || []}
        contents={contents || []}
        sectors={sectors || []}
      />
    </div>
  )
}
