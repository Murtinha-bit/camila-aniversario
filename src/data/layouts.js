import { fotosDe } from './fotos.js'

/*
  Escolhe o layout de cada capítulo.
    duas      duas fotos, como duas fotos impressas em cima da mesa
    paisagem  foto bem larga, de ponta a ponta, com o nome embaixo
    recado    recado curto em destaque, foto pequena
    retrato   o recado à esquerda, a foto em pé à direita, o nome no chão
    apoiada   o nome de ponta a ponta e a foto apoiada em cima dele
    nome      sem foto: o nome no chão, o recado no meio
    nome-meio sem foto: o nome no meio da tela, o recado embaixo à direita

  Quem tem `layout` no conteúdo usa esse. Os outros são escolhidos pela foto e pelo recado,
  sem repetir o layout do vizinho de cima. Foto deitada só vai para apoiada ou paisagem:
  as molduras dos outros são em pé e cortariam as pontas.
*/

export const LAYOUTS_COM_FOTO = ['retrato', 'apoiada', 'paisagem', 'duas', 'recado']
const DEITADA = 1.15 // largura / altura a partir da qual a foto é "deitada"
const LARGA = 1.8 // a partir daqui ela é larga o bastante para ir de ponta a ponta
const RECADO_CURTO = 60 // caracteres

// o que usar quando o layout ideal é o mesmo do vizinho
const ALTERNATIVAS = {
  retrato: ['apoiada'],
  apoiada: ['retrato'],
  recado: ['retrato', 'apoiada'],
  duas: ['retrato', 'apoiada'],
  nome: ['nome-meio'],
  'nome-meio': ['nome'],
}

// com foto deitada, as duas que a mostram inteira se revezam
const ALTERNATIVAS_DEITADA = {
  apoiada: ['paisagem'],
  paisagem: ['apoiada'],
}

const proporcao = (foto) => foto.imagem.img.w / foto.imagem.img.h

function ideal(fotos, recado) {
  if (!fotos.length) return 'nome'
  if (fotos.length > 1) return 'duas'
  if (proporcao(fotos[0]) >= LARGA) return 'paisagem'
  if (proporcao(fotos[0]) >= DEITADA) return 'apoiada'
  if (recado && recado.length <= RECADO_CURTO) return 'recado'
  return 'retrato'
}

// [{ pessoa, fotos, recado, layout }]
export function montarCapitulos(pessoas) {
  const lista = []
  for (const pessoa of pessoas) {
    const fotos = fotosDe(pessoa)
    const recado = (pessoa.mensagem ?? '').trim()
    const anterior = lista.at(-1)?.layout
    const deitada = fotos.length > 0 && proporcao(fotos[0]) >= DEITADA
    const forcado = fotos.length && LAYOUTS_COM_FOTO.includes(pessoa.layout) ? pessoa.layout : null
    let layout = forcado ?? ideal(fotos, recado)
    if (!forcado && layout === anterior) {
      const alternativas = (deitada && ALTERNATIVAS_DEITADA[layout]) || ALTERNATIVAS[layout]
      layout = alternativas.find((alt) => alt !== anterior) ?? layout
    }
    // "duas" precisa de duas fotos; com uma só, cai na que mostra a foto inteira
    if (layout === 'duas' && fotos.length < 2) layout = deitada ? 'apoiada' : 'retrato'
    lista.push({ pessoa, fotos, recado, layout })
  }
  return lista
}
