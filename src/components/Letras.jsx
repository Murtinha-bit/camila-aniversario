import { Fragment } from 'react'

/*
  As letras de um nome (ou frase) grande, cada uma na sua máscara, para as entradas animarem.
  Cada palavra fica inteira; entre palavras o texto pode quebrar.
  O primeiro "i" perde o pingo (ı): o mosquito é o pingo (motion/companheiro.js).
  Sem "i" minúsculo, um "I" maiúsculo vira o lugar onde ele procura o pingo.
*/
export default function Letras({ texto }) {
  const palavras = texto.split(/\s+/)
  const indicePingo = texto.indexOf('i')
  const indiceMaiusculo = indicePingo < 0 ? texto.indexOf('I') : -1
  const inicioDa = (p) => palavras.slice(0, p).reduce((soma, palavra) => soma + palavra.length + 1, 0)

  return (
    <span className="pessoa__letras" aria-hidden="true">
      {palavras.map((palavra, p) => (
        <Fragment key={p}>
          {p > 0 && ' '}
          <span className="palavra">
            {[...palavra].map((ch, i) => {
              const indice = inicioDa(p) + i
              const pingo = indice === indicePingo ? 'i' : indice === indiceMaiusculo ? 'I' : null
              return (
                <span key={i} className="mascara">
                  <span className="mascara__letra">
                    {pingo === 'i' ? 'ı' : ch}
                    {pingo && <span className="sonda" data-pingo={pingo} />}
                  </span>
                </span>
              )
            })}
          </span>
        </Fragment>
      ))}
    </span>
  )
}
