import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getProfile } from '@/lib/supabase/auth'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { ContentItem, ProgressItem } from '@/hooks/useContents'

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // Profile e progress rodam em paralelo — ambos precisam apenas de user.id
  const [profile, progressResult] = await Promise.all([
    getProfile(user.id),
    supabase
      .from('progress')
      .select('content_id, position, completed')
      .eq('user_id', user.id),
  ])

  const sectorId = profile?.sector_id ?? null

  // Contents só precisa do sectorId (do profile), mas profile já resolveu acima
  const buildContentsQuery = (cols: string) => {
    const q = supabase
      .from('contents')
      .select(cols)
      .order('created_at', { ascending: false })

    return sectorId
      ? q.or(`sector_id.is.null,sector_id.eq.${sectorId}`)
      : q.is('sector_id', null)
  }

  const contentsResult = await buildContentsQuery(
    'id, title, type, url, cover_url, description, due_date, duration_minutes, sector_id, sectors(name)'
  )

  let contentsRaw = contentsResult.data

  if (contentsResult.error) {
    console.error('[Dashboard] Erro ao buscar conteúdos:', contentsResult.error.message)
    if (contentsResult.error.code === '42703') {
      console.warn('[Dashboard] Colunas ausentes. Execute no Supabase SQL Editor:\n  NOTIFY pgrst, \'reload schema\';\n  -- ou adicione as colunas: ALTER TABLE contents ADD COLUMN IF NOT EXISTS description text, ADD COLUMN IF NOT EXISTS due_date date, ADD COLUMN IF NOT EXISTS duration_minutes integer;')
      const fallback = await buildContentsQuery(
        'id, title, type, url, cover_url, sector_id, sectors(name)'
      )
      contentsRaw = fallback.data
    }
  }

  const progressMap: Record<string, ProgressItem> = {}
  ;(progressResult.data || []).forEach(p => { progressMap[p.content_id] = p })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gogrow-black mb-6">Seus Treinamentos</h2>
      <DashboardClient
        userId={user.id}
        initialContents={(contentsRaw as ContentItem[]) || []}
        initialProgress={progressMap}
      />
    </div>
  )
}
