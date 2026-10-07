import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Copy, Upload, Send, Check, X, Landmark, CalendarDays, FileText, Download, ShieldCheck, ArrowRight, Printer, TriangleAlert, CircleCheck, Video, CalendarClock } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Badge, Tabs, Modal, Progress, Avatar } from '../../ui'
import { STAGES, stageInfo, stepDone, bookingUnlocked, computeFees, money, fmtDate, isExpired, validIds, isClosed } from '../../logic'
import { addDays, STAFF, canAssign } from '../../data'
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
        title={`${file.clients.join(' & ')}`}
        sub={`${file.id} · ${file.type} · ${file.addr}, ${file.city} · Notary: ${file.notary}`}
        actions={<>
          {file.isDemo && <Link className="btn" to="/client"><Mail size={16} /> Client view</Link>}
          {!isClosed(file) && <button className="btn" onClick={() => { dispatch({ type: 'file/reminder', id }); notify('Reminder emailed to client') }}><Send size={16} /> Send reminder</button>}
        </>}
      />

      <div className="card" style={{ padding: 0 }}>
        <ol className="stages" aria-label="Workflow">
          {STAGES.map((st, i) => (
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
        { key: 'contract', label: 'Fees & contract' },
        { key: 'closing', label: 'Title & closing' },
        { key: 'documents', label: 'Documents' },
        { key: 'activity', label: 'Activity', count: file.log.length },
      ]} />

      {tab === 'overview' && <OverviewTab file={file} s={s} setTab={setTab} setModal={setModal} />}
      {tab === 'parties' && <PartiesTab file={file} />}
      {tab === 'contract' && <ContractTab file={file} />}
      {tab === 'closing' && <ClosingTab file={file} />}
      {tab === 'documents' && <DocumentsTab file={file} />}
      {tab === 'activity' && (
        <section className="card"><div className="timeline">{file.log.map((l, i) => <div key={i}><span className="small muted">{l.t} · {l.who}</span><div>{l.e}</div></div>)}</div></section>
      )}
      {modal === 'lender' && <LenderModal file={file} onClose={() => setModal(null)} />}
    </>
  )
}

function OverviewTab({ file, s, setTab, setModal }) {
  const { state, dispatch, notify } = useStore()
  const [appt, setAppt] = useState(null)
  const [bookFor, setBookFor] = useState(false)
  const admin = canAssign(state.auth)
  const nav = useNavigate()
  const unlocked = bookingUnlocked(file)
  const action = {
    questionnaire: { label: 'Send reminder', run: () => { dispatch({ type: 'file/reminder', id: file.id }); notify('Reminder sent') } },
    ids: { label: 'Review IDs', run: () => nav('/app/id-review') },
    contract: { label: file.contract.sent ? 'View contract' : 'Prepare contract', run: () => setTab('contract') },
    lender: { label: 'Record lender instructions', run: () => setModal('lender') },
    title: { label: 'Open title search', run: () => setTab('closing') },
    booking: { label: file.bookingLinkSent ? 'Resend booking link' : 'Send booking link', run: () => { dispatch({ type: 'booking/sendLink', id: file.id }); notify('Booking link emailed') } },
    closing: { label: 'Open closing checklist', run: () => setTab('closing') },
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
          <section className="card stack" style={{ gap: 8 }}>
            <div className="row between"><h2 className="row" style={{ gap: 6 }}><Landmark size={16} /> Lender instructions</h2>{file.bankReceived ? <Badge tone="ok">Received</Badge> : <Badge tone="warn">Waiting</Badge>}</div>
            <div className="kv"><span className="muted">Lender</span><span>{file.lender}</span></div>
            <div className="kv"><span className="muted">Mortgage</span><span className="mono">{file.mortgage ? money(file.mortgage) : '—'}</span></div>
            <div className="kv"><span className="muted">Source</span><span>Telus Lender Assist / AvisImmo</span></div>
            {!file.bankReceived && <button className="btn" onClick={() => setModal('lender')}>Record instructions</button>}
          </section>
          <section className="card stack" style={{ gap: 8 }}>
            <div className="row between"><h2 className="row" style={{ gap: 6 }}><CalendarDays size={16} /> Signing appointment</h2>{file.booking ? <Badge tone="ok">Booked</Badge> : unlocked ? <Badge tone="blue">Link ready</Badge> : <Badge>Locked</Badge>}</div>
            {file.booking ? (
              <>
                <div className="kv"><span className="muted">When</span><span>{fmtDate(file.booking.date)} · {file.booking.time}</span></div>
                <div className="kv"><span className="muted">How</span><span>{file.booking.mode}</span></div>
                <div className="kv"><span className="muted">Notary</span><span>{file.booking.notary ?? file.notary}</span></div>
                {file.booking.attendees && <div className="kv"><span className="muted">Attendees</span><span>{file.booking.attendees.join(', ')}</span></div>}
                {file.booking.teamsUrl && <div className="teams-box"><Video size={15} /><span className="grow mono small">{file.booking.teamsUrl}</span><button className="btn btn-sm" onClick={() => notify('Opening Microsoft Teams (demo)')}>Join</button></div>}
                <p className="small ok row" style={{ gap: 6 }}><CircleCheck size={14} /> In Outlook · reminder 24 h before</p>
                <button className="btn" onClick={() => setAppt(appointments(state).find((a) => a.id === 'sign-' + file.id))}><CalendarClock size={15} /> Reschedule or cancel</button>
              </>
            ) : unlocked ? (
              <>
                <p className="small muted">{file.bookingLinkSent ? 'Email sent with 3 proposed times; waiting for the client to pick one.' : 'Preconditions met. Email the client 3 proposed times, or book for them.'}</p>
                <div className="row">
                  <button className="btn" onClick={() => { dispatch({ type: 'booking/sendLink', id: file.id }); notify('Email sent with 3 proposed times') }}><Send size={15} /> {file.bookingLinkSent ? 'Resend' : 'Send'} proposed times</button>
                  <button className="btn" onClick={() => setBookFor(true)}><CalendarDays size={15} /> Book for client</button>
                </div>
              </>
            ) : (
              <p className="small muted row" style={{ gap: 6, alignItems: 'flex-start' }}><Lock size={14} style={{ marginTop: 2 }} /> Unlocks automatically when the service contract is signed{file.contract.signed ? ' ✓' : ''} and lender instructions are received{file.bankReceived ? ' ✓' : ''}.</p>
            )}
          </section>
        </div>
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
  const { dispatch, notify } = useStore()
  return (
    <div className="grid-2">
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
                  <div className="id-thumb" aria-hidden="true" />
                  <div className="grow"><b>{d.type}</b><div className={'small ' + (exp ? 'warn' : 'muted')}>{exp ? `Expired ${d.exp}` : `Valid to ${d.exp}`}</div></div>
                  {exp ? <Badge tone="bad">Expired</Badge> : d.review === 'pending' ? (
                    <div className="row" style={{ gap: 4 }}>
                      <button className="icon-btn ok" aria-label="Approve" onClick={() => { dispatch({ type: 'id/review', id: file.id, party: p.name, idx: i, decision: 'approved', docType: d.type }); notify(`${d.type} approved`) }}><Check size={16} /></button>
                      <button className="icon-btn bad" aria-label="Reject" onClick={() => { dispatch({ type: 'id/review', id: file.id, party: p.name, idx: i, decision: 'rejected', docType: d.type }); notify(`${d.type} rejected · re-upload requested`) }}><X size={16} /></button>
                    </div>
                  ) : <Badge>{d.review}</Badge>}
                </div>
              )
            })}
            {validIds(p).length < 2 && (
              <button className="btn" onClick={() => { dispatch({ type: 'file/log', id: file.id, e: `Requested valid photo ID from ${p.name}` }); notify(`Re-upload request sent to ${p.name}`) }}>Request new ID</button>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ContractTab({ file }) {
  const { state, dispatch, notify } = useStore()
  const [o, setO] = useState(file.contract.options ?? { type: file.type, parties: file.parties.length, mortgages: file.type === 'Sale' ? 1 : 0, remote: file.parties.some((p) => p.liveness === 'Passed'), rush: false, lang: file.lang })
  const [confirm, setConfirm] = useState(false)
  const fees = computeFees(o, state.rates)
  const fr = o.lang === 'FR'
  const lines = [['Professional fees', fees.professional], o.remote && ['Remote signing', fees.remoteFee], o.rush && ['Rush file', fees.rushFee], fees.dischargeFee > 0 && [`Mortgage discharge × ${o.mortgages}`, fees.dischargeFee], ['GST 5%', fees.gst], ['QST 9.975%', fees.qst], ['Disbursements', fees.disbursements]].filter(Boolean)
  const locked = file.contract.sent
  const set = (k) => (e) => setO({ ...o, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <>
      {file.contract.signed && <p className="banner ok row" style={{ gap: 6 }}><CircleCheck size={16} /> Signed electronically by {file.contract.signedBy ?? file.clients.join(' & ')}.</p>}
      {file.contract.sent && !file.contract.signed && (
        <div className="banner info row between">
          <span>Out for e-signature with {file.clients.join(' & ')}. Automatic reminder after 3 days.</span>
          {file.isDemo ? <Link to="/client">Open Émilie’s inbox to sign →</Link> : <button className="btn btn-sm" onClick={() => { dispatch({ type: 'contract/sign', id: file.id, signer: file.clients[0] }); notify('Simulated client signature') }}>Simulate signature</button>}
        </div>
      )}
      <div className="split">
        <section className="card stack side" style={{ flexBasis: 360 }}>
          <h2>Fee calculator</h2>
          <fieldset disabled={locked} className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
            <div className="grid-2">
              <label className="field"><span>Transaction</span><select className="select" value={o.type} onChange={set('type')}><option>Purchase</option><option>Sale</option><option>Refinance</option></select></label>
              <label className="field"><span>Parties</span><input className="input" type="number" min="1" max="6" value={o.parties} onChange={set('parties')} /></label>
              <label className="field"><span>Contract language</span><select className="select" value={o.lang} onChange={set('lang')}><option value="FR">Français</option><option value="EN">English</option></select></label>
              <label className="field"><span>Mortgage</span><input className="input" value={file.mortgage ? money(file.mortgage) : 'From lender'} readOnly /></label>
            </div>
            <label className="check"><input type="checkbox" checked={o.remote} onChange={set('remote')} /> Remote signing</label>
            <label className="check"><input type="checkbox" checked={o.rush} onChange={set('rush')} /> Rush file</label>
            <label className="field"><span>Existing mortgages to discharge</span><input className="input" type="number" min="0" max="5" value={o.mortgages ?? 0} onChange={set('mortgages')} /></label>
          </fieldset>
          <div className="stack" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 12, gap: 6 }}>
            {lines.map(([k, v]) => <div key={k} className="kv"><span>{k}</span><span className="mono">{money(v)}</span></div>)}
            <div className="kv total"><span>Total</span><span className="mono">{money(fees.total)}</span></div>
          </div>
          <p className="small muted">Rates from <Link to="/app/settings?tab=fees">Settings → Fee table</Link>.</p>
          {!locked && <button className="btn btn-primary" onClick={() => setConfirm(true)}><Send size={16} /> Send for e-signature</button>}
          <button className="btn" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
        </section>

        <section className="card main" style={{ padding: 0 }}>
          <div className="row between" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
            <b>{fr ? 'Convention de services professionnels' : 'Professional Services Agreement'}</b>
            <span className="small muted">Template: Service contract · {o.type}</span>
          </div>
          <div className="contract-paper">
            <div className="row between"><Logo2 /><span className="small muted">{fr ? 'Dossier' : 'File'} {file.id}</span></div>
            <h3 style={{ textAlign: 'center', fontSize: 18 }}>{fr ? 'CONVENTION DE SERVICES PROFESSIONNELS' : 'PROFESSIONAL SERVICES AGREEMENT'}</h3>
            <p>{fr ? 'ENTRE : ' : 'BETWEEN: '}<b>Étude Dubois Notaires inc.</b>{fr ? ', représentée par ' : ', represented by '}{file.notary}</p>
            <p>{fr ? 'ET : ' : 'AND: '}{file.clients.map((n, i) => <span key={n}>{i > 0 && (fr ? ' et ' : ' and ')}<span className="fill">{n}</span></span>)}</p>
            <p><b>1. {fr ? 'Mandat' : 'Mandate'}.</b> {fr ? 'Le client retient les services du notaire pour ' : 'The client retains the notary for '}<span className="fill">{{ Purchase: fr ? 'l’achat et l’hypothèque' : 'the purchase and mortgage', Sale: fr ? 'la vente' : 'the sale', Refinance: fr ? 'le refinancement hypothécaire' : 'the mortgage refinance' }[o.type]}</span>{fr ? ' de l’immeuble situé au ' : ' of the property at '}<span className="fill">{file.addr}, {file.city}</span>.</p>
            <p><b>2. {fr ? 'Honoraires' : 'Fees'}.</b> {fr ? 'Honoraires et débours totaux de ' : 'Total fees and disbursements of '}<span className="fill">{money(fees.total)}</span>{fr ? ', taxes incluses, payables par virement ou traite bancaire avant la signature.' : ', taxes included, payable by wire transfer or bank draft before signing.'}</p>
            <p><b>3. {fr ? 'Documents' : 'Documents'}.</b> {fr ? 'Le client fournit deux pièces d’identité valides et tout document demandé.' : 'The client provides two valid IDs and any requested document.'}</p>
            <div className="ghost-line" style={{ width: '92%' }} /><div className="ghost-line" style={{ width: '84%' }} />
            <div className="grid-2" style={{ gap: 28, marginTop: 24 }}>
              {file.clients.map((n) => (
                <div key={n} className="sig-line">
                  {file.contract.signed ? <span className="sig">{file.contract.signedBy ?? n}</span> : <span className="sig placeholder">&nbsp;</span>}
                  <span className="small">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {confirm && (
        <Modal title="Send for e-signature" onClose={() => setConfirm(false)}>
          <p>Send the {o.lang} service contract (<b>{money(fees.total)}</b>) for signature to:</p>
          {file.parties.map((p) => <div key={p.name} className="kv card" style={{ padding: 12 }}><span>{p.name}</span><span className="muted">{p.email}</span></div>)}
          <p className="small muted">Clients sign online in a few clicks; you’re notified when everyone has signed.</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setConfirm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { dispatch({ type: 'contract/send', id: file.id, total: fees.total, totalLabel: money(fees.total), lang: o.lang, options: o }); setConfirm(false); notify('Contract sent for e-signature') }}><Send size={16} /> Send</button>
          </div>
        </Modal>
      )}
    </>
  )
}

const Logo2 = () => <b style={{ fontFamily: 'var(--sans)', color: 'var(--navy)' }}>Étude Dubois Notaires</b>

function ClosingTab({ file }) {
  const { dispatch, notify } = useStore()
  const titleItems = [['deeds10', '10-year deed review'], ['chain30', '30-year mortgage chain check'], ['cadastre', 'Cadastre & servitudes check']]
  const summary = [
    `Dossier: ${file.id}`, `Type: ${file.type}`, `Client(s): ${file.clients.join(', ')}`, `Immeuble: ${file.addr}, ${file.city}`,
    `Prêteur: ${file.lender}${file.mortgage ? ` · ${money(file.mortgage)}` : ''}`, `Signature: ${file.booking ? `${file.booking.date} ${file.booking.time}` : '—'}`,
    `Honoraires: ${money(file.contract.total)}`, `Notaire: ${file.notary}`,
  ].join('\n')
  const copy = async () => { try { await navigator.clipboard.writeText(summary) } catch { /* blocked */ } notify('Procardex summary copied') }
  const canSign = !!file.booking && stepDone(file, 'title')
  const exportCsv = () => {
    const rows = [['Dossier', 'Type', 'Clients', 'Adresse', 'Ville', 'Preteur', 'Hypotheque', 'Signature', 'Honoraires', 'Notaire', 'Parajuriste'],
      [file.id, file.type, file.clients.join(' / '), file.addr, file.city, file.lender, file.mortgage ?? '', file.booking ? `${file.booking.date} ${file.booking.time}` : '', file.contract.total?.toFixed(2) ?? '', file.notary, file.paralegal]]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = `procardex-${file.id}.csv`; a.click()
    notify('Procardex export downloaded')
  }
  const canClose = stageInfo(file).key === 'procardex'

  return (
    <div className="grid-2">
      <section className="card stack">
        <div className="row between"><h2>1 · Title search</h2>{stepDone(file, 'title') ? <Badge tone="ok">Complete</Badge> : <Badge tone="warn">To do</Badge>}</div>
        <p className="small muted">Done by a paralegal in the Registre foncier portal; tick off each check.</p>
        {titleItems.map(([k, l]) => (
          <label key={k} className="check"><input type="checkbox" checked={file.title[k]} onChange={() => dispatch({ type: 'title/toggle', id: file.id, key: k })} /> {l}</label>
        ))}
        <a className="small" href="https://www.registrefoncier.gouv.qc.ca" target="_blank" rel="noreferrer">Open Registre foncier ↗</a>
      </section>

      <section className="card stack">
        <div className="row between"><h2>2 · Signing &amp; closing</h2>{stepDone(file, 'closing') ? <Badge tone="ok">Signed</Badge> : <Badge tone="warn">To do</Badge>}</div>
        <div className="kv"><span className="muted">Appointment</span><span>{file.booking ? `${fmtDate(file.booking.date)} · ${file.booking.time} · ${file.booking.mode}` : 'Not booked yet'}</span></div>
        <label className="check"><input type="checkbox" disabled={!canSign} checked={file.closing.consigno} onChange={() => dispatch({ type: 'closing/toggle', id: file.id, key: 'consigno', label: 'Deed signed in Consigno' })} /> Deed signed in Consigno</label>
        <label className="check"><input type="checkbox" disabled={!canSign} checked={file.closing.lenderReport} onChange={() => dispatch({ type: 'closing/toggle', id: file.id, key: 'lenderReport', label: 'Final report sent to lender' })} /> Final report sent to lender</label>
        {!canSign && <p className="small muted row" style={{ gap: 6 }}><Lock size={13} /> Available once {!stepDone(file, 'title') ? 'the title search is complete' : ''}{!stepDone(file, 'title') && !file.booking ? ' and ' : ''}{!file.booking ? 'the signing is booked' : ''}.</p>}
      </section>

      <section className="card stack">
        <div className="row between"><h2>3 · Final documents</h2>{file.docsPublished ? <Badge tone="ok">Published</Badge> : <Badge tone="warn">To do</Badge>}</div>
        {file.finalDocs.length === 0 ? (
          <button className="dropzone" disabled={!file.closing.consigno} onClick={() => { dispatch({ type: 'docs/upload', id: file.id }); notify('4 documents uploaded') }}>
            <Upload size={20} /><b>Upload executed deeds &amp; statements</b><span className="small muted">{file.closing.consigno ? 'Click to add the final PDFs' : 'Available after signing in Consigno'}</span>
          </button>
        ) : file.finalDocs.map((d) => <div key={d.name} className="kv"><span className="row" style={{ gap: 6 }}><FileText size={15} />{d.name}</span><span className="small muted">{d.size}</span></div>)}
        {file.finalDocs.length > 0 && !file.docsPublished && (
          <button className="btn btn-primary" onClick={() => { dispatch({ type: 'docs/publish', id: file.id }); notify('Published · client emailed a secure link') }}><Send size={16} /> Publish to client portal</button>
        )}
        {file.docsPublished && <p className="small muted">Client notified by email · {file.portalViewed ? '✓ downloaded by client' : 'not yet downloaded'}</p>}
      </section>

      <section className="card stack">
        <div className="row between"><h2>4 · Procardex &amp; archive</h2>{file.procardex ? <Badge tone="ok">Closed</Badge> : <Badge tone="warn">To do</Badge>}</div>
        <p className="small muted">Procardex has no API. Copy this summary and paste it into Procardex.</p>
        <pre className="summary">{summary}</pre>
        <div className="row">
          <button className="btn" onClick={copy}><Copy size={16} /> Copy summary</button>
          <button className="btn" onClick={exportCsv}><Download size={16} /> Export for Procardex (.csv)</button>
          <button className="btn btn-primary" disabled={!canClose} onClick={() => { dispatch({ type: 'procardex/done', id: file.id }); notify('File closed and archived') }}><Check size={16} /> Entered in Procardex · close file</button>
        </div>
      </section>
    </div>
  )
}

function DocumentsTab({ file }) {
  const { notify } = useStore()
  const docs = [
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
                <td className="row" style={{ gap: 8 }}>{d.cat === 'Identity' ? <ShieldCheck size={16} /> : <FileText size={16} />}<b>{d.name}</b></td>
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
