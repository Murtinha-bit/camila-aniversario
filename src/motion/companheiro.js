import { gsap } from 'gsap'
import { medirPingo } from './pingo.js'

/*
  O mosquito que acompanha os capítulos. É o mesmo da abertura: quando ela sai da abertura,
  ele decola de onde estava (e o da abertura some); quando ela volta, ele pousa de novo no "Camila".

  Em cada capítulo:
    nome com "i"        o "i" está sem pingo (ı): ele pousa e vira o pingo (vale também para
                        o nome do final e para a frase final)
    nome com "I"        (Iza, Igor) paira em cima do I procurando o pingo, depois desiste no contador
    nome sem "i"        pousa em cima do contador "NN / 23"

  Ele não espera a transição acabar: decola quando a cortina do próximo capítulo passa do meio
  da tela, e persegue o alvo mesmo com ele se mexendo (letras subindo, caindo, atravessando).
  O corpo assume a cor do texto do capítulo, e as listras, a cor do campo.

  Com movimento reduzido: sem voo; ele aparece direto no lugar.
  Coordenadas sempre da janela (o mosquito é position: fixed).
*/

const FAMILIA = '"Schibsted Grotesk"'
const LARGURA_DESENHO = 120 // o desenho tem 120 × 80; o tórax (60, 36) é o ponto de pouso
const VELOCIDADE_MAX = 1100
const TEMPO_PROCURANDO = 1.3 // segundos em cima do I maiúsculo
const ALTURA_MAIUSCULA = 0.7 // altura do I em relação ao tamanho da fonte
const FOLGA = 6 // px entre o mosquito e o que está em volta

const limitar = (min, valor, max) => Math.min(max, Math.max(min, valor))

export function criarCompanheiro({ main, el, reduzido }) {
  // o pin embrulha as seções, mas cada uma continua sendo o mesmo elemento
  const secoes = [...main.querySelectorAll('section')]
  const p = { x: 0, y: 0 }
  const v = { x: 0, y: 0 }
  const tremida = { x: 0, y: 0, ate: 0 }
  let escala = 0.5
  let virado = -1
  let indice = 0 // a seção que está na frente
  let modo = 'fora' // fora | voando | pousado | procurando
  let relogio = 0
  let procurandoAte = 0
  let desistiu = false // já procurou o pingo no I maiúsculo deste capítulo
  let fontes = new WeakMap()

  // a seção da frente é a última cujo topo já passou do meio da tela
  function atualizarFrente() {
    const lista = secoes
    const meio = window.innerHeight * 0.5
    let i = Math.min(indice, lista.length - 1)
    while (i + 1 < lista.length && lista[i + 1].getBoundingClientRect().top <= meio) i++
    while (i > 0 && lista[i].getBoundingClientRect().top > meio) i--
    return i
  }

  // o tamanho da letra marcada (nome de pessoa, nome do final ou frase final)
  function tamanhoDaFonte(sonda) {
    if (!fontes.has(sonda)) fontes.set(sonda, parseFloat(getComputedStyle(sonda.parentElement).fontSize))
    return fontes.get(sonda)
  }

  function noContador() {
    const total = document.querySelector('.contador__total')
    if (!total) return null
    const r = total.getBoundingClientRect()
    const largura = limitar(38, r.height * 1.9, 56)
    // em pé em cima do "23": das patas ao tórax vão 0,35 da largura do desenho, e as asas sobem 0,25
    const emCima = r.top + r.height * 0.15 - largura * 0.35
    if (emCima - largura * 0.25 >= 0) return { x: r.left + r.width / 2, y: emCima, largura, tipo: 'contador' }
    // sem espaço em cima (no celular o contador fica colado no topo): pousa ao lado, na mesma linha
    const atual = document.querySelector('.contador__atual')?.getBoundingClientRect() ?? r
    return { x: atual.left - largura * 0.5, y: r.top + r.height * 0.85 - largura * 0.35, largura, tipo: 'contador' }
  }

  /*
    Se o mosquito em cima do I fosse cobrir o recado (nome grande e recado longo, como no Igor),
    ele desce para o vão entre o recado e o topo do I, e encolhe se o vão for estreito.
    Do tórax, as asas sobem 0,25 da largura do desenho e as patas descem 0,35.
  */
  function foraDoRecado(sec, alvo, topoDoI) {
    const recado = sec.querySelector('.pessoa__recado')?.getBoundingClientRect()
    if (!recado?.height) return alvo
    const { x, y, largura } = alvo
    const cobre =
      x + largura / 2 > recado.left &&
      x - largura / 2 < recado.right &&
      y + largura * 0.35 > recado.top &&
      y - largura * 0.25 < recado.bottom
    if (!cobre) return alvo
    const vao = topoDoI - recado.bottom - FOLGA * 2
    const menor = limitar(36, vao / 0.6, largura)
    return { ...alvo, y: recado.bottom + FOLGA + (vao - menor * 0.6) / 2 + menor * 0.25, largura: menor }
  }

  function alvoDe(sec) {
    if (sec.classList.contains('abertura')) {
      const m = sec.querySelector('.mosquito')
      const r = m && !m.hidden ? m.getBoundingClientRect() : null
      if (!r?.width) return { x: window.innerWidth + 160, y: window.innerHeight * 0.2, largura: 90, tipo: 'abertura' }
      return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.45, largura: r.width, tipo: 'abertura' }
    }
    const sonda = sec.querySelector('[data-pingo]')
    const fonte = sonda && tamanhoDaFonte(sonda)
    if (sonda && fonte && !(sonda.dataset.pingo === 'I' && desistiu)) {
      const letra = sonda.parentElement.getBoundingClientRect()
      const base = sonda.getBoundingClientRect().top
      const largura = limitar(44, fonte * 0.42, 150)
      if (sonda.dataset.pingo === 'i') {
        const m = medirPingo(FAMILIA, 800, fonte)
        return { x: letra.left + m.avanco / 2 + m.dx, y: base + m.dy, largura, tipo: 'pingo' }
      }
      // paira acima do I, onde o pingo estaria se ele fosse minúsculo
      const x = letra.left + letra.width / 2
      const acima = { x, y: base - fonte * 0.98, largura, tipo: 'maiusculo' }
      return foraDoRecado(sec, acima, base - fonte * ALTURA_MAIUSCULA)
    }
    return noContador() ?? { x: window.innerWidth - 60, y: 40, largura: 46, tipo: 'contador' }
  }

  function vestir(sec) {
    if (sec.classList.contains('abertura')) {
      el.style.removeProperty('--mosq-corpo')
      el.style.removeProperty('--mosq-listra')
      return
    }
    const cs = getComputedStyle(sec)
    el.style.setProperty('--mosq-corpo', cs.color)
    el.style.setProperty('--mosq-listra', cs.backgroundColor)
  }

  function mostrar(sim) {
    el.hidden = !sim
    document.documentElement.classList.toggle('mosquito-acompanhando', sim)
  }

  function voar(sim) {
    el.classList.toggle('mosquito--voando', sim)
  }

  function render(bob = 0) {
    if (Math.abs(v.x) > 40) virado = v.x > 0 ? 1 : -1
    const inclinar = modo === 'voando' ? limitar(-18, v.y * 0.03, 18) : 0
    el.style.transform =
      `translate3d(${p.x.toFixed(1)}px, ${(p.y + bob).toFixed(1)}px, 0) rotate(${inclinar.toFixed(1)}deg) ` +
      `scale(${(escala * virado).toFixed(3)}, ${escala.toFixed(3)}) translate(-60px, -36px)`
  }

  function trocouDeFrente(sec, alvo) {
    desistiu = false
    if (modo === 'fora') {
      // sai da abertura: começa exatamente onde o mosquito da abertura estava
      const daAbertura = alvoDe(secoes[0] ?? sec)
      p.x = daAbertura.x
      p.y = daAbertura.y
      escala = daAbertura.largura / LARGURA_DESENHO
      v.x = 0
      v.y = -200
      mostrar(true)
    }
    if (alvo.tipo !== 'abertura' || modo !== 'fora') {
      modo = 'voando'
      voar(true)
      // um pulinho para cima na decolagem
      v.y -= 260
    }
    // por último: escreve as cores depois de todas as leituras de posição
    vestir(sec)
  }

  function passo(_t, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 1 / 30)
    relogio += dt

    const novo = atualizarFrente()
    const sec = secoes[novo]
    if (!sec) return
    const trocou = novo !== indice
    indice = novo
    let alvo = alvoDe(sec)

    if (reduzido) {
      if (trocou) vestir(sec)
      if (alvo.tipo === 'maiusculo') alvo = noContador() ?? alvo
      const naAbertura = alvo.tipo === 'abertura'
      mostrar(!naAbertura)
      if (naAbertura) return
      modo = 'pousado'
      p.x = alvo.x
      p.y = alvo.y
      escala = alvo.largura / LARGURA_DESENHO
      render()
      return
    }

    if (trocou) trocouDeFrente(sec, alvo)
    if (modo === 'fora') return

    // o tamanho acompanha o do alvo: grande no nome, pequeno no contador
    escala += (alvo.largura / LARGURA_DESENHO - escala) * Math.min(1, dt * 3)

    if (modo === 'pousado') {
      p.x = alvo.x
      p.y = alvo.y
      render()
      return
    }

    if (modo === 'procurando') {
      // paira em cima do I, olhando para um lado e para o outro
      p.x = alvo.x
      p.y = alvo.y
      v.x = 0
      v.y = 0
      virado = Math.sin(relogio * 5) > 0 ? 1 : -1
      if (relogio > procurandoAte) {
        desistiu = true
        modo = 'voando'
        v.y = -320
      }
      render(Math.sin(relogio * 9) * 4)
      return
    }

    // voando: persegue o alvo, desacelerando na chegada (como em motion/voo.js)
    const dx = alvo.x - p.x
    const dy = alvo.y - p.y
    const d = Math.hypot(dx, dy)
    const desejada = Math.min(VELOCIDADE_MAX, d * 4)
    let ax = ((dx / (d || 1)) * desejada - v.x) * 6
    let ay = ((dy / (d || 1)) * desejada - v.y) * 6

    // zigue-zague de mosquito, só longe do alvo
    if (d > 90) {
      if (relogio > tremida.ate) {
        const ang = Math.random() * Math.PI * 2
        const forca = 1200 + Math.random() * 1200
        tremida.x = Math.cos(ang) * forca
        tremida.y = Math.sin(ang) * forca
        tremida.ate = relogio + 0.08 + Math.random() * 0.1
      }
      ax += tremida.x
      ay += tremida.y
    }

    v.x += ax * dt
    v.y += ay * dt
    const vel = Math.hypot(v.x, v.y)
    if (vel > VELOCIDADE_MAX) {
      v.x *= VELOCIDADE_MAX / vel
      v.y *= VELOCIDADE_MAX / vel
    }
    p.x += v.x * dt
    p.y += v.y * dt

    if (d < 4 && vel < 80) {
      p.x = alvo.x
      p.y = alvo.y
      v.x = 0
      v.y = 0
      if (alvo.tipo === 'abertura') {
        // devolve o lugar ao mosquito da abertura
        modo = 'fora'
        voar(false)
        mostrar(false)
        return
      }
      if (alvo.tipo === 'maiusculo') {
        modo = 'procurando'
        procurandoAte = relogio + TEMPO_PROCURANDO
      } else {
        modo = 'pousado'
        voar(false)
      }
    }
    render()
  }

  const aoRedimensionar = () => {
    fontes = new WeakMap()
  }
  window.addEventListener('resize', aoRedimensionar)
  gsap.ticker.add(passo)

  return () => {
    gsap.ticker.remove(passo)
    window.removeEventListener('resize', aoRedimensionar)
    mostrar(false)
  }
}
