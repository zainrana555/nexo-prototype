import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Printer, Sparkles, Check, X, Inbox, TriangleAlert } from 'lucide-react'
import { useStore, now } from '../../store'
import { PageHeader, Tabs, Badge, Empty, Modal } from '../../ui'
import { can, isClosed } from '../../logic'
import { DEMO_FILE } from '../../data'

const pct = (n) => Math.round(n * 100) + '%'

export default function Fax() {
  const { state, dispatch, notify } = useStore()
  const [tab, setTab] = useState('review')
  const [open, setOpen] = useState(null)
  const allowed = can(state, 'fax.route')
  const list = state.faxes.filter((f) => (tab === 'all' ? true : tab === 'review' ? f.status === 'review' : f.status === tab))
  const fileOf = (id) => state.files.find((f) => f.id === id)

  // Simulates a new fax arriving through eFaxgate; for the demo file it's the lender's instructions.
  const simulate = () => {
    const demo = state.files.find((f) => f.id === DEMO_FILE && !isClosed(f))
    const fax = demo
      ? { id: 'fx' + Date.now(), received: now(), pages: 4, sender: 'Banque Exemple – Centre hypothécaire', senderFax: '514-555-0199', docType: 'Lender instructions', extracted: { client: demo.clients[0], reference: 'Prêt 77-40871', property: demo.addr }, confidence: 0.97, status: 'routed', fileId: demo.id, snippet: `INSTRUCTIONS AU NOTAIRE – Emprunteur : ${demo.clients[0]} – ${demo.addr}` }
      : { id: 'fx' + Date.now(), received: now(), pages: 1, sender: 'Notaire Exemple', senderFax: '418-555-0102', docType: 'Correspondence', extracted: { client: 'Unclear', reference: '—', property: '—' }, confidence: 0.35, status: 'review', suggestions: state.files.filter((f) => !isClosed(f)).slice(0, 2).map((f, i) => ({ fileId: f.id, score: 0.35 - i * 0.12, why: 'Partial name match' })), snippet: 'Objet : votre dossier – merci de confirmer la date de signature…' }
    dispatch({ type: 'fax/add', fax })
    notify(fax.status === 'routed' ? `Fax read by AI (${pct(fax.confidence)} match) → routed to file ${fax.fileId}` : 'Fax needs a human: added to the reception short list')
  }

  return (
    <>
      <PageHeader
        title="Fax inbox"
        sub="Faxes arrive by email from eFaxgate. AI reads each one and routes it to the right file, notary and paralegal. When unsure, it asks reception."
        actions={<button className="btn btn-primary" onClick={simulate}><Printer size={16} /> Simulate incoming fax</button>}
      />
      <div className="grid-4">
        <div className="kpi"><span className="kpi-icon"><Sparkles size={18} /></span><span className="small muted">Routed automatically today</span><span className="kpi-n">{state.faxes.filter((f) => f.status === 'routed' && !f.routedBy).length}</span></div>
        <div className={'kpi' + (state.faxes.some((f) => f.status === 'review') ? ' warn' : '')}><span className="kpi-icon"><TriangleAlert size={18} /></span><span className="small muted">Needs reception</span><span className="kpi-n">{state.faxes.filter((f) => f.status === 'review').length}</span></div>
        <div className="kpi"><span className="kpi-icon"><Check size={18} /></span><span className="small muted">Routed by staff</span><span className="kpi-n">{state.faxes.filter((f) => f.status === 'routed' && f.routedBy).length}</span></div>
        <div className="kpi"><span className="kpi-icon"><Inbox size={18} /></span><span className="small muted">Total today</span><span className="kpi-n">{state.faxes.length}</span></div>
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { key: 'review', label: 'Needs reception', count: state.faxes.filter((f) => f.status === 'review').length },
        { key: 'routed', label: 'Routed', count: state.faxes.filter((f) => f.status === 'routed').length },
        { key: 'dismissed', label: 'Not file-related', count: state.faxes.filter((f) => f.status === 'dismissed').length },
        { key: 'all', label: 'All' },
      ]} />
      {!allowed && <p className="banner warn small">Your role can view faxes but not route them (permission “Route unassigned faxes”).</p>}
      {list.length === 0 && <div className="card"><Empty icon={Inbox} title="Nothing here" sub="New faxes appear automatically." /></div>}
      <div className="stack">
        {list.map((f) => {
          const file = fileOf(f.fileId)
          return (
            <section key={f.id} className={'card fax-row' + (f.status === 'review' ? ' warn-card' : '')}>
              <button className="fax-thumb" onClick={() => setOpen(f)} aria-label={`Open fax from ${f.sender}`}><span>{f.pages} p.</span></button>
              <div className="grow stack" style={{ gap: 4 }}>
                <div className="row between"><b>{f.docType} · {f.sender}</b><span className="small muted">{f.received} · {f.senderFax}</span></div>
                <span className="small muted fax-snippet">{f.snippet}</span>
                <div className="row small" style={{ gap: 14 }}>
                  <span><Sparkles size={13} /> AI read: <b>{f.extracted.client}</b> · {f.extracted.reference} · {f.extracted.property}</span>
                  <span className="row" style={{ gap: 6 }}>Match <span className="conf"><span style={{ width: pct(f.confidence), background: f.confidence >= 0.85 ? 'var(--ok)' : f.confidence >= 0.5 ? '#d97706' : 'var(--bad)' }} /></span> {pct(f.confidence)}</span>
                </div>
                {f.status === 'routed' && file && <span className="small ok">✓ Routed to <Link to={`/app/files/${file.id}?tab=documents`}>{file.id} · {file.clients.join(' & ')}</Link> → {file.notary} and {file.paralegal} notified{f.routedBy ? ` (by ${f.routedBy})` : ' (automatic)'}</span>}
                {f.status === 'dismissed' && <span className="small muted">Marked not file-related{f.routedBy ? ` by ${f.routedBy}` : ''}</span>}
                {f.status === 'review' && (
                  <div className="stack" style={{ gap: 6, marginTop: 4 }}>
                    <span className="small"><b>AI is not sure.</b> {f.suggestions.length ? 'Suggested files:' : 'No likely file found.'}</span>
                    {f.suggestions.map((sg) => {
                      const sf = fileOf(sg.fileId)
                      return sf && (
                        <div key={sg.fileId} className="row suggestion">
                          <span className="grow small"><b>{sf.id} · {sf.clients.join(' & ')}</b> <span className="muted">({pct(sg.score)}) {sg.why}</span></span>
                          <button className="btn btn-sm btn-primary" disabled={!allowed} onClick={() => { dispatch({ type: 'fax/route', id: f.id, fileId: sf.id }); notify(`Routed to ${sf.id}; ${sf.notary} and ${sf.paralegal} notified`) }}>Route here</button>
                        </div>
                      )
                    })}
                    <div className="row">
                      <RouteOther fax={f} disabled={!allowed} />
                      <button className="btn btn-sm" disabled={!allowed} onClick={() => { dispatch({ type: 'fax/dismiss', id: f.id }); notify('Marked not file-related') }}><X size={14} /> Not file-related</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
      <p className="small muted">Matching uses a lookup table of client names, file numbers, property addresses and lender references. Faxes below the confidence threshold (85%) are never routed automatically.</p>
      {open && (
        <Modal title={`${open.docType} · ${open.sender}`} onClose={() => setOpen(null)} wide>
          <div className="fax-page"><p className="mono small">{open.received} · FROM {open.senderFax} · PAGE 1/{open.pages}</p><p style={{ whiteSpace: 'pre-line' }}>{open.snippet}</p><div className="ghost-line" style={{ width: '90%' }} /><div className="ghost-line" style={{ width: '80%' }} /><div className="ghost-line" style={{ width: '86%' }} /></div>
          <div className="kv"><span className="muted">AI extraction</span><span>{open.extracted.client} · {open.extracted.reference} · {open.extracted.property}</span></div>
        </Modal>
      )}
    </>
  )
}

function RouteOther({ fax, disabled }) {
  const { state, dispatch, notify } = useStore()
  const [v, setV] = useState('')
  return (
    <span className="row" style={{ gap: 4 }}>
      <label><span className="sr-only">Route to file</span>
        <select className="select" style={{ minHeight: 32, width: 220 }} value={v} disabled={disabled} onChange={(e) => setV(e.target.value)}>
          <option value="">Route to another file…</option>
          {state.files.filter((f) => !isClosed(f)).map((f) => <option key={f.id} value={f.id}>{f.id} · {f.clients.join(' & ')}</option>)}
        </select>
      </label>
      <button className="btn btn-sm" disabled={!v || disabled} onClick={() => { dispatch({ type: 'fax/route', id: fax.id, fileId: v }); notify(`Routed to ${v}`) }}>Route</button>
    </span>
  )
}
