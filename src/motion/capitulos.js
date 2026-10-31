import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { definirPontos } from './scroll.js'

gsap.registerPlugin(ScrollTrigger)

const FOLGA_DE_BAIXO = 48 // px; o espaço vazio no pé de cada capítulo no celular
const PAGINA = 0.8 // na carta, cada gesto anda 80% de uma tela

/*
  A coreografia entre capítulos.
  - Cortina: cada capítulo fica preso enquanto o próximo sobe por cima dele.
  - Entrada: muda de capítulo para capítulo (veja ENTRADAS), sempre foto, nome e
    depois o recado.
  - Contador: avisa qual capítulo está no meio da tela, qual a cor do texto dele e se o
    contador deve sumir (data-sem-contador, na primeira tela do final).
  - Carta (data-paginar): além do começo e do fim, ganha uma parada a cada 80% de tela.

  Com movimento reduzido: sem cortina e sem entradas; o contador continua funcionando.
*/
export function useCapitulos(mainRef, { reduzido, aoMudar }) {
  useEffect(() => {
    const main = mainRef.current
    const secoes = [...main.querySelectorAll(':scope > section')]
    let medidores = []

    const ctx = gsap.context(() => {
      // onde cada capítulo fica inteiro na tela: o topo no topo e, se for mais alto que a tela, o fim no fim
      medidores = secoes.map((sec) => ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom' }))

      secoes.forEach((sec, i) => {
        const numero = Number(sec.dataset.numero || 0)
        // o contador muda quando a cortina passa por baixo dele, então a cor sempre combina com o campo
        ScrollTrigger.create({
          trigger: sec,
          start: 'top 5%',
          end: 'bottom 5%',
          onToggle: (st) =>
            st.isActive &&
            aoMudar({ numero, cor: getComputedStyle(sec).color, oculto: sec.hasAttribute('data-sem-contador') }),
        })

        if (reduzido) return

        const proxima = secoes[i + 1]
        if (proxima) {
          // capítulos mais altos que a tela só prendem quando o fim deles chega
          ScrollTrigger.create({
            trigger: sec,
            start: () => (sec.offsetHeight > window.innerHeight + 1 ? 'bottom bottom' : 'top top'),
            end: () => `+=${window.innerHeight}`,
            pin: true,
            pinSpacing: false,
          })
        }

        const tipo = sec.dataset.entrada
        if (tipo === 'final') entradaDoFinal(sec)
        else if (tipo === 'carta') entradaDaCarta(sec)
        else if (tipo === 'surpresa') entradaDaSurpresa(sec)
        else if (tipo === 'fecho') entradaDoFecho(sec)
        else if (tipo) entrada(sec)
        // a carta é alta demais para subir 7%: ela só fica presa embaixo da cortina
        if (tipo && tipo !== 'carta' && proxima) sairPorBaixoDaCortina(sec, proxima)
      })
    }, main)

    const pontos = () => {
      const lista = []
      for (const m of medidores) {
        lista.push(Math.round(m.start))
        // só ganha uma segunda parada o capítulo que passa da tela mais que a folga de baixo;
        // senão o swipe andaria só alguns pixels e pareceria travado
        if (m.end - m.start > FOLGA_DE_BAIXO) lista.push(Math.round(m.end))
        // a carta: uma parada a cada 80% de tela, para nenhum gesto pular um pedaço da leitura
        if (m.trigger.hasAttribute('data-paginar')) {
          const passo = window.innerHeight * PAGINA
          for (let y = m.start + passo; y < m.end - passo * 0.3; y += passo) lista.push(Math.round(y))
        }
      }
      return [...new Set(lista)].sort((a, b) => a - b)
    }
    const desfazerPontos = definirPontos(pontos)

    // marcadores invisíveis nos pontos de parada, para o encaixe nativo (celular e movimento reduzido)
    const marcadores = []
    const posicionarMarcadores = () => {
      marcadores.splice(0).forEach((m) => m.remove())
      for (const y of pontos()) {
        const m = document.createElement('div')
        m.className = 'encaixe'
        m.style.top = `${y}px`
        main.append(m)
        marcadores.push(m)
      }
    }
    ScrollTrigger.addEventListener('refresh', posicionarMarcadores)

    ScrollTrigger.refresh()
    return () => {
      ScrollTrigger.removeEventListener('refresh', posicionarMarcadores)
      marcadores.forEach((m) => m.remove())
      desfazerPontos()
      ctx.revert()
    }
  }, [mainRef, reduzido, aoMudar])
}

/*
  As entradas giram nesta ordem, então dois capítulos seguidos nunca entram do mesmo jeito.
    cortina    a foto abre de baixo para cima e as letras sobem de trás da linha de base
    janela     a foto abre do centro para fora, como uma janela, e as letras sobem do meio
    atravessa  o nome entra de fora da tela, pela direita, e a foto abre de lado
    queda      as letras caem e quicam, como na abertura, e a foto abre de cima para baixo
*/
export const ENTRADAS = ['cortina', 'janela', 'atravessa', 'queda']

function entrada(sec) {
  const tipo = sec.dataset.entrada
  const molduras = sec.querySelectorAll('.pessoa__moldura')
  const imagens = sec.querySelectorAll('.pessoa__imagem')
  const imgs = sec.querySelectorAll('.pessoa__moldura img')
  const nome = sec.querySelector('.pessoa__letras')
  const letras = sec.querySelectorAll('.mascara__letra')
  const textos = sec.querySelectorAll('.pessoa__recado')

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sec, start: 'top 72%', once: true },
    defaults: { ease: 'expo.out' },
  })
  // capítulo sem foto ou sem recado: pula o que não existe
  const anima = (alvo, vars, quando) => alvo.length && tl.from(alvo, vars, quando)

  if (tipo === 'janela') {
    // a moldura cresce do centro e a imagem dentro dela encolhe (só transform, sem recorte animado)
    anima(molduras, { scale: 0.3, duration: 1.4 }, 0)
    anima(imagens, { scale: 1.9, duration: 1.4 }, 0)
    tl.from(letras, { yPercent: 115, duration: 0.95, stagger: { each: 0.04, from: 'center' } }, 0.2)
  } else if (tipo === 'atravessa') {
    // moldura e imagem deslizam em sentidos opostos (só translate), como na cortina, mas de lado
    anima(molduras, { xPercent: -100, duration: 1.3 }, 0)
    anima(imagens, { xPercent: 100, duration: 1.3 }, 0)
    tl.from(nome, { x: () => window.innerWidth * 0.85, duration: 1.6, ease: 'expo.out' }, 0.05)
  } else if (tipo === 'queda') {
    anima(molduras, { yPercent: -100, duration: 1.3 }, 0)
    anima(imagens, { yPercent: 100, duration: 1.3 }, 0)
    tl.from(
      letras,
      {
        y: () => -window.innerHeight * 0.75,
        // invisíveis até cair, para não aparecerem no capítulo de cima antes da hora
        opacity: 0,
        rotation: () => gsap.utils.random(-28, 28),
        duration: 1.25,
        ease: 'bounce.out',
        stagger: { each: 0.07, from: 'random' },
      },
      0.1,
    )
  } else {
    // a foto abre de baixo para cima: a moldura sobe e a imagem desce na mesma medida (só translate)
    anima(molduras, { yPercent: 100, duration: 1.3 }, 0)
    anima(imagens, { yPercent: -100, duration: 1.3 }, 0)
    tl.from(letras, { yPercent: 115, duration: 0.95, stagger: 0.035 }, 0.18)
  }
  anima(textos, { y: 28, opacity: 0, duration: 0.85, stagger: 0.09 }, 0.4)

  // a foto se aproxima devagar enquanto o capítulo passa
  imgs.forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.16 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  })
}

/*
  A primeira tela do final: as células do mosaico sobem cada uma no seu tempo, o nome sobe
  de trás da linha de base e o "23" sai do contador, no canto, e cresce até o lugar dele.
*/
function entradaDoFinal(sec) {
  const celulas = sec.querySelectorAll('.final__celula > *')
  const letras = sec.querySelectorAll('.final__nome .mascara__letra')
  const vinteTres = sec.querySelector('.final__idade')

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sec, start: 'top 72%', once: true },
    defaults: { ease: 'expo.out' },
  })
  tl.from(celulas, { yPercent: 100, duration: 1.2, stagger: { each: 0.07, from: 'random' } }, 0)
  tl.from(letras, { yPercent: 115, duration: 0.95, stagger: 0.04 }, 0.35)

  if (!vinteTres) return
  // escondido até a hora de sair do contador (só com o script rodando; sem ele, fica visível)
  gsap.set(vinteTres, { autoAlpha: 0 })
  ScrollTrigger.create({
    trigger: sec,
    start: 'top 12%',
    once: true,
    onEnter: () => {
      const contador = document.querySelector('.contador__total')?.getBoundingClientRect()
      const alvo = vinteTres.getBoundingClientRect()
      gsap.set(vinteTres, { autoAlpha: 1 })
      if (!contador?.height) return
      gsap.from(vinteTres, {
        x: contador.left - alvo.left,
        y: contador.top - alvo.top,
        scale: contador.height / alvo.height,
        transformOrigin: '0 0',
        duration: 1.15,
        ease: 'expo.inOut',
      })
    },
  })
}

// a carta: cada parágrafo (e cada foto no meio dela) sobe quando chega perto
function entradaDaCarta(sec) {
  sec.querySelectorAll('.carta__texto > *').forEach((el) => {
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.85,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  })
}

/*
  A frase final: as palavras sobem de trás da linha de base, uma depois da outra, no ritmo de quem lê.
  (Letra por letra, caindo, uma frase comprida fica bagunçada demais.)
*/
function entradaDoFecho(sec) {
  const palavras = [...sec.querySelectorAll('.palavra')]
  const tl = gsap.timeline({
    scrollTrigger: { trigger: sec, start: 'top 55%', once: true },
    defaults: { ease: 'expo.out' },
  })
  palavras.forEach((palavra, i) => {
    tl.from(palavra.querySelectorAll('.mascara__letra'), { yPercent: 115, duration: 1, stagger: 0.012 }, i * 0.09)
  })
}

/*
  A surpresa, depois da frase final: primeiro a frase ("pensou que eu era o último?"), uma pausa,
  e o nome cai letra por letra, quicando; com o nome no chão, o vídeo pula para dentro da tela.
*/
function entradaDaSurpresa(sec) {
  const frase = sec.querySelector('.surpresa__frase')
  const letras = sec.querySelectorAll('.mascara__letra')
  const video = sec.querySelector('.surpresa__video')

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sec, start: 'top 40%', once: true },
    defaults: { ease: 'expo.out' },
  })
  tl.from(frase, { y: 28, opacity: 0, duration: 0.9 }, 0)
  tl.from(
    letras,
    {
      y: () => -window.innerHeight * 0.85,
      opacity: 0,
      rotation: () => gsap.utils.random(-32, 32),
      duration: 1.3,
      ease: 'bounce.out',
      stagger: { each: 0.12, from: 'random' },
    },
    1.1,
  )
  if (video) tl.from(video, { scale: 0.5, opacity: 0, duration: 0.8, ease: 'back.out(1.8)' }, '-=0.2')
}

// enquanto a cortina do próximo sobe, o conteúdo do atual sobe um pouco mais devagar
function sairPorBaixoDaCortina(sec, proxima) {
  const grade = sec.firstElementChild
  gsap.to(grade, {
    yPercent: -7,
    ease: 'none',
    scrollTrigger: { trigger: proxima, start: 'top bottom', end: 'top top', scrub: true },
  })
}
