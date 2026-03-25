export type AppRole = 'admin' | 'user'

/**
 * Normaliza o campo `profiles.role` para comparação consistente.
 * O bug reportado (admin no banco -> "Colaborador" na UI) geralmente acontece
 * por diferenças de capitalização/espaços ou valores inesperados.
 */
export function normalizeRole(role: unknown): AppRole {
  const raw = typeof role === 'string' ? role : ''
  const r = raw.trim().toLowerCase()

  // Suporta variações comuns (PT/EN) e capitalização diferente.
  if (r === 'admin' || r === 'administrator' || r === 'administrador') return 'admin'
  if (r === 'user' || r === 'colaborador') return 'user'
  return 'user'
}

