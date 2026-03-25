'use client'

import { useProgress } from '@/hooks/useProgress'
import { CheckCircle2, ExternalLink } from 'lucide-react'

export default function LinkViewer({ contentId, url, title }: { contentId: string, url: string, title: string }) {
  const { completed, loading, saveProgress } = useProgress(contentId)

  const handleOpenLink = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleMarkAsCompleted = () => {
    saveProgress(0, true)
  }

  if (loading) return <div>Carregando progresso...</div>

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

      <div className="w-full max-w-3xl flex flex-col items-center justify-center gap-6 py-16">
        <ExternalLink size={64} className="text-gogrow-red/40" />
        <h2 className="text-xl font-bold text-gogrow-black text-center">{title}</h2>
        <p className="text-gray-500 text-center text-sm max-w-md">
          Este treinamento é um link externo. Clique no botão abaixo para abrir o conteúdo em uma nova aba.
        </p>
        <button
          onClick={handleOpenLink}
          className="px-8 py-3 bg-gogrow-red text-white font-bold rounded-lg hover:bg-gogrow-red-hover transition-colors flex items-center gap-2 text-lg shadow-md"
        >
          <ExternalLink size={20} />
          Abrir Link
        </button>
        <span className="text-xs text-gray-400 break-all text-center max-w-md">{url}</span>
      </div>
    </div>
  )
}
