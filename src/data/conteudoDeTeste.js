import { todasAsFotos } from './fotos.js'

/*
  Conteúdo de mentira, só para ver os layouts enquanto o de verdade não chega.
  Aparece apenas no `npm run dev`, no lugar do que está vazio. No build, este arquivo some.
    carta    se a carta do final estiver vazia
    fotos    se ainda não houver Murtinha.jpeg: usa as fotos dos amigos
  Quem está com `mensagem: ''` aparece sem recado, como vai ficar no site.
*/

const CARTA = `Carta de teste. Este texto existe só para mostrar o tamanho da letra, a largura da coluna e o ritmo da leitura. No site de verdade, aqui entra a carta que você vai escrever.

Cada parágrafo é separado por uma linha em branco. Um parágrafo pode ser curto.

Ou pode ser comprido, com várias frases seguidas, contando uma história inteira: onde vocês estavam, o que aconteceu, quem riu primeiro e por que aquilo ainda é engraçado. A coluna tem a largura de uma página de livro, para os olhos não se perderem no fim de cada linha.

Na tela do notebook, cada gesto no trackpad anda mais ou menos uma tela de carta. Assim ela lê no próprio ritmo, sem pular nada.

Mais um parágrafo de teste, para a carta passar da altura de uma tela e dar para conferir as paradas no meio da leitura.

Se houver mais de quatro fotos, a quinta em diante aparece entre os parágrafos, como esta logo acima.

E o último parágrafo fecha a carta. Depois dele, a cortina sobe com a frase final.`

export function cartaDeTeste(carta) {
  if (!import.meta.env.DEV || carta?.trim()) return carta
  return CARTA
}

export function fotosDeTeste(fotos) {
  if (!import.meta.env.DEV || fotos.length) return fotos
  return todasAsFotos()
}
