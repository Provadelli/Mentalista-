import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = url && chave ? createClient(url, chave) : null

export const canalDaSala = (sala: string) => `sala:${sala}`

/** playerId estável neste aparelho, para reconexão. */
export function obterPlayerId(): string {
  const chaveLocal = 'mentalista:playerId'
  try {
    const salvo = localStorage.getItem(chaveLocal)
    if (salvo) return salvo
    const novo = crypto.randomUUID()
    localStorage.setItem(chaveLocal, novo)
    return novo
  } catch {
    return crypto.randomUUID()
  }
}
