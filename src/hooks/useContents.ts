import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ContentItem = {
  id: string
  title: string
  type: string
  url: string
  cover_url: string | null
  description: string | null
  due_date: string | null
  duration_minutes: number | null
  sector_id: string | null
  sectors?: { name: string } | null
}

export type ProgressItem = {
  content_id: string
  position: number | null
  completed: boolean | null
}

export function useContents(userSectorId: string | null) {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [progress, setProgress] = useState<Record<string, ProgressItem>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContents() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      const baseQuery = supabase
        .from('contents')
        .select(`id, title, type, url, cover_url, description, due_date, duration_minutes, sector_id, sectors(name)`)

      const filteredQuery = userSectorId
        ? baseQuery.or(`sector_id.is.null,sector_id.eq.${userSectorId}`)
        : baseQuery.is('sector_id', null)

      const { data: contentsData, error: contentsError } = await filteredQuery
    
      // Progresso do usuário logado (evita depender apenas de RLS)
      const { data: progressData } = user
        ? await supabase
          .from('progress')
          .select('content_id, position, completed')
          .eq('user_id', user.id)
        : { data: [] }

      if (!contentsError && contentsData) {
        setContents(contentsData as any)
      }

      if (progressData) {
        const progMap: Record<string, ProgressItem> = {}
        progressData.forEach(p => {
          progMap[p.content_id] = p
        })
        setProgress(progMap)
      }

      setLoading(false)
    }

    fetchContents()
  }, [userSectorId])

  return { contents, progress, loading }
}
