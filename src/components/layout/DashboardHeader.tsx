'use client'
'use no memo'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/dashboard': 'Treinamentos',
  '/dashboard/profile': 'Meu Perfil',
}

export default function DashboardHeader() {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'Portal do Colaborador'

  return (
    <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm shrink-0 sticky top-0 z-20">
      <div className="lg:hidden w-10 shrink-0" />
      <h1 className="text-xl font-bold text-gogrow-black">{title}</h1>
    </header>
  )
}
