/*
  Mede onde fica o pingo do "i" na fonte da abertura, desenhando a letra num canvas.
  Devolve, em pixels para o tamanho pedido:
    dx  deslocamento horizontal do centro do pingo em relação ao centro da letra
    dy  altura do centro do pingo em relação à linha de base (negativo = acima)
    raio
    avanco  largura da letra
*/

const BASE = 200
let cache = null

export function medirPingo(familia, peso, tamanho) {
  if (!cache || cache.familia !== familia || cache.peso !== peso) {
    cache = { familia, peso, medida: medir(familia, peso) }
  }
  const f = tamanho / BASE
  const m = cache.medida
  return { dx: m.dx * f, dy: m.dy * f, raio: m.raio * f, avanco: m.avanco * f }
}

function medir(familia, peso) {
  const largura = BASE * 1.2
  const altura = BASE * 1.4
  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.font = `${peso} ${BASE}px ${familia}`
  ctx.textBaseline = 'alphabetic'
  const x0 = 40
  const base = Math.round(BASE * 1.1)
  ctx.fillText('i', x0, base)
  const avanco = ctx.measureText('i').width
  const { data } = ctx.getImageData(0, 0, largura, altura)

  const temTinta = (y) => {
    for (let x = 0; x < largura; x++) if (data[(y * largura + x) * 4 + 3] > 128) return true
    return false
  }

  let topo = -1
  let fim = -1
  for (let y = 0; y < base; y++) {
    const tinta = temTinta(y)
    if (tinta && topo < 0) topo = y
    if (!tinta && topo >= 0) {
      fim = y
      break
    }
  }
  if (topo < 0 || fim < 0) return { dx: 0, dy: -BASE * 0.72, raio: BASE * 0.07, avanco }

  let esq = largura
  let dir = 0
  for (let y = topo; y < fim; y++) {
    for (let x = 0; x < largura; x++) {
      if (data[(y * largura + x) * 4 + 3] > 128) {
        if (x < esq) esq = x
        if (x > dir) dir = x
      }
    }
  }
  return {
    dx: (esq + dir) / 2 - (x0 + avanco / 2),
    dy: (topo + fim) / 2 - base,
    raio: (dir - esq) / 2,
    avanco,
  }
}
