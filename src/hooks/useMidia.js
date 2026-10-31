import { useSyncExternalStore } from 'react'

// Acompanha uma media query, por exemplo '(prefers-reduced-motion: reduce)'.
export function useMidia(consulta) {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(consulta)
      mq.addEventListener('change', avisar)
      return () => mq.removeEventListener('change', avisar)
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}

export const useMovimentoReduzido = () => useMidia('(prefers-reduced-motion: reduce)')
export const useComMouse = () => useMidia('(hover: hover) and (pointer: fine)')
