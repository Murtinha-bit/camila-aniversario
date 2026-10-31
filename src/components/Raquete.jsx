import { forwardRef, useId } from 'react'

// Raquete elétrica que substitui o cursor na abertura (só com mouse).
const Raquete = forwardRef(function Raquete(_props, ref) {
  const id = useId()
  const tela = `${id}-tela`
  return (
    <div ref={ref} className="raquete" aria-hidden="true">
      <svg viewBox="0 0 100 160" focusable="false">
        <defs>
          <clipPath id={tela}>
            <rect x="14" y="8" width="72" height="88" rx="26" />
          </clipPath>
        </defs>
        <rect className="raquete__fundo" x="14" y="8" width="72" height="88" rx="26" />
        <g className="raquete__tela" clipPath={`url(#${tela})`}>
          {[22, 32, 42, 52, 62, 72].map((x) => (
            <path key={`v${x}`} d={`M${x + 3} 0 V110`} />
          ))}
          {[18, 28, 38, 48, 58, 68, 78, 88].map((y) => (
            <path key={`h${y}`} d={`M0 ${y} H100`} />
          ))}
        </g>
        <rect className="raquete__aro" x="14" y="8" width="72" height="88" rx="26" />
        <rect className="raquete__pescoco" x="44" y="98" width="12" height="14" />
        <rect className="raquete__cabo" x="38" y="110" width="24" height="46" rx="10" />
        <circle className="raquete__botao" cx="50" cy="124" r="4.5" />
      </svg>
    </div>
  )
})

export default Raquete
