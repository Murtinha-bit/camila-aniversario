import { cartaDeTeste, fotosDeTeste } from '../data/conteudoDeTeste.js'
import { namorado } from '../data/conteudo.js'
import { fotosDe } from '../data/fotos.js'
import Letras from './Letras.jsx'
import './Final.css'

/*
  O final: a pessoa 23. Três telas.
    1. o mosaico      fotos e quadrados de cor sem espaço entre eles; embaixo o nome e o 23,
                      que sai do contador (o contador some nesta tela)
    2. a carta        uma coluna de leitura; cada gesto anda mais ou menos uma tela
                      (só aparece se houver carta)
    3. o fecho        a frase final, gigante; o mosquito vira o pingo do "i" dela
*/

// As fotos do namorado são achadas por este nome de arquivo (Murtinha.jpeg, Murtinha 2.jpeg...),
// porque o nome que aparece no site é uma frase.
const NOME_DOS_ARQUIVOS = 'Murtinha'

// O mosaico: 6 colunas por 2 linhas no computador, 3 por 2 no celular (as áreas estão no CSS).
// As fotos vão para as células com `foto` (a "a" é larga, as outras são em pé, no formato de foto de celular);
// sem foto suficiente, a célula vira um quadrado de cor.
const CELULAS = [
  { area: 'a', foto: 0 },
  { area: 'b', foto: 1 },
  { area: 'c', cor: 'tangerina' },
  { area: 'd', foto: 2 },
  { area: 'e', cor: 'pistache' },
  { area: 'f', foto: 3 },
  { area: 'g', foto: 4 },
  { area: 'h', cor: 'rosa' },
  { area: 'i', foto: 5 },
  { area: 'j', foto: 6 },
]
const COR_NO_LUGAR_DA_FOTO = ['pistache', 'rosa', 'tangerina', 'verde', 'rosa', 'pistache', 'tangerina']
const FOTOS_NO_MOSAICO = 7

const proporcao = (foto) => foto.imagem.img.w / foto.imagem.img.h

/*
  Escolhe as fotos do mosaico pelo formato, para cortar o mínimo:
  a célula larga (mais ou menos 6:5) fica com a foto deitada ou quadrada de formato mais parecido;
  as em pé, com as fotos em pé, na ordem. Devolve [mosaico, as que sobram], na ordem dos arquivos.
*/
const FORMATO_DA_LARGA = 1.2
const distancia = (foto) => Math.abs(Math.log(proporcao(foto) / FORMATO_DA_LARGA))

function separarFotos(fotos) {
  const deitadas = fotos.filter((f) => proporcao(f) >= 0.9)
  const larga = deitadas.reduce((melhor, f) => (distancia(f) < distancia(melhor) ? f : melhor), deitadas[0]) ?? fotos[0]
  const emPe = fotos.filter((f) => f !== larga && proporcao(f) < 0.9)
  const outras = fotos.filter((f) => f !== larga && proporcao(f) >= 0.9)
  const mosaico = [larga, ...emPe, ...outras].filter(Boolean).slice(0, FOTOS_NO_MOSAICO)
  return [mosaico, fotos.filter((f) => !mosaico.includes(f))]
}

function Imagem({ foto, alt, tamanhos }) {
  return (
    <picture>
      {Object.entries(foto.imagem.sources).map(([formato, srcset]) => (
        <source key={formato} type={`image/${formato}`} srcSet={srcset} sizes={tamanhos} />
      ))}
      <img
        src={foto.imagem.img.src}
        width={foto.imagem.img.w}
        height={foto.imagem.img.h}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: foto.foco }}
      />
    </picture>
  )
}

export default function Final({ numero }) {
  const todas = fotosDeTeste(fotosDe(namorado, NOME_DOS_ARQUIVOS))
  const [fotos, extras] = separarFotos(todas)
  const carta = (cartaDeTeste(namorado.carta) ?? '').trim()
  const paragrafos = carta ? carta.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : []
  // as fotos que sobram entram na carta, espalhadas entre os parágrafos;
  // as que não couberem entre eles ficam todas juntas depois do texto
  const cadaQuantos = Math.max(1, Math.floor(paragrafos.length / (extras.length + 1)))
  const noMeio = Math.min(extras.length, Math.floor((paragrafos.length - 1) / cadaQuantos))
  const depois = extras.slice(noMeio)
  const frase = namorado.fraseFinal?.trim() || 'Feliz 23, mosquito.'
  const alt = (foto) => `${namorado.nome} e Camila, foto ${todas.indexOf(foto) + 1}`

  return (
    <>
      <section
        className="capitulo final"
        data-campo="noite"
        data-numero={numero}
        data-entrada="final"
        data-sem-contador
        aria-labelledby="final-nome"
        style={{
          '--letras': [...namorado.nome].length,
          '--letras-palavra': Math.max(...namorado.nome.split(/\s+/).map((p) => [...p].length)),
        }}
      >
        <div className="final__grade">
          <div className="final__mosaico">
            {CELULAS.map((celula) => {
              const foto = celula.foto !== undefined ? fotos[celula.foto] : null
              const cor = celula.cor ?? COR_NO_LUGAR_DA_FOTO[celula.foto]
              return (
                <div
                  key={celula.area}
                  className={`final__celula final__celula--${celula.area}`}
                  data-campo={foto ? undefined : cor}
                >
                  {foto ? (
                    <Imagem foto={foto} alt={alt(foto)} tamanhos="(min-width: 900px) 34vw, 67vw" />
                  ) : (
                    <span className="final__cor" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="final__rodape">
            <h2 id="final-nome" className="final__nome" translate="no">
              <span className="so-leitor">{namorado.nome}</span>
              <Letras texto={namorado.nome} />
            </h2>
            <p className="final__idade" aria-hidden="true">
              23
            </p>
          </div>
        </div>
      </section>

      {paragrafos.length > 0 && (
        <section
          className="capitulo carta"
          data-campo="noite"
          data-numero={numero}
          data-entrada="carta"
          data-paginar
          aria-labelledby="carta-titulo"
        >
          <div className="carta__grade">
            <h2 id="carta-titulo" className="so-leitor">
              Carta de {namorado.nome}
            </h2>
            <div className="carta__texto">
              {paragrafos.map((paragrafo, i) => {
                const indiceExtra = (i + 1) / cadaQuantos - 1
                const extra = (i + 1) % cadaQuantos === 0 ? extras[indiceExtra] : null
                return [
                  <p key={`p${i}`}>{paragrafo}</p>,
                  extra && i < paragrafos.length - 1 && (
                    <figure key={`f${i}`} className="carta__foto">
                      <Imagem foto={extra} alt={alt(extra)} tamanhos="(min-width: 900px) 40vw, 92vw" />
                    </figure>
                  ),
                ]
              })}
            </div>

            {depois.length > 0 && (
              <div className="carta__fotos">
                {depois.map((foto) => (
                  <figure key={todas.indexOf(foto)} className="carta__foto">
                    <Imagem foto={foto} alt={alt(foto)} tamanhos="(min-width: 900px) 40vw, 92vw" />
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section
        className="capitulo fecho"
        data-campo="rosa"
        data-numero={numero}
        data-entrada="fecho"
        aria-labelledby="fecho-frase"
        style={{
          '--letras-palavra': Math.max(...frase.split(/\s+/).map((p) => [...p].length)),
          // para a frase toda caber na tela: quanto mais letras, menor (a área cai com o quadrado do tamanho)
          '--raiz-letras': (1 / Math.sqrt([...frase].length)).toFixed(4),
        }}
      >
        <div className="fecho__grade">
          <h2 id="fecho-frase" className="fecho__frase">
            <span className="so-leitor">{frase}</span>
            <Letras texto={frase} />
          </h2>
        </div>
      </section>
    </>
  )
}
