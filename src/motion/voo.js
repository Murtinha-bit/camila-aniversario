import { gsap } from 'gsap'

/*
  O voo do mosquito da abertura.

  Modos:
    chegando    entra pela direita e dá umas voltas
    voando      vagueia em zigue-zague; foge do cursor quando ele se mexe rápido
    indoPousar  vai até o pingo do i
    pousado     é o pingo do i; decola se o cursor chega rápido demais
    atordoado   levou a raquetada: cai rodando de volta no pingo do i

  Coordenadas sempre relativas ao palco (a seção da abertura).
*/

const VELOCIDADE_MAX = 640
const VELOCIDADE_FUGA = 980
const RAIO_SUSTO = 190
const RAIO_ACERTO = 64

export function criarVoo({
  palco,
  mosquito,
  corpo,
  raquete,
  faisca,
  obterPingo,
  reduzido,
  comMouse,
  atraso = 1.1,
  aoPousar,
  aoAcertar,
  aoRedimensionarPalco,
}) {
  const p = { x: 0, y: 0 }
  const v = { x: 0, y: 0 }
  const tremida = { x: 0, y: 0, ate: 0 }
  const ponteiro = { x: -9999, y: -9999, vel: 0, dentro: false, ultimo: 0 }
  const raq = { x: -9999, y: -9999, inclinar: 0 }
  const fase = { a: Math.random() * 6, b: Math.random() * 6, c: Math.random() * 6 }

  let modo = reduzido ? 'pousado' : 'esperando'
  let relogio = 0
  let trocaEm = 0
  let tontoAte = 0
  let virado = -1
  let acertos = 0
  let visivel = true
  let jaPousou = false
  let tamanho = medir()

  function medir() {
    return {
      w: mosquito.offsetWidth,
      h: mosquito.offsetHeight,
      palco: palco.getBoundingClientRect(),
    }
  }

  function noPalco(clienteX, clienteY) {
    const r = palco.getBoundingClientRect()
    return { x: clienteX - r.left, y: clienteY - r.top, r }
  }

  function colocarNoPingo() {
    const pingo = obterPingo()
    if (!pingo) return false
    p.x = pingo.x
    p.y = pingo.y
    v.x = 0
    v.y = 0
    return true
  }

  function pousar() {
    modo = 'pousado'
    mosquito.classList.remove('mosquito--voando')
    if (!jaPousou) {
      jaPousou = true
      aoPousar?.()
    }
  }

  function decolar(forca = 420) {
    modo = 'voando'
    trocaEm = relogio + 3 + Math.random() * 3
    v.y = -forca
    v.x = (Math.random() - 0.5) * forca
    mosquito.classList.add('mosquito--voando')
  }

  function render() {
    // escondido ele mede 0; mede de novo quando aparece
    if (!tamanho.w) tamanho = medir()
    const ax = tamanho.w * 0.5
    const ay = tamanho.h * 0.45
    if (Math.abs(v.x) > 40) virado = v.x > 0 ? 1 : -1
    const inclinar = modo === 'pousado' ? 0 : Math.max(-18, Math.min(18, v.y * 0.03))
    mosquito.style.transform = `translate3d(${(p.x - ax).toFixed(1)}px, ${(p.y - ay).toFixed(1)}px, 0) rotate(${inclinar.toFixed(1)}deg) scaleX(${virado})`
  }

  function renderRaquete(dt) {
    if (!raquete) return
    const alvoInclinar = Math.max(-24, Math.min(24, (ponteiro.velX || 0) * 0.012))
    raq.inclinar += (alvoInclinar - raq.inclinar) * Math.min(1, dt * 10)
    raquete.style.transform = `translate3d(${raq.x}px, ${raq.y}px, 0) rotate(${(-14 + raq.inclinar).toFixed(1)}deg)`
  }

  function passo(_t, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 1 / 30)
    relogio += dt
    tamanho.palco = palco.getBoundingClientRect()
    ponteiro.vel *= Math.pow(0.02, dt)
    // leituras de layout primeiro, escritas (transforms) no fim do passo
    if (!visivel) {
      renderRaquete(dt)
      return
    }

    if (modo === 'esperando') {
      if (relogio < atraso) {
        renderRaquete(dt)
        return
      }
      modo = 'chegando'
      trocaEm = relogio + 2.6
      p.x = tamanho.palco.width + tamanho.w
      p.y = tamanho.palco.height * 0.18
      v.x = -520
      v.y = 120
      mosquito.hidden = false
      mosquito.classList.add('mosquito--voando')
    }

    if (modo === 'atordoado') {
      render()
      renderRaquete(dt)
      return
    }

    if (modo === 'pousado') {
      colocarNoPingo()
      const assustou =
        !reduzido &&
        relogio > tontoAte &&
        ponteiro.dentro &&
        ponteiro.vel > 700 &&
        distanciaAoPonteiro() < RAIO_SUSTO
      // só decola quando provocado: o movimento não fica rodando sozinho
      if (assustou) decolar()
      render()
      renderRaquete(dt)
      return
    }

    const { width: W, height: H } = tamanho.palco
    let ax = 0
    let ay = 0
    let limite = VELOCIDADE_MAX

    if (modo === 'indoPousar') {
      const pingo = obterPingo()
      if (pingo) {
        const dx = pingo.x - p.x
        const dy = pingo.y - p.y
        const d = Math.hypot(dx, dy)
        const desejada = Math.min(460, d * 4)
        ax = ((dx / (d || 1)) * desejada - v.x) * 6
        ay = ((dy / (d || 1)) * desejada - v.y) * 6
        if (d < 3 && Math.hypot(v.x, v.y) < 60) {
          p.x = pingo.x
          p.y = pingo.y
          pousar()
          render()
          renderRaquete(dt)
          return
        }
      }
    } else {
      // vaguear: um alvo que passeia pelo meio do palco
      const tx = W * (0.5 + 0.32 * Math.sin(relogio * 0.53 + fase.a) + 0.1 * Math.sin(relogio * 1.7 + fase.b))
      const ty = H * (0.4 + 0.2 * Math.sin(relogio * 0.71 + fase.c) + 0.07 * Math.sin(relogio * 2.3))
      ax = (tx - p.x) * 3.2 - v.x * 1.1
      ay = (ty - p.y) * 3.2 - v.y * 1.1

      // zigue-zague de mosquito
      if (relogio > tremida.ate) {
        const ang = Math.random() * Math.PI * 2
        const forca = 900 + Math.random() * 900
        tremida.x = Math.cos(ang) * forca
        tremida.y = Math.sin(ang) * forca
        tremida.ate = relogio + 0.08 + Math.random() * 0.1
      }
      ax += tremida.x
      ay += tremida.y

      // foge de cursor rápido; cursor devagar quase não assusta
      if (comMouse && ponteiro.dentro && relogio > tontoAte) {
        const dx = p.x - ponteiro.x
        const dy = p.y - ponteiro.y
        const d = Math.hypot(dx, dy)
        if (d < RAIO_SUSTO) {
          const medo = Math.max(0.12, Math.min(1.5, ponteiro.vel / 600))
          const f = 5200 * (1 - d / RAIO_SUSTO) * medo
          ax += (dx / (d || 1)) * f
          ay += (dy / (d || 1)) * f
          limite = VELOCIDADE_FUGA
        }
      }

      if (!comMouse) limite = 380

      if (modo === 'chegando' && relogio > trocaEm) {
        modo = 'voando'
        trocaEm = relogio + 1.2
      }
      if (modo === 'voando' && relogio > trocaEm) {
        const calmo = !ponteiro.dentro || (ponteiro.vel < 250 && relogio - ponteiro.ultimo > 0.8)
        if (calmo || !jaPousou) modo = 'indoPousar'
        else trocaEm = relogio + 1.5
      }
    }

    // paredes macias
    const m = Math.max(tamanho.w * 0.6, 40)
    if (modo !== 'chegando') {
      if (p.x < m) ax += (m - p.x) * 40
      if (p.x > W - m) ax -= (p.x - (W - m)) * 40
      if (p.y < m) ay += (m - p.y) * 40
      if (p.y > H - m) ay -= (p.y - (H - m)) * 40
    }

    v.x += ax * dt
    v.y += ay * dt
    const vel = Math.hypot(v.x, v.y)
    if (vel > limite) {
      v.x *= limite / vel
      v.y *= limite / vel
    }
    p.x += v.x * dt
    p.y += v.y * dt
    render()
    renderRaquete(dt)
  }

  function distanciaAoPonteiro() {
    return Math.hypot(p.x - ponteiro.x, p.y - ponteiro.y)
  }

  function soltarFaisca() {
    if (!faisca) return
    faisca.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
    faisca.animate(
      [
        { opacity: 1, scale: 0.3 },
        { opacity: 1, scale: 1, offset: 0.4 },
        { opacity: 0, scale: 1.35 },
      ],
      { duration: reduzido ? 260 : 420, easing: 'cubic-bezier(.16,1,.3,1)' },
    )
  }

  function acertar() {
    if (modo === 'atordoado' || modo === 'esperando') return
    acertos += 1
    soltarFaisca()
    mosquito.classList.add('mosquito--choque')
    setTimeout(() => mosquito.classList.remove('mosquito--choque'), 460)
    // a fala aparece junto com o choque, sem esperar ele cair tonto no pingo
    aoAcertar?.(acertos)

    if (reduzido) return

    const pingo = obterPingo()
    if (!pingo) return
    modo = 'atordoado'
    mosquito.classList.remove('mosquito--voando')
    v.x = 0
    v.y = 0
    gsap
      .timeline({
        onComplete: () => {
          pousar()
          tontoAte = relogio + 4
        },
      })
      .to(p, { y: p.y - 70, duration: 0.28, ease: 'power2.out' }, 0)
      .to(p, { x: pingo.x, duration: 0.95, ease: 'power1.inOut' }, 0)
      .to(p, { y: () => obterPingo()?.y ?? pingo.y, duration: 0.67, ease: 'power2.in' }, 0.28)
      .fromTo(corpo, { rotation: 0 }, { rotation: 720, duration: 0.95, ease: 'power2.out' }, 0)
      .set(corpo, { rotation: 0 })
      .to(corpo, { rotation: 12, duration: 0.16, yoyo: true, repeat: 5, ease: 'sine.inOut' })
      .to(corpo, { rotation: 0, duration: 0.2 })
  }

  function esquivar() {
    if (modo === 'pousado') {
      decolar(520)
      return
    }
    const dx = p.x - ponteiro.x
    const dy = p.y - ponteiro.y
    const d = Math.hypot(dx, dy) || 1
    v.x += (dx / d) * 700
    v.y += (dy / d) * 700
  }

  // Eventos
  function aoMover(e) {
    const agora = performance.now() / 1000
    const { x, y, r } = noPalco(e.clientX, e.clientY)
    const dtp = Math.max(agora - (ponteiro.t || agora), 1 / 120)
    const vx = (x - ponteiro.x) / dtp
    const vy = (y - ponteiro.y) / dtp
    if (ponteiro.t && agora - ponteiro.t < 0.1) {
      ponteiro.vel = ponteiro.vel * 0.6 + Math.hypot(vx, vy) * 0.4
      ponteiro.velX = vx
    }
    ponteiro.x = x
    ponteiro.y = y
    ponteiro.t = agora
    ponteiro.ultimo = relogio
    ponteiro.cx = e.clientX
    ponteiro.cy = e.clientY
    ponteiro.mouse = e.pointerType === 'mouse'
    // dentro = em cima da abertura de verdade, não de um capítulo que a cobre
    ponteiro.dentro = x >= 0 && y >= 0 && x <= r.width && y <= r.height && palco.contains(e.target)
    raq.x = e.clientX - (raquete?.offsetWidth ?? 0) * 0.5
    raq.y = e.clientY - (raquete?.offsetHeight ?? 0) * 0.32
    if (raquete) raquete.classList.toggle('raquete--visivel', ponteiro.dentro && ponteiro.mouse)
  }

  // rolando sem mexer o mouse: confere o que ficou embaixo do cursor
  function aoRolar() {
    if (ponteiro.cx === undefined) return
    const alvo = document.elementFromPoint(ponteiro.cx, ponteiro.cy)
    ponteiro.dentro = !!alvo && palco.contains(alvo)
    raquete?.classList.toggle('raquete--visivel', ponteiro.dentro && ponteiro.mouse)
  }

  function aoSair() {
    ponteiro.dentro = false
    raquete?.classList.remove('raquete--visivel')
  }

  function aoApertar(e) {
    if (e.button !== 0) return
    const { x, y } = noPalco(e.clientX, e.clientY)
    if (e.pointerType === 'mouse') {
      // a raquetada: a raquete "afunda" na tela e volta
      raquete?.animate([{ scale: 1 }, { scale: 0.8, offset: 0.3 }, { scale: 1 }], {
        duration: 280,
        easing: 'cubic-bezier(.16,1,.3,1)',
      })
    }
    const d = Math.hypot(p.x - x, p.y - y)
    const raio = Math.max(RAIO_ACERTO, tamanho.w * 0.55)
    if (d < raio) acertar()
    else if (d < raio * 2.6) esquivar()
  }

  // Teclado: Enter ou espaço no botão do mosquito
  function aoClicarBotao(e) {
    if (e.detail === 0) acertar()
  }

  function aoRedimensionar() {
    tamanho = medir()
    aoRedimensionarPalco?.()
  }

  const observador = new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting
  })
  observador.observe(palco)

  window.addEventListener('pointermove', aoMover, { passive: true })
  window.addEventListener('scroll', aoRolar, { passive: true })
  document.documentElement.addEventListener('pointerleave', aoSair)
  palco.addEventListener('pointerdown', aoApertar)
  mosquito.addEventListener('click', aoClicarBotao)
  window.addEventListener('resize', aoRedimensionar)

  if (reduzido) {
    mosquito.hidden = false
    colocarNoPingo()
    pousar()
    render()
  } else {
    mosquito.hidden = true
  }
  gsap.ticker.add(passo)

  return () => {
    gsap.ticker.remove(passo)
    observador.disconnect()
    window.removeEventListener('pointermove', aoMover)
    window.removeEventListener('scroll', aoRolar)
    document.documentElement.removeEventListener('pointerleave', aoSair)
    palco.removeEventListener('pointerdown', aoApertar)
    mosquito.removeEventListener('click', aoClicarBotao)
    window.removeEventListener('resize', aoRedimensionar)
    gsap.killTweensOf(p)
    gsap.killTweensOf(corpo)
  }
}
