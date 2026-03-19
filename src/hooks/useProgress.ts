import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProgress(contentId: string) {
  const [position, setPosition] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const userRef = useRef<{ id: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      userRef.current = { id: user.id }

      const { data } = await supabase
        .from('progress')
        .select('position, completed')
        .eq('content_id', contentId)
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (data) {
        setPosition(data.position || 0)
        setCompleted(data.completed || false)
      }
      setLoading(false)
    }
    init()
  }, [contentId])

  const saveProgress = useCallback(async (newPos: number, isCompleted: boolean = false) => {
    if (!userRef.current) return
    setPosition(newPos)
    if (isCompleted) setCompleted(true)

    await supabase.from('progress').upsert({
      user_id: userRef.current.id,
      content_id: contentId,
      position: newPos,
      completed: completed || isCompleted,
      updated_at: new Date().toISOString()
    })
  }, [contentId, completed])

  return { position, completed, loading, saveProgress }
}
