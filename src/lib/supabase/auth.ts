import { cache } from 'react'
import { createClient } from './server'

/**
 * Lê o usuário do cookie de sessão (sem chamada de rede).
 *
 * Seguro porque o middleware chama getUser() em todo request e renova
 * o token antes que qualquer Server Component execute. Após o middleware
 * rodar, a sessão no cookie é confiável dentro do mesmo ciclo de request.
 *
 * React.cache() garante que ambas as chamadas (layout + page) compartilhem
 * o mesmo resultado sem executar duas vezes.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
})

/**
 * Busca o perfil do usuário. Cacheado por request via React.cache(),
 * então layout e page compartilham o mesmo fetch.
 */
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, role, sector_id, sectors(name)')
    .eq('id', userId)
    .single()
  return data
})
