import { Lock, ArrowRight } from 'lucide-react'
import { useStore } from './store'
import { LOCKED, has } from './editions'

// Shown in the Core demo wherever a feature is outside the Core package.
export function LockedNote({ feature, compact }) {
  const { dispatch, notify } = useStore()
  const f = LOCKED[feature]
  return (
    <div className={'locked' + (compact ? ' compact' : '')}>
      <span className="locked-icon" aria-hidden="true"><Lock size={compact ? 14 : 18} /></span>
      <div className="grow">
        <b>{f.title}</b> <span className="badge gray">Not in Core</span>
        <p className="small muted" style={{ margin: '4px 0 0' }}>{f.instead}</p>
      </div>
      {!compact && <button className="btn btn-sm" onClick={() => { dispatch({ type: 'edition', edition: 'full' }); notify('Switched to the full features demo') }}>See it in the full features demo <ArrowRight size={14} /></button>}
    </div>
  )
}

// Wraps a page: renders it in the full demo, or a locked page in the Core demo.
export function Gate({ feature, client, children }) {
  const { state } = useStore()
  if (has(state, feature)) return children
  return <div className={client ? 'body' : 'stack'} style={{ maxWidth: 760 }}><LockedNote feature={feature} compact={client} /></div>
}
