'use client'

import { useContents } from '@/hooks/useContents'
import Link from 'next/link'
import { Play, FileText, CheckCircle, BookOpen } from 'lucide-react'

export default function DashboardClient({ userSectorId }: { userSectorId: string | null }) {
  const { contents, progress, loading } = useContents(userSectorId)

  if (loading) {
    return <div className="text-gray-500 animate-pulse">Carregando treinamentos...</div>
  }

  if (contents.length === 0) {
    return (
      <div className="bg-white p-8 border rounded-xl text-center text-gray-500">
        Nenhum treinamento disponível no momento.
      </div>
    )
  }

  const completed = contents.filter(c => progress[c.id]?.completed).length
  const inProgress = contents.filter(c => progress[c.id] && !progress[c.id]?.completed).length

  return (
    <div className="space-y-6">
    {/* Summary bar */}
    <div className="flex flex-wrap gap-4 items-center bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle size={16} className="text-green-500" />
        <span className="font-semibold text-gogrow-black">{completed}</span>
        <span className="text-gray-500">concluídos</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <BookOpen size={16} className="text-gogrow-red" />
        <span className="font-semibold text-gogrow-black">{inProgress}</span>
        <span className="text-gray-500">em andamento</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
        {contents.length} treinamento{contents.length !== 1 ? 's' : ''} no total
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {contents.map((item) => {
        const prog = progress[item.id]
        const isCompleted = prog?.completed

        return (
          <Link href={`/treinamento/${item.id}`} key={item.id} className="block group">
            <div className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-gogrow-red/50 relative h-full flex flex-col">
              
              <div className="h-32 bg-gogrow-gray-light flex items-center justify-center relative overflow-hidden group-hover:bg-gogrow-red/5 transition-colors">
                {item.type === 'video' ? (
                  <Play size={40} className="text-gogrow-red/40 group-hover:text-gogrow-red transition-colors" />
                ) : (
                  <FileText size={40} className="text-gogrow-red/40 group-hover:text-gogrow-red transition-colors" />
                )}
                {isCompleted && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow-md">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs font-semibold text-gogrow-red uppercase tracking-wider mb-1">
                  {item.sectors?.name ? item.sectors.name : 'Global'} • {item.type === 'video' ? 'Vídeo' : 'PDF'}
                </div>
                <h3 className="font-bold text-gogrow-black line-clamp-2 mb-4 flex-1">
                  {item.title}
                </h3>
                
                {/* Progress Bar Display */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : prog?.position ? 'bg-gogrow-red animate-pulse' : 'bg-gray-300'}`} 
                    style={{ width: isCompleted ? '100%' : (prog?.position ? '55%' : '0%') }}
                  ></div>
                </div>
                <div className="text-right text-xs font-medium">
                  {isCompleted 
                    ? <span className="text-green-600">✓ Concluído</span>
                    : prog?.position 
                      ? <span className="text-gogrow-red">Em andamento</span>
                      : <span className="text-gray-400">Não iniciado</span>
                  }
                </div>
              </div>

            </div>
          </Link>
        )
      })}
    </div>
    </div>
  )
}
