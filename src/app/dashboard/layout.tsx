import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, LayoutDashboard, Settings, UserCircle } from 'lucide-react'
import { normalizeRole } from '@/lib/role'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  const role = normalizeRole(profile?.role)

  return (
    <div className="min-h-screen bg-gogrow-gray-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gogrow-black text-white flex-shrink-0 flex flex-col fixed h-full z-10 transition-transform">
        <div className="p-6 border-b border-white/10 shrink-0">
          <div className="text-2xl font-black italic">
            go<span className="text-gogrow-red">&grow</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Intranet</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gogrow-red/10 text-gogrow-red transition-colors"
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Treinamentos</span>
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300"
          >
            <UserCircle size={20} />
            <span className="font-medium">Meu Perfil</span>
          </Link>

          {role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300"
            >
              <Settings size={20} />
              <span className="font-medium">Painel Admin</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex flex-col">
              <span className="font-medium text-sm">{profile?.name}</span>
              <span className="text-xs text-gray-400 capitalize">
                {role === 'admin' ? 'Administrador' : 'Colaborador'}
              </span>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-gray-300">
              <LogOut size={20} />
              <span className="font-medium text-sm">Sair</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm shrink-0 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gogrow-black">Portal do Colaborador</h1>
        </header>

        {/* Content area */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
