import { useRef, useState } from 'react'
import Abertura from './components/Abertura.jsx'
import Companheiro from './components/Companheiro.jsx'
import Contador from './components/Contador.jsx'
import Final from './components/Final.jsx'
import Pessoa from './components/Pessoa.jsx'
import Surpresa from './components/Surpresa.jsx'
import { campoDe } from './data/campos.js'
import { aniversariante, pessoas } from './data/conteudo.js'
import { montarCapitulos } from './data/layouts.js'
import { useMovimentoReduzido } from './hooks/useMidia.js'
import { ENTRADAS, useCapitulos } from './motion/capitulos.js'
import { useScrollSuave } from './motion/scroll.js'

// Os 22 capítulos, com layout escolhido; depois deles, o final (pessoa 23) e a surpresa (24 / 23).
const CAPITULOS = montarCapitulos(pessoas)

export default function App() {
  const reduzido = useMovimentoReduzido()
  const mainRef = useRef(null)
  const [atual, setAtual] = useState({ numero: 0, cor: null, oculto: false })

  useScrollSuave(reduzido)
  useCapitulos(mainRef, { reduzido, aoMudar: setAtual })

  return (
    <>
      <main ref={mainRef}>
        <Abertura />
        {CAPITULOS.map((capitulo, i) => (
          <Pessoa
            key={`${i}-${capitulo.pessoa.nome}`}
            {...capitulo}
            numero={i + 1}
            campo={campoDe(i)}
            entrada={ENTRADAS[i % ENTRADAS.length]}
          />
        ))}
        <Final numero={CAPITULOS.length + 1} />
        <Surpresa numero={CAPITULOS.length + 2} />
      </main>
      <Contador
        numero={Math.max(1, atual.numero)}
        total={aniversariante.idade}
        visivel={atual.numero > 0 && !atual.oculto}
        cor={atual.cor}
      />
      <Companheiro mainRef={mainRef} reduzido={reduzido} />
    </>
  )
}
