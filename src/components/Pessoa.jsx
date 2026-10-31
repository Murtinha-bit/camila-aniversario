import Letras from './Letras.jsx'
import './Pessoa.css'

const RECADO_LONGO = 140 // caracteres; acima disso o recado usa um tamanho menor

// a largura de cada foto na tela, para o navegador baixar o tamanho certo
const TAMANHOS = {
  retrato: ['(min-width: 900px) 42vw, 92vw'],
  apoiada: ['(min-width: 900px) 48vw, 92vw'],
  paisagem: ['(min-width: 900px) 96vw, 92vw'],
  recado: ['(min-width: 900px) 24vw, 92vw'],
  duas: ['(min-width: 900px) 34vw, 78vw', '(min-width: 900px) 24vw, 48vw'],
}

// a proporção da foto, limitada entre 3:4 (em pé) e 12:5 (panorâmica): a moldura segue a foto, sem cortar rosto
const proporcaoDaMoldura = (foto) => Math.min(Math.max(foto.imagem.img.w / foto.imagem.img.h, 0.75), 2.4)

/*
  Um capítulo: uma pessoa, um campo de cor.
  O layout vem de data/layouts.js e a entrada de motion/capitulos.js (pelo data-entrada).
  No celular todos viram a mesma coluna: foto, nome, recado.
*/
export default function Pessoa({ pessoa, fotos, recado, layout, numero, campo, entrada }) {
  const idTitulo = `pessoa-${numero}`
  const letras = [...pessoa.nome]
  // no celular, sem foto, o nome quebra entre as palavras: o tamanho vem da mais longa
  const maiorPalavra = Math.max(...pessoa.nome.split(/\s+/).map((p) => [...p].length))
  const longo = recado.length > RECADO_LONGO
  const semFoto = !fotos.length
  const visiveis = layout === 'duas' ? fotos.slice(0, 2) : fotos.slice(0, 1)

  return (
    <section
      className={`capitulo pessoa pessoa--${layout}${semFoto ? ' pessoa--sem-foto' : ''}`}
      data-campo={campo}
      data-numero={numero}
      data-entrada={entrada}
      aria-labelledby={idTitulo}
      style={{ '--letras': letras.length, '--letras-palavra': maiorPalavra, '--inclinar': numero % 2 ? '-2.5deg' : '2.5deg' }}
    >
      <div className="pessoa__grade">
        <h2 id={idTitulo} className="pessoa__nome" translate="no">
          <span className="so-leitor">{pessoa.nome}</span>
          <Letras texto={pessoa.nome} />
        </h2>

        {recado && (
          <blockquote className={`pessoa__recado${longo ? ' pessoa__recado--longo' : ''}`}>
            <p>{recado}</p>
          </blockquote>
        )}

        {visiveis.map((foto, i) => (
          <figure
            key={i}
            className={`pessoa__foto pessoa__foto--${i + 1}`}
            style={{ '--proporcao': proporcaoDaMoldura(foto) }}
          >
            <div className="pessoa__janela">
              <div className="pessoa__moldura">
                <picture className="pessoa__imagem">
                  {Object.entries(foto.imagem.sources).map(([formato, srcset]) => (
                    <source
                      key={formato}
                      type={`image/${formato}`}
                      srcSet={srcset}
                      sizes={TAMANHOS[layout]?.[i] ?? TAMANHOS.retrato[0]}
                    />
                  ))}
                  <img
                    src={foto.imagem.img.src}
                    width={foto.imagem.img.w}
                    height={foto.imagem.img.h}
                    alt={visiveis.length > 1 ? `${pessoa.nome} e Camila, foto ${i + 1}` : `${pessoa.nome} e Camila`}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: foto.foco }}
                  />
                </picture>
              </div>
            </div>
          </figure>
        ))}
      </div>
    </section>
  )
}
