import './Contador.css'

const DIGITOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// Um dígito que rola como odômetro
function Rolo({ valor }) {
  return (
    <span className="rolo">
      <span className="rolo__fita" style={{ '--valor': valor }}>
        {DIGITOS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </span>
    </span>
  )
}

// Contador fixo "07 / 23". Fica escondido na abertura e assume a cor do capítulo atual.
export default function Contador({ numero, total, visivel, cor }) {
  const texto = String(numero).padStart(2, '0')
  return (
    <div
      className={`contador${visivel ? ' contador--visivel' : ''}`}
      style={cor ? { '--contador-cor': cor } : undefined}
      aria-hidden="true"
    >
      <span className="contador__atual">
        <Rolo valor={Number(texto[0])} />
        <Rolo valor={Number(texto[1])} />
      </span>
      <span className="contador__barra">/</span>
      <span className="contador__total">{total}</span>
    </div>
  )
}
