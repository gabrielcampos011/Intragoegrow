import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ContentItem = {
  id: string
  title: string
  type: string
  url: string
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
      
      const query = supabase
        .from('contents')
        .select(`id, title, type, url, sector_id, sectors(name)`)
      
      if (userSectorId) {
        query.or(`sector_id.is.null,sector_id.eq.${userSectorId}`)
      } else {
        query.is('sector_id', null)
      }

      const { data: contentsData, error: contentsError } = await query
      
      const { data: progressData } = await supabase
        .from('progress')
        .select('content_id, position, completed')

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
