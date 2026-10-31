import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { aniversariante, abertura } from '../data/conteudo.js'
import { useComMouse, useMovimentoReduzido } from '../hooks/useMidia.js'
import { prepararQueda, soltar } from '../motion/queda.js'
import { criarVoo } from '../motion/voo.js'
import { medirPingo } from '../motion/pingo.js'
import Mosquito from './Mosquito.jsx'
import Raquete from './Raquete.jsx'
import './Abertura.css'

const FAMILIA = '"Schibsted Grotesk"'

// Ordem de chegada das letras: embaralhada, mas sempre a mesma
const ORDEM = [2, 0, 4, 1, 5, 3, 6, 7, 8, 9, 10, 11]

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

export default function Abertura() {
  const reduzido = useMovimentoReduzido()
  const comMouse = useComMouse()

  const palcoRef = useRef(null)
  const tituloRef = useRef(null)
  const letraIRef = useRef(null)
  const sondaRef = useRef(null)
  const mosquitoRef = useRef(null)
  const corpoRef = useRef(null)
  const raqueteRef = useRef(null)
  const faiscaRef = useRef(null)

  const [caiu, setCaiu] = useState(false)
  const [dica, setDica] = useState(false)
  const [fala, setFala] = useState('')

  // O primeiro "i" do nome vira "ı" (sem pingo): o mosquito é o pingo.
  // Se o nome não tiver "i", o mosquito pousa em cima da última letra.
  const indiceI = aniversariante.nome.indexOf('i')
  const temI = indiceI >= 0
  const letras = [...aniversariante.nome].map((ch, i) => (i === indiceI ? 'ı' : ch))
  const indicePouso = temI ? indiceI : letras.length - 1
  const digitos = [...String(aniversariante.idade)]

  useLayoutEffect(() => {
    if (!reduzido) palcoRef.current.classList.add('abertura--armada')
  }, [reduzido])

  useEffect(() => {
    const palco = palcoRef.current
    const corpos = [...palco.querySelectorAll('[data-corpo]')]
    let cancelado = false
    let queda
    let desmontarVoo

    // tamanho da fonte guardado; só muda quando a janela muda
    let tamanho = 0
    const medirTamanho = () => {
      tamanho = parseFloat(getComputedStyle(letraIRef.current).fontSize)
    }

    const obterPingo = () => {
      const letra = letraIRef.current
      const sonda = sondaRef.current
      if (!letra || !sonda) return null
      if (!tamanho) medirTamanho()
      const m = medirPingo(FAMILIA, 800, tamanho)
      const rl = letra.getBoundingClientRect()
      const rs = sonda.getBoundingClientRect()
      const rp = palco.getBoundingClientRect()
      if (!temI) return { x: rl.left + rl.width / 2 - rp.left, y: rl.top - tamanho * 0.08 - rp.top }
      return { x: rl.left + m.avanco / 2 + m.dx - rp.left, y: rs.top + m.dy - rp.top }
    }

    const tremer = (forca) => {
      const a = Math.min(10, 3 + forca * 1.5)
      gsap.fromTo(
        tituloRef.current,
        { x: 0 },
        { keyframes: { x: [-a, a * 0.8, -a * 0.5, a * 0.25, 0] }, duration: 0.32, ease: 'none' },
      )
    }

    Promise.race([document.fonts.load(`800 100px ${FAMILIA}`), esperar(2500)]).then(() => {
      if (cancelado) return
      if (reduzido) {
        setCaiu(true)
      } else {
        const estados = prepararQueda(
          corpos.map((el) => ({ el, peso: Number(el.dataset.peso), atraso: Number(el.dataset.atraso) })),
        )
        palco.classList.remove('abertura--armada')
        queda = soltar(estados, { aoImpactoPesado: tremer })
        queda.terminou.then(() => !cancelado && setCaiu(true))
      }

      desmontarVoo = criarVoo({
        palco,
        mosquito: mosquitoRef.current,
        corpo: corpoRef.current,
        raquete: raqueteRef.current,
        faisca: faiscaRef.current,
        obterPingo,
        reduzido,
        comMouse,
        atraso: 1.3,
        aoPousar: () => setDica(true),
        aoAcertar: (n) => {
          setFala(abertura.falasDoMosquito[Math.min(n, abertura.falasDoMosquito.length) - 1])
          // se ela acertar antes de ele pousar pela primeira vez, a dica ainda está escondida
          setDica(true)
        },
        aoRedimensionarPalco: medirTamanho,
      })
    })

    return () => {
      cancelado = true
      queda?.cancelar()
      desmontarVoo?.()
      corpos.forEach((el) => {
        el.style.transform = ''
      })
    }
  }, [reduzido, comMouse, temI])

  // Saída: com o scroll, as letras sobem cada uma no seu ritmo
  useEffect(() => {
    if (reduzido) return
    const palco = palcoRef.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: palco, start: 'top top', end: 'bottom top', scrub: true },
      })
      // a cortina do próximo capítulo empurra as letras para cima, cada uma num ritmo
      const altura = () => window.innerHeight
      gsap.utils.toArray('.palavra--nome .letra', palco).forEach((el, i) => {
        tl.to(el, { y: () => -altura() * (0.98 + ((i * 3) % 5) * 0.08), rotation: ((i * 5) % 7) - 3, ease: 'none' }, 0)
      })
      gsap.utils.toArray('.palavra--idade .letra', palco).forEach((el, i) => {
        tl.to(el, { y: () => -altura() * (1.02 + i * 0.07), rotation: i ? 4 : -3, ease: 'none' }, 0)
      })
      // a frase e a dica saem antes, para as letras não passarem por cima delas
      tl.to('.abertura__topo', { y: () => -altura() * 0.6, ease: 'none' }, 0)
    }, palco)
    return () => ctx.revert()
  }, [reduzido])

  const textoDica = fala || (comMouse ? abertura.dicaComMouse : abertura.dicaComToque)
  const classes = [
    'abertura',
    comMouse && 'abertura--com-mouse',
    caiu && 'abertura--caiu',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={palcoRef}
      className={classes}
      aria-labelledby="titulo-abertura"
      style={{ '--letras': letras.length }}
    >
      <div className="abertura__topo">
        <p className="abertura__frase">{abertura.frase}</p>
        <p className={`abertura__dica${dica ? ' abertura__dica--visivel' : ''}`} aria-live="polite">
          {textoDica}
        </p>
      </div>

      <h1 ref={tituloRef} id="titulo-abertura" className="abertura__titulo" translate="no">
        <span className="so-leitor">
          {aniversariante.nome}, {aniversariante.idade} anos
        </span>
        <span className="palavra palavra--nome" aria-hidden="true">
          {letras.map((ch, i) => (
            <span key={i} className="letra" ref={i === indicePouso ? letraIRef : undefined}>
              <span
                className="letra__corpo"
                data-corpo
                data-peso="1"
                data-atraso={0.12 + (ORDEM[i] ?? i) * 0.075}
              >
                {ch}
              </span>
              {i === indicePouso && <span ref={sondaRef} className="sonda" />}
            </span>
          ))}
        </span>
        <span className="palavra palavra--idade" aria-hidden="true">
          {digitos.map((ch, i) => (
            <span key={i} className="letra">
              <span
                className="letra__corpo"
                data-corpo
                data-peso="2"
                data-atraso={0.12 + letras.length * 0.075 + 0.3 + i * 0.16}
              >
                {ch}
              </span>
            </span>
          ))}
        </span>
      </h1>

      <div className="abertura__rodape" aria-hidden={!caiu}>
        <p className="rolar">
          {abertura.rolar}
          <svg className="rolar__seta" viewBox="0 0 16 20" aria-hidden="true" focusable="false">
            <path d="M8 2 V17 M2 11 L8 17 L14 11" />
          </svg>
        </p>
      </div>

      <Mosquito ref={mosquitoRef} corpoRef={corpoRef} rotulo="Acertar o mosquito com a raquete" />

      <svg ref={faiscaRef} className="faisca" viewBox="-80 -80 160 160" aria-hidden="true" focusable="false">
        {Array.from({ length: 10 }, (_, i) => {
          const ang = (i / 10) * Math.PI * 2
          const r1 = i % 2 ? 30 : 38
          const r2 = i % 2 ? 56 : 72
          return (
            <path
              key={i}
              className={i % 2 ? 'faisca__raio faisca__raio--b' : 'faisca__raio'}
              d={`M${(Math.cos(ang) * r1).toFixed(1)} ${(Math.sin(ang) * r1).toFixed(1)} L${(Math.cos(ang) * r2).toFixed(1)} ${(Math.sin(ang) * r2).toFixed(1)}`}
            />
          )
        })}
      </svg>

      {comMouse && <Raquete ref={raqueteRef} />}
    </section>
  )
}
