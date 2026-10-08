import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Mail, Phone, Globe, Users, Send, FolderOpen, Columns3, List, MessageSquare, X, RotateCcw, Bot, CalendarDays, Video } from 'lucide-react'
import { BookModal } from './Calendar'
import { useStore, now } from '../../store'
import { PageHeader, Badge, Modal, Avatar, Tabs } from '../../ui'
import { LEAD_COLUMNS, addDays } from '../../data'
import { computeFees, defaultFeeSelection, money, fmtDate } from '../../logic'
import { Composer, composerFields } from '../../Shared'

const SOURCE_ICON = { Email: Mail, 'Website form': Globe, 'Broker referral': Users, Phone, 'AI phone agent': Bot }

export default function Leads() {
  const { state } = useStore()
  const nav = useNavigate()
  const [view, setView] = useState('board')
  const [over, setOver] = useState(null)
  const { dispatch, notify } = useStore()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <PageHeader
        title="Leads"
        sub="Inbound requests from email, the website and the AI phone agent. Drag cards between columns."
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
              <section key={c} className={'board-col' + (over === c ? ' drop' : '')} aria-label={`${c} column`}
                onDragOver={(e) => { e.preventDefault(); setOver(c) }} onDragLeave={() => setOver(null)}
                onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); const l = state.leads.find((x) => x.id === id); if (l && l.status !== c) { dispatch({ type: 'lead/move', id, status: c }); notify(c === 'Won' ? `${l.name}: file opened` : `${l.name} moved to “${c}”`) } }}>
                <div className="row between"><b>{c}</b><span className="nav-count quiet">{items.length}</span></div>
                {items.map((l) => {
                  const Icon = SOURCE_ICON[l.source] ?? Mail
                  return (
                    <Link key={l.id} to={`/app/leads/${l.id}`} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move' }} className={'lead-card' + (l.isDemo && l.status === 'New' ? ' pulse' : '')}>
                      <div className="row between"><b>{l.name}</b><span className="small muted">{l.received}</span></div>
                      <span className="small muted">{l.type} · {l.property.split(',').pop()}{l.clientType === 'Corporation' && <> · <Badge tone="purple">Corporation</Badge></>}</span>
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
            <button className="btn" onClick={() => setModal('compose')}><MessageSquare size={16} /> Reply by email or text</button>
            <button className="btn" onClick={() => { dispatch({ type: 'lead/consultLink', id }); notify('Consultation booking link emailed') }}><Send size={16} /> Send consultation link</button>
            <button className="btn" onClick={() => setModal('consult')}><CalendarDays size={16} /> Book consultation</button>
          </section>
        </aside>
      </div>

      {modal === 'mandate' && <MandateModal lead={lead} onClose={() => setModal(null)} />}
      {modal === 'consult' && <BookModal leadId={lead.id} onClose={() => setModal(null)} />}
      {modal === 'compose' && <Composer to={`${lead.name} <${lead.email}> · ${lead.phone}`} lang={lead.lang} leadId={lead.id} onClose={() => setModal(null)}
        fields={composerFields({ first: lead.name.split(' ')[0], address: lead.property.split(',')[0], file: lead.fileId ?? '—', total: lead.quote ? money(lead.quote) : '—', notary: 'Me Anne Dubois' })} />}
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
  const corp = lead.clientType === 'Corporation'
  const ruleOn = (id) => state.feeRules.find((r) => r.id === id)?.on
  const [sel, setSel] = useState(() => defaultFeeSelection(lead.type, state.feeItems, { corporate: corp && ruleOn('r1') }))
  const bases = state.feeItems.filter((i) => i.kind === 'base' && i.type === lead.type)
  const fees = computeFees(sel, state.feeItems)
  const setQty = (id, v) => setSel({ ...sel, qty: { ...sel.qty, [id]: Math.max(0, Number(v) || 0) } })
  const tpl = state.templates.find((t) => t.name === (corp ? 'Mini-mandate · Corporation' : `Mini-mandate · ${lead.type === 'Refinance' ? 'Refinance' : lead.type === 'Sale' ? 'Seller' : 'Buyer'}`))
  const addr = lead.property.split(',')[0]
  const fill = (txt) => (txt ?? '')
    .replaceAll('{{client}}', lead.name.split(' ')[0]).replaceAll('{{adresse}}', addr).replaceAll('{{address}}', addr)
    .replaceAll('{{total}}', money(fees.total, lang))
    .replaceAll('{{lien}}', '[Accepter et ouvrir mon dossier]').replaceAll('{{link}}', '[Accept and open my file]')
    .replaceAll('{{signature}}', 'Nathalie Roy, parajuriste · Étude Dubois Notaires')

  return (
    <Modal title="Send mini-mandate" onClose={onClose} wide>
      <div className="split" style={{ gap: 16 }}>
        <div className="side stack" style={{ flexBasis: 280 }}>
          <label className="field"><span>Published price ({lead.type})</span>
            <select className="select" value={sel.base} onChange={(e) => setSel({ ...sel, base: e.target.value })}>{bases.map((b) => <option key={b.id} value={b.id}>{b.label} · {money(b.amount)}</option>)}</select>
          </label>
          {state.feeItems.filter((i) => i.kind === 'unit').map((i) => (
            <label key={i.id} className="row small" style={{ justifyContent: 'space-between' }}>{i.label}<input className="input" type="number" min="0" max="9" style={{ width: 70, minHeight: 32 }} value={sel.qty[i.id] ?? 0} onChange={(e) => setQty(i.id, e.target.value)} /></label>
          ))}
          {state.feeItems.filter((i) => i.kind === 'option').map((i) => (
            <label key={i.id} className="check small" style={{ minHeight: 30 }}><input type="checkbox" checked={(sel.qty[i.id] ?? 0) > 0} onChange={(e) => setQty(i.id, e.target.checked ? 1 : 0)} /> {i.label}</label>
          ))}
          <div className="quote-box">
            <span className="small muted">Quote (taxes + disbursements incl.)</span>
            <b style={{ fontSize: 22 }}>{money(fees.total)}</b>
            <span className="small muted">{fees.deposit ? 'Private lender: deposit required · ' : ''}From Settings → Fee table</span>
          </div>
        </div>
        <div className="main stack">
          <div className="row between">
            <span className="small muted">To: <b>{lead.name}</b> &lt;{lead.email}&gt;{corp && <Badge tone="purple">Corporation</Badge>}</span>
            <div className="seg light"><button className={lang === 'FR' ? 'on' : ''} onClick={() => setLang('FR')}>FR</button><button className={lang === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>EN</button></div>
          </div>
          <div className="small"><b>Subject:</b> {fill(tpl?.subject[lang])}</div>
          <pre className="email-preview">{fill(tpl?.body[lang])}</pre>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { dispatch({ type: 'lead/mandate', id: lead.id, lang, total: fees.total, totalLabel: money(fees.total) }); notify(`Mini-mandate sent to ${lead.name}`); onClose() }}><Send size={16} /> Send email</button>
      </div>
    </Modal>
  )
}
