'use client'

import { useContents } from '@/hooks/useContents'
import Link from 'next/link'
import { Play, FileText, CheckCircle } from 'lucide-react'

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

  return (
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
                    className={`h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gogrow-red'}`} 
                    style={{ width: isCompleted ? '100%' : (prog?.position ? '50%' : '0%') }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {isCompleted ? 'Concluído' : (prog?.position ? 'Em andamento' : 'Não iniciado')}
                </div>
              </div>

            </div>
          </Link>
        )
      })}
    </div>
  )
}
