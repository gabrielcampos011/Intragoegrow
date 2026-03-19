'use client'

import { useRef, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useProgress } from '@/hooks/useProgress'
import { CheckCircle2 } from 'lucide-react'

export default function VideoPlayer({ contentId, url, title }: { contentId: string, url: string, title: string }) {
  const { position, completed, loading, saveProgress } = useProgress(contentId)
  const playerRef = useRef<any>(null)
  
  // Track if we've seeked to the initial position
  const [hasSeeked, setHasSeeked] = useState(false)
  const lastSavedRef = useRef(position)

  const handleProgress = ({ playedSeconds, played }: { playedSeconds: number, played: number }) => {
    // Save progress every 10 seconds approx
    if (Math.abs(playedSeconds - lastSavedRef.current) > 10) {
      saveProgress(playedSeconds, false)
      lastSavedRef.current = playedSeconds
    }

    // Mark as completed if watched >= 90%
    if (played >= 0.9 && !completed) {
      saveProgress(playedSeconds, true)
    }
  }

  const handleReady = () => {
    if (!hasSeeked && position > 0 && playerRef.current) {
      playerRef.current.seekTo(position, 'seconds')
      setHasSeeked(true)
    }
  }

  const handleMarkAsCompleted = () => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    saveProgress(currentTime, true);
  };

  if (loading) return <div>Carregando progresso...</div>

  const Player = ReactPlayer as any;

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-black/5 rounded-xl border p-4 shadow-sm relative overflow-hidden">
      
      {completed ? (
        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 flex items-center gap-2 rounded-full font-medium shadow-lg">
          <CheckCircle2 size={16} />
          <span>Concluído</span>
        </div>
      ) : (
        <button 
          onClick={handleMarkAsCompleted} 
          className="absolute top-4 right-4 z-10 bg-green-500 hover:bg-green-600 text-white px-3 py-1 flex items-center gap-2 rounded-full font-medium shadow-lg transition-colors text-sm"
        >
          <CheckCircle2 size={16} />
          <span>Marcar como concluído</span>
        </button>
      )}

      <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative border-4 border-gogrow-gray-dark">
        <Player
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          controls={true}
          onProgress={handleProgress}
          onReady={handleReady}
          playing={false}
          config={{
            youtube: {
              playerVars: { showinfo: 1 }
            }
          }}
        />
      </div>
    </div>
  )
}
