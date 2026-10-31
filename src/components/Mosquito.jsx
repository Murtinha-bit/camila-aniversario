import { forwardRef, useId } from 'react'

// O desenho: mosquito de perfil, virado para a direita, em 120 × 80.
// O tórax (60, 36) é o ponto que vira o pingo do i. Usado também pelo Companheiro.
export function DesenhoMosquito() {
  const id = useId()
  const recorte = `${id}-abdome`
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={recorte}>
          <ellipse cx="32" cy="40" rx="25" ry="9.5" transform="rotate(-12 32 40)" />
        </clipPath>
      </defs>

      <g className="mosquito__asa mosquito__asa--tras">
        <ellipse cx="44" cy="18" rx="24" ry="9" transform="rotate(-22 44 18)" />
      </g>

      <g className="mosquito__pernas">
        <path d="M56 42 Q50 56 40 74" />
        <path d="M60 44 Q60 60 56 78" />
        <path d="M64 42 Q74 58 82 74" />
        <path d="M58 43 Q44 60 30 70" />
      </g>

      <g className="mosquito__silhueta">
        <ellipse cx="32" cy="40" rx="25" ry="9.5" transform="rotate(-12 32 40)" />
        <circle cx="60" cy="36" r="11" />
        <circle cx="76" cy="33" r="8" />
      </g>
      <g clipPath={`url(#${recorte})`} className="mosquito__listras">
        <rect x="12" y="20" width="6" height="40" />
        <rect x="24" y="20" width="6" height="40" />
        <rect x="36" y="20" width="6" height="40" />
      </g>

      <path className="mosquito__ferrao" d="M82 36 L110 47" />
      <path className="mosquito__antena" d="M79 27 Q86 16 94 14" />

      <circle className="mosquito__olho" cx="79" cy="31" r="4.6" />
      <circle className="mosquito__pupila" cx="80.4" cy="31" r="2.1" />

      <g className="mosquito__asa mosquito__asa--frente">
        <ellipse cx="50" cy="16" rx="27" ry="10" transform="rotate(-14 50 16)" />
      </g>
    </svg>
  )
}

// O mosquito da abertura: um botão, para dar a raquetada também pelo teclado.
const Mosquito = forwardRef(function Mosquito({ corpoRef, rotulo }, ref) {
  return (
    <button ref={ref} type="button" className="mosquito" aria-label={rotulo} hidden>
      <span ref={corpoRef} className="mosquito__corpo">
        <DesenhoMosquito />
      </span>
    </button>
  )
})

export default Mosquito
