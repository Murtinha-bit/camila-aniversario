import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// A história sempre começa do topo, mesmo recarregando a página.
// O ScrollTrigger guarda a posição por conta própria; isto desliga essa memória.
ScrollTrigger.clearScrollMemory('manual')
window.scrollTo(0, 0)

/*
  Navegação por capítulo: a página só para com uma pessoa inteira na tela.

  Computador (roda do mouse, trackpad, teclado): cada gesto leva exatamente um capítulo
  adiante ou para trás, numa transição em que a cortina sobe. A inércia do trackpad é
  ignorada até o gesto terminar, para um gesto forte não pular várias pessoas.

  Celular e movimento reduzido: encaixe nativo do navegador (CSS scroll-snap), um capítulo
  por swipe.

  Os pontos de parada vêm de motion/capitulos.js, por definirPontos().
*/

const DURACAO_PASSO = 1.3 // segundos
const LIMIAR_GESTO = 24 // px acumulados para valer como gesto
const SILENCIO_FIM_GESTO = 220 // ms sem eventos = o gesto (e a inércia) acabou...
const SILENCIO_CERTO = 600 // ...mas, se o movimento ainda está diminuindo, só com este silêncio todo

let obterPontos = () => []

export function definirPontos(fn) {
  obterPontos = fn
  return () => {
    if (obterPontos === fn) obterPontos = () => []
  }
}

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const TECLAS_PROXIMO = new Set(['ArrowDown', 'PageDown', ' '])
const TECLAS_ANTERIOR = new Set(['ArrowUp', 'PageUp'])

export function useScrollSuave(reduzido) {
  useEffect(() => {
    const toque = window.matchMedia('(pointer: coarse)').matches
    if (reduzido || toque) {
      document.documentElement.classList.add('encaixe-nativo')
      return () => document.documentElement.classList.remove('encaixe-nativo')
    }

    let animando = false
    let travado = false
    let acumulado = 0
    let ultimoEvento = 0
    let ultimoDelta = 0

    const lenis = new Lenis({
      autoRaf: false,
      virtualScroll: (dados) => {
        // toque em computador híbrido: deixa com o navegador
        if (dados.event.type !== 'wheel') return true
        dados.event.preventDefault()
        gesto(dados.deltaY, dados.event.timeStamp)
        return false
      },
    })
    lenis.on('scroll', ScrollTrigger.update)
    const tique = (tempo) => lenis.raf(tempo * 1000)
    gsap.ticker.add(tique)
    gsap.ticker.lagSmoothing(0)

    const pontos = () => obterPontos()

    function irPara(alvo, duracao = DURACAO_PASSO) {
      animando = true
      lenis.scrollTo(alvo, {
        duration: duracao,
        easing: easeInOutCubic,
        lock: true,
        force: true,
        onComplete: () => {
          animando = false
        },
      })
    }

    function passo(direcao) {
      const lista = pontos()
      const atual = lenis.scroll
      const alvo =
        direcao > 0 ? lista.find((p) => p > atual + 2) : [...lista].reverse().find((p) => p < atual - 2)
      if (alvo !== undefined) irPara(alvo)
    }

    /*
      Um silêncio curto no meio da inércia (o navegador travou um instante carregando uma foto)
      não é gesto novo: a inércia só diminui, e um gesto novo volta a crescer.
    */
    function gesto(deltaY, tempo) {
      const silencio = tempo - ultimoEvento
      const cresceu = Math.abs(deltaY) > Math.abs(ultimoDelta)
      const novoGesto = silencio > SILENCIO_CERTO || (silencio > SILENCIO_FIM_GESTO && cresceu)
      ultimoEvento = tempo
      ultimoDelta = deltaY
      if (novoGesto) {
        acumulado = 0
        travado = false
      }
      if (animando || travado) return
      acumulado += deltaY
      if (Math.abs(acumulado) >= LIMIAR_GESTO) {
        passo(Math.sign(acumulado))
        acumulado = 0
        travado = true
      }
    }

    function aoTeclar(e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const alvo = e.target
      if (alvo.closest?.('input, textarea, select, [contenteditable]')) return
      // espaço e enter num botão (o mosquito) são do botão
      if ((e.key === ' ' || e.key === 'Enter') && alvo.closest?.('button')) return
      let direcao = 0
      if (TECLAS_PROXIMO.has(e.key)) direcao = e.shiftKey && e.key === ' ' ? -1 : 1
      else if (TECLAS_ANTERIOR.has(e.key)) direcao = -1
      else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        const lista = pontos()
        if (lista.length && !animando) irPara(e.key === 'Home' ? lista[0] : lista.at(-1), 1.6)
        return
      }
      if (!direcao) return
      e.preventDefault()
      if (!animando) passo(direcao)
    }

    // arrastou a barra de rolagem (ou qualquer scroll que não veio daqui): encaixa no mais próximo
    let esperaFim
    function aoRolarNativo() {
      if (animando) return
      clearTimeout(esperaFim)
      esperaFim = setTimeout(() => {
        if (animando) return
        const lista = pontos()
        if (!lista.length) return
        const atual = lenis.scroll
        const maisProximo = lista.reduce((a, b) => (Math.abs(b - atual) < Math.abs(a - atual) ? b : a))
        if (Math.abs(maisProximo - atual) > 2) irPara(maisProximo, 0.6)
      }, 160)
    }

    window.addEventListener('keydown', aoTeclar)
    window.addEventListener('scroll', aoRolarNativo, { passive: true })

    return () => {
      clearTimeout(esperaFim)
      window.removeEventListener('keydown', aoTeclar)
      window.removeEventListener('scroll', aoRolarNativo)
      gsap.ticker.remove(tique)
      lenis.destroy()
    }
  }, [reduzido])
}
