'use client'

import { useState, useMemo } from 'react'
import type { ContentItem, ProgressItem } from '@/hooks/useContents'
import Link from 'next/link'
import { Play, FileText, ExternalLink, CheckCircle, BookOpen, Search, Clock, AlertTriangle } from 'lucide-react'

type Filter = 'all' | 'pending' | 'in_progress' | 'completed'

function getDueDateBadge(dueDate: string | null, completed: boolean | null) {
  if (!dueDate || completed) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Prazo vencido', className: 'bg-red-600 text-white' }
  if (diffDays <= 3) return { label: `Vence em ${diffDays}d`, className: 'bg-red-500 text-white' }
  if (diffDays <= 7) return { label: `Vence em ${diffDays}d`, className: 'bg-yellow-500 text-white' }
  return { label: `Prazo: ${due.toLocaleDateString('pt-BR')}`, className: 'bg-gray-200 text-gray-700' }
}

export default function DashboardClient({
  userId,
  initialContents,
  initialProgress,
}: {
  userId: string
  initialContents: ContentItem[]
  initialProgress: Record<string, ProgressItem>
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    let list = initialContents

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.title.toLowerCase().includes(q))
    }

    if (filter === 'completed') list = list.filter(c => initialProgress[c.id]?.completed)
    if (filter === 'in_progress') list = list.filter(c => initialProgress[c.id] && !initialProgress[c.id]?.completed)
    if (filter === 'pending') list = list.filter(c => !initialProgress[c.id])

    return list
  }, [initialContents, initialProgress, search, filter])

  const completedCount = initialContents.filter(c => initialProgress[c.id]?.completed).length
  const inProgressCount = initialContents.filter(c => initialProgress[c.id] && !initialProgress[c.id]?.completed).length
  const totalCount = initialContents.length

  const filterOptions: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: totalCount },
    { key: 'pending', label: 'Não iniciados', count: totalCount - completedCount - inProgressCount },
    { key: 'in_progress', label: 'Em andamento', count: inProgressCount },
    { key: 'completed', label: 'Concluídos', count: completedCount },
  ]

  if (initialContents.length === 0) {
    return (
      <div className="bg-white p-8 border rounded-xl text-center text-gray-500">
        Nenhum treinamento disponível no momento.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Barra de resumo */}
      <div className="flex flex-wrap gap-4 items-center bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle size={16} className="text-green-500" />
          <span className="font-semibold text-gogrow-black">{completedCount}</span>
          <span className="text-gray-500">concluídos</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen size={16} className="text-gogrow-red" />
          <span className="font-semibold text-gogrow-black">{inProgressCount}</span>
          <span className="text-gray-500">em andamento</span>
        </div>
        <div className="text-sm text-gray-400 ml-auto">
          {totalCount} treinamento{totalCount !== 1 ? 's' : ''} no total
        </div>
      </div>

      {/* Busca + Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar treinamento..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none bg-white"
          />
        </div>
        <div className="flex gap-1 bg-white border rounded-lg p-1 overflow-x-auto">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === opt.key
                  ? 'bg-gogrow-red text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {opt.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === opt.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div className="bg-white p-8 border rounded-xl text-center text-gray-400 text-sm">
          Nenhum treinamento encontrado com esses filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => {
            const prog = initialProgress[item.id]
            const isCompleted = prog?.completed
            const dueBadge = getDueDateBadge(item.due_date, isCompleted ?? null)

            return (
              <Link href={`/treinamento/${item.id}`} key={item.id} className="block group">
                <div className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-gogrow-red/50 relative h-full flex flex-col">

                  {/* Capa / ícone */}
                  <div className="h-36 bg-gogrow-gray-light flex items-center justify-center relative overflow-hidden group-hover:bg-gogrow-red/5 transition-colors shrink-0">
                    {item.cover_url ? (
                      <img
                        src={item.cover_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : item.type === 'video' ? (
                      <Play size={40} className="text-gogrow-red/40 group-hover:text-gogrow-red transition-colors" />
                    ) : item.type === 'link' ? (
                      <ExternalLink size={40} className="text-gogrow-red/40 group-hover:text-gogrow-red transition-colors" />
                    ) : (
                      <FileText size={40} className="text-gogrow-red/40 group-hover:text-gogrow-red transition-colors" />
                    )}

                    {isCompleted && (
                      <div className="absolute top-2.5 right-2.5 bg-green-500 text-white p-1 rounded-full shadow-md">
                        <CheckCircle size={15} />
                      </div>
                    )}

                    {dueBadge && (
                      <div className={`absolute bottom-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${dueBadge.className}`}>
                        <AlertTriangle size={11} />
                        {dueBadge.label}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-1.5">
                    <div className="text-xs font-semibold text-gogrow-red uppercase tracking-wider flex items-center gap-1.5">
                      {item.sectors?.name ?? 'Global'}
                      <span className="text-gray-400">·</span>
                      {item.type === 'video' ? 'Vídeo' : item.type === 'link' ? 'Link' : 'PDF'}
                      {item.duration_minutes && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="flex items-center gap-0.5 text-gray-400 font-normal normal-case tracking-normal">
                            <Clock size={10} />{item.duration_minutes}min
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-gogrow-black line-clamp-2 flex-1">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    )}

                    {/* Barra de progresso */}
                    <div className="mt-auto pt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : prog?.position ? 'bg-gogrow-red' : 'bg-gray-300'}`}
                          style={{
                            width: isCompleted
                              ? '100%'
                              : prog?.position && item.type === 'video' && item.duration_minutes
                                ? `${Math.min(Math.round((prog.position / (item.duration_minutes * 60)) * 100), 99)}%`
                                : prog?.position
                                  ? '30%'
                                  : '0%'
                          }}
                        />
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
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
