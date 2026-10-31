import { gsap } from 'gsap'

/*
  Queda com física para as letras da abertura.
  Cada letra é um corpo com gravidade, quique (restituição) e uma mola que achata
  a letra no impacto e a devolve ao normal. Corpos pesados (o "23") quicam menos
  e, ao bater no chão, dão um pulinho nas letras que já assentaram.

  corpos: [{ el, peso: 1 | 2, atraso: segundos }]
*/

const GRAVIDADE = 6.5 // em alturas de tela por segundo²
const MOLA = 520
const AMORTECIMENTO = 16

export function prepararQueda(corpos) {
  const altura = window.innerHeight
  return corpos.map((c, i) => {
    const caixa = c.el.getBoundingClientRect()
    const estado = {
      ...c,
      y: -(caixa.bottom + altura * (0.15 + Math.random() * 0.35)),
      vy: 0,
      giro: (Math.random() - 0.5) * 24,
      vgiro: (Math.random() - 0.5) * 30,
      achatar: 1,
      vachatar: 0,
      noChao: false,
      parado: false,
      indice: i,
    }
    aplicar(estado)
    return estado
  })
}

export function soltar(estados, { aoImpactoPesado } = {}) {
  const altura = window.innerHeight
  const g = GRAVIDADE * altura
  let relogio = 0

  const passo = (_tempo, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 1 / 30)
    relogio += dt
    let todosParados = true

    for (const c of estados) {
      if (relogio < c.atraso) {
        todosParados = false
        continue
      }
      if (!c.parado) todosParados = false

      if (!c.noChao || c.vy !== 0 || c.y < 0) {
        c.vy += g * dt
        c.y += c.vy * dt
      }

      if (c.y >= 0) {
        c.y = 0
        const impacto = c.vy
        const restituicao = c.peso > 1 ? 0.28 : 0.42
        if (impacto > altura * 0.25) {
          c.vy = -impacto * restituicao
          c.vachatar -= (impacto / altura) * (c.peso > 1 ? 2.6 : 1.8)
          c.vgiro = -c.giro * 4
          if (!c.noChao && c.peso > 1 && aoImpactoPesado) aoImpactoPesado(impacto / altura)
          if (!c.noChao && c.peso > 1) pulinho(estados, c, altura)
        } else {
          c.vy = 0
        }
        c.noChao = true
      }

      // giro: livre no ar, mola até zero depois do primeiro toque
      if (c.noChao) {
        c.vgiro += (-c.giro * 180 - c.vgiro * 14) * dt
      }
      c.giro += c.vgiro * dt

      // achatamento
      c.vachatar += (-(c.achatar - 1) * MOLA - c.vachatar * AMORTECIMENTO) * dt
      c.achatar += c.vachatar * dt

      const quieto =
        c.noChao &&
        c.vy === 0 &&
        Math.abs(c.achatar - 1) < 0.002 &&
        Math.abs(c.vachatar) < 0.01 &&
        Math.abs(c.giro) < 0.1
      if (quieto && !c.parado) {
        c.parado = true
        c.el.style.transform = ''
        c.el.style.willChange = ''
      } else if (!quieto) {
        c.parado = false
        aplicar(c)
      }
    }

    if (todosParados) {
      gsap.ticker.remove(passo)
      fim?.()
    }
  }

  let fim
  const terminou = new Promise((resolver) => {
    fim = resolver
  })
  gsap.ticker.add(passo)
  return {
    terminou,
    cancelar: () => gsap.ticker.remove(passo),
  }
}

function pulinho(estados, pesado, altura) {
  for (const c of estados) {
    if (c === pesado || !c.noChao) continue
    const distancia = Math.abs(c.indice - pesado.indice)
    c.vy = -altura * (0.5 / (1 + distancia * 0.35))
    c.vgiro += (Math.random() - 0.5) * 60
    c.parado = false
  }
}

function aplicar(c) {
  const sx = 1 + (1 - c.achatar) * 0.55
  c.el.style.willChange = 'transform'
  c.el.style.transform = `translate3d(0, ${c.y.toFixed(2)}px, 0) rotate(${c.giro.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${c.achatar.toFixed(4)})`
}
