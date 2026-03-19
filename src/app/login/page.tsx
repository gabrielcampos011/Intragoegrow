import { login } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  return (
    <div className="flex min-h-screen bg-black-gradient text-white flex-col relative items-center justify-center p-4">
      {/* Decorative red elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-red-gradient"></div>
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gogrow-red opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-gogrow-red opacity-10 blur-3xl"></div>

      <div className="z-10 w-full max-w-md bg-gogrow-gray-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-8">
        
        <div className="flex justify-center mb-8">
          <div className="text-4xl font-black text-white italic origin-bottom -rotate-2">
            go<span className="text-gogrow-red">&grow</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Bem-vindo(a) à Intranet</h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Acesse os treinamentos e materiais da equipe
        </p>

        <form action={login} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@goegrow.com.br"
              className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-gogrow-red focus:ring-1 focus:ring-gogrow-red text-white placeholder-gray-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-gogrow-red focus:ring-1 focus:ring-gogrow-red text-white placeholder-gray-500 transition-colors"
            />
          </div>

          {params?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-500 text-center">
                {params.message || 'Credenciais inválidas. Tente novamente.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gogrow-red hover:bg-gogrow-red-hover text-white font-bold rounded-lg shadow-lg hover:shadow-gogrow-red/20 transition-all active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm text-gray-400">
          <p>
            Novo por aqui?{' '}
            <Link href="/signup" className="text-white hover:text-gogrow-red hover:underline font-bold transition-colors">
              Crie sua conta
            </Link>
          </p>
          <div className="text-xs text-gray-500">
            <p>© 2026 GO&GROW • TODOS OS DIREITOS RESERVADOS</p>
          </div>
        </div>
      </div>
    </div>
  )
}
