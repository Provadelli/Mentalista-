import { useEffect, useState } from 'react'

/** Hora atual, atualizada a cada `intervalo` ms enquanto `ativo`. */
export function useAgora(ativo = true, intervalo = 200) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    if (!ativo) return
    const t = setInterval(() => setAgora(Date.now()), intervalo)
    return () => clearInterval(t)
  }, [ativo, intervalo])
  return agora
}
