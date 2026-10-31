/*
  Liga as fotos de src/fotos/ às pessoas pelo nome do arquivo.
    Bianca.jpeg            → foto da Bianca
    Bianca 2.jpeg          → segunda foto da Bianca
    Vó Cida.jpg            → foto da Vó Cida (acento e maiúscula não importam)

  No build, cada foto vira AVIF, WebP e JPG em três larguras, para carregar rápido no 4G.
*/

const arquivos = import.meta.glob('../fotos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
  query: '?w=480;800;1080&format=avif;webp;jpg&as=picture',
})

const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

// [{ base: 'bianca', ordem: 1, arquivo: 'Bianca.jpeg', imagem }]
const catalogo = Object.entries(arquivos).map(([caminho, imagem]) => {
  const arquivo = caminho.split('/').pop()
  // trim: "Murtinha 13 .jpeg" (com espaço antes do ponto) também vale
  const semExtensao = arquivo.replace(/\.[^.]+$/, '').trim()
  const numero = semExtensao.match(/[\s_-]*(\d+)$/)
  return {
    base: normalizar(numero ? semExtensao.slice(0, numero.index) : semExtensao),
    ordem: numero ? Number(numero[1]) : 1,
    arquivo,
    imagem,
  }
})

// Todas as fotos da pasta, na ordem do nome do arquivo. Só para testes (data/conteudoDeTeste.js).
export const todasAsFotos = () =>
  [...catalogo].sort((a, b) => a.arquivo.localeCompare(b.arquivo)).map((c) => ({ imagem: c.imagem, foco: '50% 40%' }))

/*
  Devolve as fotos de uma pessoa: [{ imagem, foco }]
  Se a pessoa tiver `fotos: ['arquivo.jpg']` no conteúdo, usa essa lista; senão, procura pelo nome
  (ou por `nomeDosArquivos`, quando o nome que aparece no site é outro: o do namorado é uma frase).
*/
export function fotosDe(pessoa, nomeDosArquivos = pessoa.nome) {
  const foco = pessoa.foco ?? '50% 50%'
  const escolhidas = pessoa.fotos?.length
    ? pessoa.fotos.map((nome) => catalogo.find((c) => c.arquivo === nome)).filter(Boolean)
    : catalogo.filter((c) => c.base === normalizar(nomeDosArquivos)).sort((a, b) => a.ordem - b.ordem)
  return escolhidas.map((c) => ({ imagem: c.imagem, foco }))
}
