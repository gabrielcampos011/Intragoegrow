import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProgress(contentId: string, initialUserId?: string) {
  const [position, setPosition] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const userRef = useRef<{ id: string } | null>(null)
  const supabaseRef = useRef(createClient())
  const completedRef = useRef(false)

  useEffect(() => {
    const supabase = supabaseRef.current

    async function init() {
      let userId = initialUserId

      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }
        userId = user.id
      }

      userRef.current = { id: userId }

      const { data } = await supabase
        .from('progress')
        .select('position, completed')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .maybeSingle()

      if (data) {
        setPosition(data.position || 0)
        setCompleted(data.completed || false)
        completedRef.current = data.completed || false
      }
      setLoading(false)
    }

    init()
  }, [contentId, initialUserId])

  const saveProgress = useCallback(async (newPos: number, isCompleted = false) => {
    if (!userRef.current) return
    const supabase = supabaseRef.current
    setPosition(newPos)
    if (isCompleted) {
      setCompleted(true)
      completedRef.current = true
    }

    await supabase.from('progress').upsert({
      user_id: userRef.current.id,
      content_id: contentId,
      position: newPos,
      completed: completedRef.current || isCompleted,
      updated_at: new Date().toISOString(),
    })
  }, [contentId])

  return { position, completed, loading, saveProgress }
}
