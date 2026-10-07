import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Mail, Phone, Globe, Users, Send, FolderOpen, Columns3, List, MessageSquare, X, RotateCcw, Bot, CalendarDays, Video } from 'lucide-react'
import { BookModal } from './Calendar'
import { useStore, now } from '../../store'
import { PageHeader, Badge, Modal, Avatar, Tabs } from '../../ui'
import { LEAD_COLUMNS, addDays } from '../../data'
import { computeFees, money, fmtDate } from '../../logic'

const SOURCE_ICON = { Email: Mail, 'Website form': Globe, 'Broker referral': Users, Phone, 'AI phone agent': Bot }

export default function Leads() {
  const { state } = useStore()
  const nav = useNavigate()
  const [view, setView] = useState('board')
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Leads"
        sub="Inbound pricing requests: quote, send the mini-mandate, convert to a file"
        actions={<>
          <div className="seg light" role="group" aria-label="View">
            <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><Columns3 size={15} /> Board</button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><List size={15} /> List</button>
          </div>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ New lead</button>
        </>}
      />

      {view === 'board' ? (
        <div className="board">
          {LEAD_COLUMNS.map((c) => {
            const items = state.leads.filter((l) => l.status === c)
            return (
              <section key={c} className="board-col">
                <div className="row between"><b>{c}</b><span className="nav-count quiet">{items.length}</span></div>
                {items.map((l) => {
                  const Icon = SOURCE_ICON[l.source] ?? Mail
                  return (
                    <Link key={l.id} to={`/app/leads/${l.id}`} className={'lead-card' + (l.isDemo && l.status === 'New' ? ' pulse' : '')}>
                      <div className="row between"><b>{l.name}</b><span className="small muted">{l.received}</span></div>
                      <span className="small muted">{l.type} · {l.property.split(',').pop()}</span>
                      <div className="row between">
                        <span className="small muted row" style={{ gap: 4 }}><Icon size={13} /> {l.source}</span>
                        {l.quote ? <span className="small mono">{money(l.quote)}</span> : <Badge tone="blue">{l.lang}</Badge>}
                      </div>
                    </Link>
                  )
                })}
                {items.length === 0 && <p className="small muted" style={{ padding: 8 }}>No leads</p>}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Lead</th><th>Name</th><th>Type</th><th>Source</th><th>Received</th><th>Quote</th><th>Status</th></tr></thead>
            <tbody>
              {state.leads.map((l) => (
                <tr key={l.id} onClick={() => nav(`/app/leads/${l.id}`)}>
                  <td className="mono small">{l.id}</td><td><b>{l.name}</b></td><td>{l.type}</td><td>{l.source}</td>
                  <td className="muted">{l.received}</td><td className="mono">{l.quote ? money(l.quote) : '—'}</td><td><Badge>{l.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {adding && <NewLeadModal onClose={() => setAdding(false)} />}
    </>
  )
}

export function NewLeadModal({ onClose }) {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', source: 'Phone', type: 'Purchase', property: '', lang: 'FR', message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const id = 'L-' + (1044 + state.leads.length)
    dispatch({ type: 'lead/add', lead: { ...f, id, name: f.name || 'New contact', property: f.property || '—', status: 'New', received: now(), closingDate: addDays(30), log: [{ t: now(), e: `Lead created (${f.source})`, who: state.auth?.name ?? 'System' }] } })
    notify(`Lead ${id} created`)
    onClose()
    nav(`/app/leads/${id}`)
  }
  return (
    <Modal title="New lead" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <div className="grid-2">
          <label className="field"><span>Full name</span><input className="input" value={f.name} onChange={set('name')} autoFocus /></label>
          <label className="field"><span>Source</span><select className="select" value={f.source} onChange={set('source')}>{['Phone', 'Email', 'Website form', 'Broker referral'].map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="field"><span>Email</span><input className="input" type="email" value={f.email} onChange={set('email')} /></label>
          <label className="field"><span>Phone</span><input className="input" value={f.phone} onChange={set('phone')} /></label>
          <label className="field"><span>Transaction</span><select className="select" value={f.type} onChange={set('type')}><option>Purchase</option><option>Sale</option><option>Refinance</option></select></label>
          <label className="field"><span>Language</span><select className="select" value={f.lang} onChange={set('lang')}><option>FR</option><option>EN</option></select></label>
        </div>
        <label className="field"><span>Property (address, city)</span><input className="input" value={f.property} onChange={set('property')} /></label>
        <label className="field"><span>Notes</span><textarea className="input" value={f.message} onChange={set('message')} rows={3} /></label>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary">Create lead</button></div>
      </form>
    </Modal>
  )
}

export function LeadDetail() {
  const { id } = useParams()
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const lead = state.leads.find((l) => l.id === id)
  const [modal, setModal] = useState(null)
  const [tab, setTab] = useState('inquiry')
  if (!lead) return <p>Lead not found. <Link to="/app/leads">Back to leads</Link></p>
  const Icon = SOURCE_ICON[lead.source] ?? Mail
  const consult = state.events.find((e) => e.leadId === lead.id && e.kind === 'consultation' && e.status !== 'cancelled')
  const open = ['New', 'Mini-mandate sent', 'Follow-up'].includes(lead.status)

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Leads', to: '/app/leads' }, { label: lead.id }]}
        title={lead.name}
        sub={`${lead.type} · ${lead.property}`}
        actions={<>
          {lead.status === 'New' && <button className="btn btn-primary" onClick={() => setModal('mandate')}><Send size={16} /> Send mini-mandate</button>}
          {['Mini-mandate sent', 'Follow-up'].includes(lead.status) && <>
            <button className="btn" onClick={() => { dispatch({ type: 'lead/followup', id }); notify('Follow-up email sent') }}><Mail size={16} /> Send follow-up</button>
            <button className="btn btn-primary" onClick={() => { dispatch({ type: 'lead/accept', id }); notify('Converted to file') }}><FolderOpen size={16} /> Convert to file</button>
          </>}
          {lead.fileId && <button className="btn btn-primary" onClick={() => nav(`/app/files/${lead.fileId}`)}><FolderOpen size={16} /> Open file {lead.fileId}</button>}
          {open && <button className="btn" onClick={() => setModal('lost')}><X size={16} /> Mark lost</button>}
          {lead.status === 'Lost' && <button className="btn" onClick={() => dispatch({ type: 'lead/reopen', id })}><RotateCcw size={16} /> Reopen</button>}
        </>}
      />

      <div className="stepper">
        {['New', 'Mini-mandate sent', 'Accepted', 'File opened'].map((s, i) => {
          const reached = lead.status === 'Lost' ? i === 0 : i <= (lead.status === 'New' ? 0 : lead.status === 'Won' ? 3 : 1)
          return <div key={s} className={'step' + (reached ? ' on' : '')}><span>{i + 1}</span>{s}</div>
        })}
        {lead.status === 'Lost' && <Badge>Lost</Badge>}
      </div>

      {lead.isDemo && lead.status === 'Mini-mandate sent' && (
        <p className="banner info">Demo: switch to <Link to="/client">Client view · Émilie</Link> to see the email and accept the quote.</p>
      )}

      <div className="split">
        <div className="main stack-lg">
          <section className="card">
            <Tabs value={tab} onChange={setTab} tabs={[{ key: 'inquiry', label: lead.transcript ? 'Call summary' : 'Inquiry' }, ...(lead.transcript ? [{ key: 'transcript', label: 'Transcript' }] : []), { key: 'activity', label: 'Activity', count: lead.log.length }]} />
            {tab === 'transcript' ? (
              <div className="transcript">
                <p className="small muted">AI phone agent · {lead.callMinutes} min · about ${(lead.callMinutes * 0.4).toFixed(2)} at $0.40/min</p>
                {lead.transcript.map(([who, line], i) => <div key={i} className={'tr-line' + (who.startsWith('Agent') ? ' agent' : '')}><b>{who}</b><span>{line}</span></div>)}
              </div>
            ) : tab === 'inquiry' ? (
              <div className="email-msg">
                <div className="row" style={{ gap: 10 }}>
                  <Avatar name={lead.name} />
                  <div className="grow"><b>{lead.name}</b> <span className="small muted">&lt;{lead.email}&gt;</span><div className="small muted">{lead.received} · via {lead.source}</div></div>
                </div>
                <p style={{ whiteSpace: 'pre-line', marginTop: 14, lineHeight: 1.6 }}>{lead.message || '—'}</p>
              </div>
            ) : (
              <div className="timeline">{lead.log.map((l, i) => <div key={i}><span className="small muted">{l.t} · {l.who}</span><div>{l.e}</div></div>)}</div>
            )}
          </section>
          <section className="card stack">
            <h2>Add a note</h2>
            <NoteBox onAdd={(e) => { dispatch({ type: 'lead/log', id, e }); notify('Note added'); setTab('activity') }} />
          </section>
        </div>
        <aside className="side stack-lg">
          <section className="card stack" style={{ gap: 8 }}>
            <h2>Details</h2>
            <div className="kv"><span className="muted">Status</span><Badge>{lead.status}</Badge></div>
            <div className="kv"><span className="muted">Source</span><span className="row" style={{ gap: 4 }}><Icon size={14} />{lead.source}</span></div>
            <div className="kv"><span className="muted">Email</span><span>{lead.email}</span></div>
            <div className="kv"><span className="muted">Phone</span><span>{lead.phone}</span></div>
            <div className="kv"><span className="muted">Language</span><span>{lead.lang}</span></div>
            <div className="kv"><span className="muted">Target signing</span><span>{fmtDate(lead.closingDate)}</span></div>
            <div className="kv"><span className="muted">Quote</span><span className="mono">{lead.quote ? money(lead.quote) : '—'}</span></div>
            {lead.lostReason && <div className="kv"><span className="muted">Lost reason</span><span>{lead.lostReason}</span></div>}
            {consult && <div className="consult-box"><span className="small muted">Consultation booked</span><b>{fmtDate(consult.date)} · {consult.time}</b><span className="small row" style={{ gap: 4 }}>{consult.mode === 'Teams video' && <Video size={13} />}{consult.mode} · {consult.who}</span></div>}
          </section>
          <section className="card stack" style={{ gap: 8 }}>
            <h2>Quick actions</h2>
            <button className="btn" onClick={() => { dispatch({ type: 'lead/log', id, e: 'Call logged: left voicemail' }); notify('Call logged') }}><Phone size={16} /> Log a call</button>
            <button className="btn" onClick={() => { dispatch({ type: 'lead/log', id, e: 'Email reply sent' }); notify('Reply sent') }}><MessageSquare size={16} /> Reply by email</button>
            <button className="btn" onClick={() => { dispatch({ type: 'lead/consultLink', id }); notify('Consultation booking link emailed') }}><Send size={16} /> Send consultation link</button>
            <button className="btn" onClick={() => setModal('consult')}><CalendarDays size={16} /> Book consultation</button>
          </section>
        </aside>
      </div>

      {modal === 'mandate' && <MandateModal lead={lead} onClose={() => setModal(null)} />}
      {modal === 'consult' && <BookModal leadId={lead.id} onClose={() => setModal(null)} />}
      {modal === 'lost' && (
        <LostModal onClose={() => setModal(null)} onSave={(reason) => { dispatch({ type: 'lead/lost', id, reason }); setModal(null); notify('Lead marked lost') }} />
      )}
    </>
  )
}

function NoteBox({ onAdd }) {
  const [v, setV] = useState('')
  return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV('') } }}>
      <label className="grow"><span className="sr-only">Note</span><input className="input" value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. Client prefers French, signing likely in Laval" /></label>
      <button className="btn">Add note</button>
    </form>
  )
}

function LostModal({ onClose, onSave }) {
  const [r, setR] = useState('Chose another notary (price)')
  return (
    <Modal title="Mark lead as lost" onClose={onClose}>
      <label className="field"><span>Reason</span>
        <select className="select" value={r} onChange={(e) => setR(e.target.value)}>{['Chose another notary (price)', 'Chose another notary (timing)', 'Transaction cancelled', 'No response', 'Out of scope'].map((x) => <option key={x}>{x}</option>)}</select>
      </label>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(r)}>Save</button></div>
    </Modal>
  )
}

function MandateModal({ lead, onClose }) {
  const { state, dispatch, notify } = useStore()
  const [lang, setLang] = useState(lead.lang)
  const [o, setO] = useState({ type: lead.type, parties: 1, remote: false, rush: false })
  const fees = computeFees(o, state.rates)
  const tpl = state.templates.find((t) => t.name === `Mini-mandate · ${lead.type === 'Refinance' ? 'Refinance' : lead.type === 'Sale' ? 'Seller' : 'Buyer'}`)
  const body = (tpl?.body[lang] ?? '')
    .replaceAll('{{client}}', lead.name.split(' ')[0])
    .replaceAll('{{total}}', money(fees.total, lang))
    .replaceAll('{{lien}}', '[Accepter et ouvrir mon dossier]').replaceAll('{{link}}', '[Accept and open my file]')
    .replaceAll('{{signature}}', 'Nathalie Roy, parajuriste · Étude Dubois Notaires')

  return (
    <Modal title="Send mini-mandate" onClose={onClose} wide>
      <div className="split" style={{ gap: 16 }}>
        <div className="side stack" style={{ flexBasis: 260 }}>
          <label className="field"><span>Transaction</span><select className="select" value={o.type} onChange={(e) => setO({ ...o, type: e.target.value })}><option>Purchase</option><option>Sale</option><option>Refinance</option></select></label>
          <label className="field"><span>Parties</span><input className="input" type="number" min="1" max="6" value={o.parties} onChange={(e) => setO({ ...o, parties: e.target.value })} /></label>
          <label className="check"><input type="checkbox" checked={o.remote} onChange={(e) => setO({ ...o, remote: e.target.checked })} /> Remote signing</label>
          <label className="check"><input type="checkbox" checked={o.rush} onChange={(e) => setO({ ...o, rush: e.target.checked })} /> Rush</label>
          <div className="quote-box">
            <span className="small muted">Quote (taxes + disbursements incl.)</span>
            <b style={{ fontSize: 22 }}>{money(fees.total)}</b>
            <span className="small muted">From Settings → Fee table</span>
          </div>
        </div>
        <div className="main stack">
          <div className="row between">
            <span className="small muted">To: <b>{lead.name}</b> &lt;{lead.email}&gt;</span>
            <div className="seg light"><button className={lang === 'FR' ? 'on' : ''} onClick={() => setLang('FR')}>FR</button><button className={lang === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>EN</button></div>
          </div>
          <div className="small"><b>Subject:</b> {tpl?.subject[lang]}</div>
          <pre className="email-preview">{body}</pre>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { dispatch({ type: 'lead/mandate', id: lead.id, lang, total: fees.total, totalLabel: money(fees.total) }); notify(`Mini-mandate sent to ${lead.name}`); onClose() }}><Send size={16} /> Send email</button>
      </div>
    </Modal>
  )
}
