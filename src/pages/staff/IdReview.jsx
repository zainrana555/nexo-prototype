import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, ShieldCheck, ScanFace, CircleCheck } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Badge, Tabs, Empty, Avatar } from '../../ui'
import { isExpired, can } from '../../logic'
import { IdViewer } from '../../Shared'

export default function IdReview() {
  const { state, dispatch, notify } = useStore()
  const [tab, setTab] = useState('pending')
  const [view, setView] = useState(null)
  const canReview = can(state, 'ids.review')
  const items = state.files.flatMap((f) => f.parties.flatMap((p) => p.ids.map((d, idx) => ({ f, p, d, idx }))))
  const shown = items.filter(({ d }) => (tab === 'pending' ? d.review === 'pending' : tab === 'flagged' ? isExpired(d.exp) || d.review === 'rejected' : d.review === 'approved'))
  const groups = shown.reduce((acc, it) => { const k = it.f.id + it.p.name; (acc[k] ??= { f: it.f, p: it.p, docs: [] }).docs.push(it); return acc }, {})
  const review = (it, decision) => {
    dispatch({ type: 'id/review', id: it.f.id, party: it.p.name, idx: it.idx, decision, docType: it.d.type })
    notify(`${it.d.type} ${decision} · ${it.p.name}`)
  }

  return (
    <>
      {view && <IdViewer doc={view.d} party={view.p} onClose={() => setView(null)} onDecide={canReview ? (dec) => review(view, dec) : null} />}
      <PageHeader title="ID review" sub="IDs read automatically (expiry, name match, face check). Approve or reject each one." />
      <Tabs value={tab} onChange={setTab} tabs={[
        { key: 'pending', label: 'To review', count: items.filter((i) => i.d.review === 'pending').length },
        { key: 'flagged', label: 'Flagged', count: items.filter((i) => isExpired(i.d.exp) || i.d.review === 'rejected').length },
        { key: 'approved', label: 'Approved', count: items.filter((i) => i.d.review === 'approved').length },
      ]} />
      {Object.values(groups).length === 0 && <div className="card"><Empty icon={ShieldCheck} title="Nothing here" sub="New uploads from clients appear here automatically." /></div>}
      <div className="stack-lg">
        {Object.values(groups).map(({ f, p, docs }) => (
          <section key={f.id + p.name} className="card stack">
            <div className="row">
              <Avatar name={p.name} size={40} />
              <div className="grow"><h2>{p.name}</h2><span className="small muted"><Link to={`/app/files/${f.id}?tab=parties`}>{f.id}</Link> · {f.type} · {p.role}</span></div>
              <span className={'row small ' + (p.liveness === 'Passed' ? 'ok' : 'muted')} style={{ gap: 4 }}><ScanFace size={16} /> Face check: {p.liveness}</span>
              {tab === 'pending' && docs.length > 1 && <button className="btn btn-primary btn-sm" onClick={() => docs.forEach((it) => !isExpired(it.d.exp) && review(it, 'approved'))}><CircleCheck size={15} /> Approve all</button>}
            </div>
            <div className="grid-2">
              {docs.map((it) => {
                const exp = isExpired(it.d.exp)
                return (
                  <div key={it.idx} className={'id-review' + (exp ? ' bad' : '')}>
                    <button className="id-image as-btn" onClick={() => setView(it)} aria-label={`View ${it.d.type} of ${it.p.name} full screen`}><span>{it.d.type} · front + back · click to enlarge</span></button>
                    <div className="stack" style={{ gap: 4 }}>
                      <b>{it.d.type}</b>
                      <span className="small"><span className="ok">✓</span> Document read automatically</span>
                      <span className="small"><span className="ok">✓</span> Name matches file: {p.name}</span>
                      <span className={'small ' + (exp ? 'warn' : '')}>{exp ? '⚠' : <span className="ok">✓</span>} Expiry {it.d.exp}{exp ? ' (expired)' : ''}</span>
                    </div>
                    <div className="row" style={{ marginTop: 'auto' }}>
                      {it.d.review === 'pending' && !exp && canReview ? (
                        <>
                          <button className="btn btn-sm" onClick={() => review(it, 'rejected')}><X size={15} /> Reject</button>
                          <button className="btn btn-primary btn-sm" onClick={() => review(it, 'approved')}><Check size={15} /> Approve</button>
                        </>
                      ) : <Badge tone={exp ? 'bad' : undefined}>{exp ? 'expired' : it.d.review}</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
