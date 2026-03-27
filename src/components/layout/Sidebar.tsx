'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, Settings, UserCircle, Menu, X } from 'lucide-react'

export default function Sidebar({
  name,
  role,
}: {
  name: string
  role: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const close = () => setIsOpen(false)

  const navLink = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        onClick={close}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
          active
            ? 'bg-gogrow-red/10 text-gogrow-red'
            : 'text-gray-300 hover:bg-white/5'
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    )
  }

  const sidebar = (
    <aside className="w-64 bg-gogrow-black text-white flex flex-col h-full">
      <div className="p-6 border-b border-white/10 shrink-0 flex items-center justify-between">
        <div>
          <div className="text-2xl font-black italic">
            go<span className="text-gogrow-red">&grow</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Intranet</p>
        </div>
        {/* Fechar — só no mobile */}
        <button
          onClick={close}
          className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-gray-400"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navLink('/dashboard', <LayoutDashboard size={20} />, 'Treinamentos')}
        {navLink('/dashboard/profile', <UserCircle size={20} />, 'Meu Perfil')}
        {role === 'admin' && navLink('/admin', <Settings size={20} />, 'Painel Admin')}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="px-2 mb-3">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-gray-400 capitalize">
            {role === 'admin' ? 'Administrador' : 'Colaborador'}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-gray-300">
            <LogOut size={20} />
            <span className="font-medium text-sm">Sair</span>
          </button>
        </form>
      </div>
    </aside>
  )

  return (
    <>
      {/* Botão hambúrguer — mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gogrow-black text-white rounded-lg shadow-lg"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      {/* Overlay — mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Sidebar desktop — sempre visível */}
      <div className="hidden lg:flex fixed h-full z-30 w-64">
        {sidebar}
      </div>

      {/* Sidebar mobile — drawer deslizante */}
      <div
        className={`lg:hidden fixed h-full z-50 w-64 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>
    </>
  )
}
