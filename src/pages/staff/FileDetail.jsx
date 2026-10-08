import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Copy, Upload, Send, Check, X, Landmark, CalendarDays, FileText, Download, ShieldCheck, ArrowRight, Printer, TriangleAlert, CircleCheck, Video, CalendarClock, ExternalLink, Printer as Fax, Maximize2, Building2 } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Badge, Tabs, Modal, Progress, Avatar } from '../../ui'
import { stagesFor, stageInfo, stepDone, bookingUnlocked, money, fmtDate, isExpired, validIds, isClosed, can, contractOverdue } from '../../logic'
import { fileType } from '../../firm'
import FileSheet from './FileSheet'
import FileChecklist from './FileChecklist'
import FileContract from './FileContract'
import FileClosing from './FileClosing'
import { addDays, STAFF } from '../../data'
import { Composer, composerFields, IdViewer } from '../../Shared'
import { appointments } from '../../availability'
import { EventModal, BookModal } from './Calendar'

export default function FileDetail() {
  const { id } = useParams()
  const { state, dispatch, notify } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'overview'
  const file = state.files.find((f) => f.id === id)
  const [modal, setModal] = useState(null)
  if (!file) return <p>File not found. <Link to="/app/files">Back to files</Link></p>
  const s = stageInfo(file)
  const setTab = (k) => setParams({ tab: k })
  const pendingIds = file.parties.reduce((n, p) => n + p.ids.filter((d) => d.review === 'pending').length, 0)

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Files', to: '/app/files' }, { label: file.id }]}
        title={<>{file.clients.join(' & ')}{file.clientType === 'Corporation' && <> <Badge tone="purple">Corporation</Badge></>}</>}
        sub={`${file.id} · ${file.type}${file.propertyType && fileType(file.type).service === 'Real estate' ? ` · ${file.propertyType}` : ''}${file.lenderType && file.lenderType !== 'Conventional' ? ` · ${file.lenderType}` : ''} · ${file.addr}, ${file.city} · Notary: ${file.notary}`}
        actions={<>
          {file.isDemo && <Link className="btn" to="/client"><Mail size={16} /> Client view</Link>}
          <button className="btn" onClick={() => setModal('compose')}><Mail size={16} /> Email or text client</button>
          {!isClosed(file) && <button className="btn" onClick={() => { dispatch({ type: 'file/reminder', id }); notify('Reminder emailed to client') }}><Send size={16} /> Send reminder</button>}
        </>}
      />
      {contractOverdue(file) && <p className="banner warn row" style={{ gap: 6 }}><TriangleAlert size={15} /> Service contract sent {file.contract.sentAt} and still unsigned. The signature chase automation is running.</p>}

      <div className="card" style={{ padding: 0 }}>
        <ol className="stages" aria-label="Workflow">
          {stagesFor(file).map((st, i) => (
            <li key={st.key} className={stepDone(file, st.key) ? 'done' : i === s.i ? 'current' : ''}>
              <button onClick={() => setTab(st.tab)} aria-current={i === s.i ? 'step' : undefined}>
                <span className="st-n">{stepDone(file, st.key) ? <Check size={13} /> : i + 1}</span>{st.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[
        { key: 'overview', label: 'Overview' },
        { key: 'parties', label: 'Parties & IDs', count: pendingIds || null },
        { key: 'sheet', label: 'File sheet' },
        { key: 'contract', label: 'Fees & contract' },
        { key: 'checklist', label: 'Checklist' },
        { key: 'closing', label: 'Signing & closing' },
        { key: 'documents', label: 'Documents' },
        { key: 'activity', label: 'Activity', count: file.log.length },
      ]} />

      {tab === 'overview' && <OverviewTab file={file} s={s} setTab={setTab} setModal={setModal} />}
      {tab === 'parties' && <PartiesTab file={file} />}
      {tab === 'sheet' && <FileSheet file={file} />}
      {tab === 'contract' && <FileContract file={file} />}
      {tab === 'checklist' && <FileChecklist file={file} />}
      {tab === 'closing' && <FileClosing file={file} />}
      {tab === 'documents' && <DocumentsTab file={file} />}
      {tab === 'activity' && (
        <section className="card"><div className="timeline">{file.log.map((l, i) => <div key={i}><span className="small muted">{l.t} · {l.who}</span><div>{l.e}</div></div>)}</div></section>
      )}
      {modal === 'lender' && <LenderModal file={file} onClose={() => setModal(null)} />}
      {modal === 'compose' && <Composer to={file.parties.map((p) => `${p.name} <${p.email}>`).join(', ')} lang={file.lang} fileId={file.id} onClose={() => setModal(null)}
        fields={composerFields({ first: file.clients[0].split(' ')[0], address: file.addr, file: file.id, total: money(file.contract.total), notary: file.notary })} />}
    </>
  )
}

function OverviewTab({ file, s, setTab, setModal }) {
  const { state, dispatch, notify } = useStore()
  const [appt, setAppt] = useState(null)
  const [bookFor, setBookFor] = useState(false)
  const admin = can(state, 'files.assign')
  const nav = useNavigate()
  const unlocked = bookingUnlocked(file)
  const two = !!fileType(file.type).twoMeetings
  const seller = file.type === 'Sale'
  const meetings = two ? [['mortgage', '1 · Mortgage signing', file.mortgageBooking], ['main', '2 · Sale signing', file.booking]] : [['main', 'Signing', file.booking]]
  const action = {
    questionnaire: { label: 'Send reminder', run: () => { dispatch({ type: 'file/reminder', id: file.id }); notify('Reminder sent') } },
    ids: { label: 'Review IDs', run: () => nav('/app/id-review') },
    contract: { label: file.contract.sent ? 'View contract' : 'Prepare contract', run: () => setTab('contract') },
    lender: { label: 'Record lender instructions', run: () => setModal('lender') },
    title: { label: 'Open checklist', run: () => setTab('checklist') },
    booking: { label: file.bookingLinkSent ? 'Resend booking link' : 'Send booking link', run: () => { dispatch({ type: 'booking/sendLink', id: file.id }); notify('Booking link emailed') } },
    closing: { label: 'Signing & closing', run: () => setTab('closing') },
    delivery: { label: 'Publish documents', run: () => setTab('closing') },
    procardex: { label: 'Procardex hand-off', run: () => setTab('closing') },
  }[s.key]

  return (
    <div className="split">
      <div className="main stack-lg">
        <section className={'card next-card' + (file.escalated && !isClosed(file) ? ' warn' : '')}>
          <div className="grow">
            <span className="small muted">Next step · {s.owner === '—' ? 'Done' : `owner: ${s.owner}`}</span>
            <h2 style={{ fontSize: 18, marginTop: 4 }}>{file.escalated && !isClosed(file) && <TriangleAlert size={16} style={{ verticalAlign: -2, marginRight: 6 }} />}{s.next}</h2>
          </div>
          {action && <button className="btn btn-primary" onClick={action.run}>{action.label} <ArrowRight size={16} /></button>}
          {!action && <Badge tone="ok">Closed</Badge>}
        </section>

        <div className="grid-2">
          {fileType(file.type).lender ? <section className="card stack" style={{ gap: 8 }}>
            <div className="row between"><h2 className="row" style={{ gap: 6 }}><Landmark size={16} /> Lender instructions</h2>{file.bankReceived ? <Badge tone="ok">Received</Badge> : <Badge tone="warn">Waiting</Badge>}</div>
            <div className="kv"><span className="muted">Lender</span><span>{file.lender}</span></div>
            <div className="kv"><span className="muted">Mortgage</span><span className="mono">{file.mortgage ? money(file.mortgage) : '—'}</span></div>
            <div className="kv"><span className="muted">Source</span><span>Telus Lender Assist / AvisImmo</span></div>
            {!file.bankReceived && <button className="btn" onClick={() => setModal('lender')}>Record instructions</button>}
          </section> : <section className="card stack" style={{ gap: 8 }}><h2 className="row" style={{ gap: 6 }}><Landmark size={16} /> Lender</h2><p className="small muted">No lender instructions needed for this file type ({file.type}).</p></section>}
          <section className="card stack" style={{ gap: 8 }}>
            <div className="row between"><h2 className="row" style={{ gap: 6 }}><CalendarDays size={16} /> {two ? 'Appointments (2)' : 'Signing appointment'}</h2>{stepDone(file, 'booking') ? <Badge tone="ok">Booked</Badge> : unlocked ? <Badge tone="blue">Open</Badge> : <Badge>Locked</Badge>}</div>
            {!unlocked ? (
              <p className="small muted row" style={{ gap: 6, alignItems: 'flex-start' }}><Lock size={14} style={{ marginTop: 2 }} /> Opens when the service contract is signed{file.contract.signed ? ' ✓' : ''}{fileType(file.type).lender ? <> and the lender instructions are received{file.bankReceived ? ' ✓' : ''}</> : ''}.</p>
            ) : (
              <>
                {meetings.map(([which, label, b]) => (
                  <div key={which} className="meet-row">
                    <span className="grow"><b>{label}</b><span className="small muted" style={{ display: 'block' }}>{b ? `${fmtDate(b.date)} · ${b.time} · ${b.mode} · ${b.notary ?? file.notary}` : which === 'mortgage' ? 'About one week before the sale' : two ? 'With the seller present' : 'Not booked yet'}</span></span>
                    {b ? <button className="btn btn-sm" onClick={() => setAppt(appointments(state).find((a) => a.id === (which === 'mortgage' ? 'mort-' : 'sign-') + file.id))}><CalendarClock size={14} /> Manage</button> : <Badge tone="warn">To book</Badge>}
                  </div>
                ))}
                {meetings.some(([, , b]) => b?.teamsUrl) && <p className="small" style={{ color: '#4b45c4' }}>Teams links created automatically</p>}
                {!stepDone(file, 'booking') && (
                  <div className="row">
                    <button className="btn btn-sm" onClick={() => { dispatch({ type: 'booking/sendLink', id: file.id }); notify('Email sent with 3 proposed times') }}><Send size={14} /> {file.bookingLinkSent ? 'Resend' : 'Send'} proposed times</button>
                    <button className="btn btn-sm" onClick={() => setBookFor(true)}><CalendarDays size={14} /> Book for client</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
        <section className="card stack" style={{ gap: 8 }}>
          <div className="row between"><h2 className="row" style={{ gap: 6 }}><Landmark size={16} /> {seller ? 'Sale proceeds' : 'Funds for signing'}</h2>{file.funds?.received ? <Badge tone="ok">Received</Badge> : file.funds?.requested ? <Badge tone="blue">Requested</Badge> : <Badge>Not requested</Badge>}</div>
          {seller ? (
            <p className="small muted">Fees are paid from the sale proceeds. Net proceeds are released after the deed of sale is registered, by cheque or wire.</p>
          ) : (
            <>
              <p className="small muted">{fileType(file.type).payer === 'buyer' || file.type === 'Purchase' || file.type === 'Cash purchase' ? 'Fees are remitted with the down payment, by wire only, before or at the first appointment.' : 'Fees are paid from the proceeds of the financing.'} Banking instructions are password-protected; the password is given by phone only.</p>
              <div className="funds-steps">
                <span className={file.funds?.requested ? 'ok' : ''}>{file.funds?.requested ? '✓' : '1'} Amount and proof-of-funds request sent</span>
                <span className={file.funds?.passwordSent ? 'ok' : ''}>{file.funds?.passwordSent ? '✓' : '2'} Password-protected instructions sent</span>
                <span className={file.funds?.passwordConfirmed ? 'ok' : ''}>{file.funds?.passwordConfirmed ? '✓' : '3'} Password confirmed by phone</span>
                <span className={file.funds?.source ? 'ok' : ''}>{file.funds?.source ? '✓' : '4'} Source of funds declared{file.funds?.source ? `: ${file.funds.source.origin}${file.funds.source.thirdParty ? ' + third party' : ''}` : ''}</span>
                <span className={file.funds?.received ? 'ok' : ''}>{file.funds?.received ? '✓' : '5'} Funds received in trust</span>
              </div>
              <div className="row">
                {!file.funds?.requested && <button className="btn btn-sm" disabled={!file.contract.signed} onClick={() => { dispatch({ type: 'funds/request', id: file.id, amount: file.contract.total, amountLabel: money(file.contract.total) }); notify('Funds request emailed') }}><Send size={14} /> Send funds request</button>}
                {file.funds?.requested && !file.funds?.passwordSent && <button className="btn btn-sm" onClick={() => { dispatch({ type: 'funds/password', id: file.id }); notify('Password-protected instructions sent') }}><Lock size={14} /> Send protected instructions</button>}
                {file.funds?.passwordSent && !file.funds?.passwordConfirmed && <button className="btn btn-sm" onClick={() => { dispatch({ type: 'funds/passwordConfirmed', id: file.id }); notify('Password confirmed by phone') }}>Password confirmed by phone</button>}
              </div>
            </>
          )}
        </section>
      </div>
      <aside className="side stack-lg">
        <section className="card stack" style={{ gap: 8 }}>
          <h2>File details</h2>
          <div className="kv"><span className="muted">Transaction</span><span>{file.type}</span></div>
          <div className="kv"><span className="muted">Target signing</span><span>{fmtDate(file.closingDate)}</span></div>
          <div className="kv"><span className="muted">Language</span><span>{file.lang}</span></div>
          <div className="kv"><span className="muted">Fees</span><span className="mono">{file.contract.total ? money(file.contract.total) : '—'}</span></div>
          {file.fromLead && <div className="kv"><span className="muted">From lead</span><Link to={`/app/leads/${file.fromLead}`}>{file.fromLead}</Link></div>}
        </section>
        <section className="card stack" style={{ gap: 10 }}>
          <h2>Team</h2>
          {[[file.notary, 'Notary', 'notary'], [file.paralegal, 'Paralegal', 'paralegal']].map(([n, r, key]) => (
            <div key={r} className="row"><Avatar name={n} size={30} />
              {admin ? (
                <label className="grow"><span className="sr-only">{r}</span>
                  <select className="select" value={n} onChange={(e) => { dispatch({ type: 'file/assign', id: file.id, key, value: e.target.value }); notify(`${r} assigned: ${e.target.value}`) }}>
                    {STAFF.filter((x) => x.role === r).map((x) => <option key={x.name}>{x.name}</option>)}
                  </select>
                </label>
              ) : <span><b style={{ display: 'block' }}>{n}</b><span className="small muted">{r}</span></span>}
            </div>
          ))}
          <p className="small muted">{admin ? 'You can assign notaries and paralegals.' : 'Only Me Anne Dubois and Me Paul Lefebvre can change assignments.'}</p>
        </section>
        <section className="card stack" style={{ gap: 6 }}>
          <h2>Latest activity</h2>
          {file.log.slice(0, 4).map((l, i) => <div key={i}><span className="small muted">{l.t}</span><div className="small">{l.e}</div></div>)}
          <button className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setTab('activity')}>View all</button>
        </section>
      </aside>
      {appt && <EventModal ev={appt} onClose={() => setAppt(null)} />}
      {bookFor && <BookModal fileId={file.id} onClose={() => setBookFor(false)} />}
    </div>
  )
}

function PartiesTab({ file }) {
  const { state, dispatch, notify } = useStore()
  const [view, setView] = useState(null)
  const canReview = can(state, 'ids.review')
  const decide = (p, i, d, decision) => { dispatch({ type: 'id/review', id: file.id, party: p.name, idx: i, decision, docType: d.type }); notify(`${d.type} ${decision}`) }
  const LABELS = { role: 'Role', clientType: 'Client type', corporation: 'Corporation', neq: 'NEQ', signingOfficer: 'Signing officer', spouse: 'Spouse', property: 'Property', lender: 'Lender', seller: 'Seller', currentLender: 'Current lender', rented: 'Rented', utilityCaptures: 'Utility balance captures' }
  return (
    <div className="grid-2">
      {view && <IdViewer doc={view.d} party={view.p} onClose={() => setView(null)} onDecide={canReview ? (dec) => decide(view.p, view.i, view.d, dec) : null} />}
      {file.parties.map((p) => {
        const approved = validIds(p).filter((d) => d.review === 'approved').length
        return (
          <section key={p.name} className="card stack">
            <div className="row"><Avatar name={p.name} size={40} /><div className="grow"><h2>{p.name}</h2><span className="small muted">{p.role} · {p.marital}</span></div>{approved >= 2 ? <Badge tone="ok">Verified</Badge> : <Badge tone="warn">Pending</Badge>}</div>
            <div className="kv"><span className="muted">Email</span><span>{p.email}</span></div>
            <div className="kv"><span className="muted">Phone</span><span>{p.phone}</span></div>
            <div><div className="kv"><span className="muted">Questionnaire</span><span>{p.questionnaire}%</span></div><Progress value={p.questionnaire} /></div>
            <div className="kv"><span className="muted">Home insurance</span><span>{p.insurance ? <>{p.insurance.insurer}{p.insurance.bankAsCreditor ? <span className="ok"> · ✓ bank as creditor</span> : <span className="warn"> · bank not listed</span>}</> : <span className="muted">Not provided</span>}</span></div>
            <div className="kv"><span className="muted">Remote face check</span><span className={p.liveness === 'Passed' ? 'ok' : 'muted'}>{p.liveness === 'Passed' ? '✓ Passed' : p.liveness}</span></div>
            <h3 className="small muted" style={{ marginTop: 6 }}>IDENTITY DOCUMENTS</h3>
            {p.ids.length === 0 && <p className="small muted">No IDs uploaded yet.</p>}
            {p.ids.map((d, i) => {
              const exp = isExpired(d.exp)
              return (
                <div key={i} className={'id-row' + (exp ? ' bad' : '')}>
                  <button className="id-thumb two as-btn" aria-label={`View ${d.type} full screen`} onClick={() => setView({ d, p, i })}><span /><span /><Maximize2 size={12} className="zoom-ico" /></button>
                  <div className="grow"><b>{d.type}</b><div className={'small ' + (exp ? 'warn' : 'muted')}>{exp ? `Expired ${d.exp}` : `Valid to ${d.exp}`} · front + back</div></div>
                  {exp ? <Badge tone="bad">Expired</Badge> : d.review === 'pending' && canReview ? (
                    <div className="row" style={{ gap: 4 }}>
                      <button className="icon-btn ok" aria-label="Approve" onClick={() => decide(p, i, d, 'approved')}><Check size={16} /></button>
                      <button className="icon-btn bad" aria-label="Reject" onClick={() => decide(p, i, d, 'rejected')}><X size={16} /></button>
                    </div>
                  ) : <Badge>{d.review}</Badge>}
                </div>
              )
            })}
            {validIds(p).length < 2 && (
              <button className="btn" onClick={() => { dispatch({ type: 'file/log', id: file.id, e: `Requested valid photo ID from ${p.name}` }); notify(`Re-upload request sent to ${p.name}`) }}>Request new ID</button>
            )}
            {p.answers && (
              <details className="answers">
                <summary>Questionnaire answers</summary>
                {Object.entries(p.answers).filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && !v.length)).map(([k, v]) => (
                  <div key={k} className="kv small"><span className="muted">{LABELS[k] ?? (k === 'mortgagesToDischarge' ? 'Mortgages to discharge' : k)}</span>
                    <span>{Array.isArray(v) ? v.map((m) => `${m.lender}${m.account ? ` #${m.account}` : ''}`).join('; ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span></div>
                ))}
              </details>
            )}
          </section>
        )
      })}
    </div>
  )
}

function DocumentsTab({ file }) {
  const { state, notify } = useStore()
  const docs = [
    ...state.faxes.filter((x) => x.fileId === file.id && x.status === 'routed').map((x) => ({ name: `${x.docType} (fax, ${x.pages} p.) – ${x.sender}`, cat: 'Fax', by: x.routedBy ? `Routed by ${x.routedBy}` : 'Routed by AI', status: 'received' })),
    ...file.parties.flatMap((p) => p.ids.map((d) => ({ name: `${d.type} – ${p.name}`, cat: 'Identity', by: p.name, status: d.review }))),
    file.contract.sent && { name: `Service contract (${file.contract.lang})`, cat: 'Contract', by: 'Nexo', status: file.contract.signed ? 'signed' : 'sent' },
    file.bankReceived && { name: `Lender instructions – ${file.lender}`, cat: 'Lender', by: 'Lender portal', status: 'received' },
    ...file.finalDocs.map((d) => ({ name: d.name, cat: 'Closing', by: 'Notary', status: file.docsPublished ? 'published' : 'draft' })),
  ].filter(Boolean)
  return (
    <section className="card" style={{ padding: 0 }}>
      <div className="table-wrap" style={{ border: 0 }}>
        <table>
          <thead><tr><th>Document</th><th>Category</th><th>From</th><th>Status</th><th /></tr></thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td className="row" style={{ gap: 8 }}>{d.cat === 'Identity' ? <ShieldCheck size={16} /> : d.cat === 'Fax' ? <Fax size={16} /> : <FileText size={16} />}<b>{d.name}</b></td>
                <td>{d.cat}</td><td className="muted">{d.by}</td><td><Badge tone={['approved', 'signed', 'received', 'published'].includes(d.status) ? 'ok' : d.status === 'rejected' ? 'bad' : 'warn'}>{d.status}</Badge></td>
                <td><button className="icon-btn" aria-label={`Download ${d.name}`} onClick={() => notify(`Downloading ${d.name} (demo)`)}><Download size={16} /></button></td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 32 }}>No documents yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function LenderModal({ file, onClose }) {
  const { dispatch, notify } = useStore()
  const [f, setF] = useState({ lender: file.lender !== '—' ? file.lender : 'Banque Exemple', amount: '412000', closingDate: file.closingDate ?? addDays(30) })
  return (
    <Modal title="Record lender instructions" onClose={onClose}>
      <p className="small muted">Retrieved from Telus Lender Assist / AvisImmo (no API, entered manually).</p>
      <label className="field"><span>Lender</span><select className="select" value={f.lender} onChange={(e) => setF({ ...f, lender: e.target.value })}>{['Banque Exemple', 'Caisse Exemple', 'Prêteur Exemple', 'Other'].map((x) => <option key={x}>{x}</option>)}</select></label>
      <div className="grid-2">
        <label className="field"><span>Mortgage amount ($)</span><input className="input" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, '') })} /></label>
        <label className="field"><span>Closing date</span><input className="input" type="date" value={f.closingDate} onChange={(e) => setF({ ...f, closingDate: e.target.value })} /></label>
      </div>
      <label className="check"><input type="checkbox" defaultChecked /> Instructions PDF attached</label>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { dispatch({ type: 'lender/record', id: file.id, lender: f.lender, amount: Number(f.amount), amountLabel: money(Number(f.amount)), closingDate: f.closingDate }); notify(file.contract.signed ? 'Instructions saved · booking link emailed automatically' : 'Lender instructions saved'); onClose() }}>Save</button>
      </div>
    </Modal>
  )
}
