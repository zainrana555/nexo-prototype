import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useStore } from '../store'

// Shareable links: #/demo/core opens the restricted C$50k demo, #/demo/full the full features demo.
export default function EditionSwitch() {
  const { edition } = useParams()
  const { state, dispatch } = useStore()
  const target = edition === 'core' ? 'core' : 'full'
  useEffect(() => { if (state.edition !== target) dispatch({ type: 'edition', edition: target }) }, [target, state.edition, dispatch])
  return state.edition === target ? <Navigate to="/login" replace /> : null
}
