import { useRef, useState } from 'react'
import { surpresa } from '../data/conteudo.js'
import Letras from './Letras.jsx'
import './Pessoa.css'
import './Surpresa.css'

// Os vídeos de src/videos/ viram arquivos do site no build
const videos = import.meta.glob('../videos/*.{mp4,webm,MP4,WEBM}', { eager: true, query: '?url', import: 'default' })
const arquivoDoVideo = Object.entries(videos).find(([caminho]) => caminho.split('/').pop() === surpresa.video)?.[1]

/*
  A surpresa, depois da frase final: "pensou que eu era o último?". O contador mostra 24 / 23.
  Usa o layout "apoiada" dos capítulos (Pessoa.css): a frase à esquerda, o vídeo em pé em cima do nome.
  A entrada (motion/capitulos.js): a frase sobe, o nome cai letra por letra e só então o vídeo aparece.

  O vídeo fica num quadro (moldura e passe-partout), com controles próprios: um toque em qualquer
  lugar do vídeo toca ou pausa, e uma barrinha embaixo mostra quanto já passou. Ele só toca com o
  clique: o navegador não deixa um vídeo com som tocar sozinho.
*/
export default function Surpresa({ numero }) {
  const videoRef = useRef(null)
  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  // até o vídeo dizer o formato dele, o quadro é em pé, como vídeo de celular
  const [proporcao, setProporcao] = useState(9 / 16)
  const letras = [...surpresa.nome]

  const alternar = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  return (
    <section
      className="capitulo pessoa pessoa--apoiada surpresa"
      data-campo="tangerina"
      data-numero={numero}
      data-entrada="surpresa"
      aria-labelledby="surpresa-nome"
      style={{ '--letras': letras.length, '--letras-palavra': letras.length, '--inclinar': '2.5deg' }}
    >
      <div className="pessoa__grade">
        <h2 id="surpresa-nome" className="pessoa__nome" translate="no">
          <span className="so-leitor">{surpresa.nome}</span>
          <Letras texto={surpresa.nome} />
        </h2>

        <p className="pessoa__recado surpresa__frase">{surpresa.frase}</p>

        {arquivoDoVideo && (
          <figure className="pessoa__foto surpresa__video" style={{ '--proporcao': proporcao }}>
            <div className="surpresa__passepartout">
              <div className="surpresa__tela">
                {/* #t=0.1: mostra o primeiro quadro do vídeo antes do play */}
                <video
                  ref={videoRef}
                  src={`${arquivoDoVideo}#t=0.1`}
                  preload="metadata"
                  playsInline
                  onLoadedMetadata={(e) => {
                    const { videoWidth: w, videoHeight: h } = e.currentTarget
                    if (w && h) setProporcao(Math.min(Math.max(w / h, 0.5), 2))
                  }}
                  onPlay={() => setTocando(true)}
                  onPause={() => setTocando(false)}
                  onTimeUpdate={(e) => setProgresso(e.currentTarget.currentTime / e.currentTarget.duration || 0)}
                  aria-label={`Vídeo de ${surpresa.nome}`}
                />
                <button
                  type="button"
                  className={`surpresa__botao${tocando ? ' surpresa__botao--tocando' : ''}`}
                  onClick={alternar}
                  aria-label={tocando ? 'Pausar o vídeo' : `Tocar o vídeo de ${surpresa.nome}`}
                >
                  <span className="surpresa__icone">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      {tocando ? <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
                    </svg>
                  </span>
                </button>
                <span className="surpresa__progresso" style={{ '--progresso': progresso }} aria-hidden="true" />
              </div>
            </div>
          </figure>
        )}
      </div>
    </section>
  )
}
