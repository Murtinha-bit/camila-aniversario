import { useEffect, useRef } from 'react'
import { criarCompanheiro } from '../motion/companheiro.js'
import { DesenhoMosquito } from './Mosquito.jsx'
import './Companheiro.css'

// O mosquito que acompanha os capítulos (o voo está em motion/companheiro.js). É só enfeite.
export default function Companheiro({ mainRef, reduzido }) {
  const ref = useRef(null)

  useEffect(() => criarCompanheiro({ main: mainRef.current, el: ref.current, reduzido }), [mainRef, reduzido])

  return (
    <div ref={ref} className="companheiro" aria-hidden="true" hidden>
      <DesenhoMosquito />
    </div>
  )
}
