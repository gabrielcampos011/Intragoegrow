import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import VideoPlayer from '@/components/player/VideoPlayer'
import PdfViewer from '@/components/player/PdfViewer'
import LinkViewer from '@/components/player/LinkViewer'
import { normalizeRole } from '@/lib/role'
import { getAuthUser, getProfile } from '@/lib/supabase/auth'

export default async function TreinamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const role = normalizeRole(profile?.role)

  const supabase = await createClient()
  let contentQuery = supabase
    .from('contents')
    .select('*')
    .eq('id', id)

  if (role !== 'admin') {
    if (profile?.sector_id) {
      contentQuery = contentQuery.or(`sector_id.is.null,sector_id.eq.${profile.sector_id}`)
    } else {
      contentQuery = contentQuery.is('sector_id', null)
    }
  }

  const { data: content, error } = await contentQuery.single()

  if (error || !content) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Conteúdo não encontrado ou sem permissão.</h2>
        <Link href="/dashboard" className="text-gogrow-red hover:underline mt-4 inline-block">
          Voltar para o Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gogrow-gray-light flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center px-6 shadow-sm shrink-0 sticky top-0 z-20">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-gray-500 hover:text-gogrow-red transition-colors font-medium mr-6"
        >
          <ArrowLeft size={20} />
          Voltar
        </Link>
        <div className="w-px h-6 bg-gray-200 mr-6"></div>
        <h1 className="text-lg font-bold text-gogrow-black truncate">
          {content.title}
        </h1>
      </header>

      {/* Meta: descrição + duração + prazo */}
      {(content.description || content.duration_minutes || content.due_date) && (
        <div className="bg-white border-b px-6 py-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {content.description && (
            <p className="flex-1 min-w-0 truncate">{content.description}</p>
          )}
          <div className="flex items-center gap-4 shrink-0 ml-auto">
            {content.duration_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gogrow-red" />
                {content.duration_minutes} min
              </span>
            )}
            {content.due_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gogrow-red" />
                Prazo: {new Date(content.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Viewer */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        {content.type === 'video' ? (
          <VideoPlayer contentId={content.id} url={content.url} title={content.title} userId={user.id} />
        ) : content.type === 'link' ? (
          <LinkViewer contentId={content.id} url={content.url} title={content.title} userId={user.id} />
        ) : (
          <PdfViewer contentId={content.id} url={content.url} userId={user.id} />
        )}
      </main>
    </div>
  )
}
