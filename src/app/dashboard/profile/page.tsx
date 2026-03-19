import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserCircle, Building2, ShieldCheck, Mail } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, sector_id, sectors(name)')
    .eq('id', user.id)
    .single()

  // Progresso do usuário
  const { data: progress } = await supabase
    .from('progress')
    .select('content_id, completed, contents(title, type)')
    .eq('user_id', user.id)

  const completed = (progress || []).filter(p => p.completed)
  const inProgress = (progress || []).filter(p => !p.completed && p.content_id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gogrow-black">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">Suas informações e resumo de progresso</p>
      </div>

      {/* Card do perfil */}
      <div className="bg-white border rounded-2xl shadow-sm">
        <div className="p-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-gogrow-red rounded-full flex items-center justify-center shrink-0">
            <UserCircle size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gogrow-black">{profile?.name || 'Sem nome'}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="border-t grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
          <div className="p-6 flex items-center gap-4">
            <Mail className="text-gogrow-red shrink-0" size={22} />
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold mb-0.5">E-mail</p>
              <p className="font-medium text-gogrow-black truncate">{user.email}</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <Building2 className="text-gogrow-red shrink-0" size={22} />
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold mb-0.5">Setor</p>
              <p className="font-medium text-gogrow-black">{(profile?.sectors as any)?.name || 'Não definido'}</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <ShieldCheck className="text-gogrow-red shrink-0" size={22} />
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold mb-0.5">Função</p>
              <p className="font-medium text-gogrow-black capitalize">{profile?.role === 'admin' ? 'Administrador' : 'Colaborador'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de progresso */}
      <h2 className="text-xl font-bold text-gogrow-black">Resumo de Treinamentos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border rounded-2xl shadow-sm p-6 text-center">
          <div className="text-4xl font-extrabold text-gogrow-red">{(progress || []).length}</div>
          <div className="text-gray-500 mt-1 text-sm font-medium">Total disponível</div>
        </div>
        <div className="bg-white border rounded-2xl shadow-sm p-6 text-center">
          <div className="text-4xl font-extrabold text-green-600">{completed.length}</div>
          <div className="text-gray-500 mt-1 text-sm font-medium">Concluídos</div>
        </div>
        <div className="bg-white border rounded-2xl shadow-sm p-6 text-center">
          <div className="text-4xl font-extrabold text-blue-600">{inProgress.length}</div>
          <div className="text-gray-500 mt-1 text-sm font-medium">Em andamento</div>
        </div>
      </div>

      {/* Conteúdos concluídos */}
      {completed.length > 0 && (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-bold text-lg">Treinamentos Concluídos ✅</h3>
          </div>
          <ul className="divide-y">
            {completed.map((p: any) => (
              <li key={p.content_id} className="px-6 py-4 flex items-center justify-between">
                <span className="font-medium">{p.contents?.title}</span>
                <span className="text-xs uppercase bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{p.contents?.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
