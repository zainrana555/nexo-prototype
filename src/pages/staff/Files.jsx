import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download, TriangleAlert } from 'lucide-react'
import { useStore, now } from '../../store'
import { PageHeader, Badge, Modal, Tabs } from '../../ui'
import { stageInfo, isClosed, fmtDate, STAGES } from '../../logic'
import { addDays } from '../../data'

export default function Files() {
  const { state, notify } = useStore()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const filter = params.get('filter') ?? 'active'
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const [adding, setAdding] = useState(false)

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return state.files.map((f) => ({ f, s: stageInfo(f) })).filter(({ f, s }) => {
      const byFilter = {
        active: !isClosed(f), client: !isClosed(f) && s.owner === 'Client', staff: !isClosed(f) && s.owner === 'Staff',
        escalated: f.escalated && !isClosed(f), closed: isClosed(f), all: true,
      }[filter]
      return byFilter && (type === 'All' || f.type === type) && (!ql || [f.id, f.addr, f.city, ...f.clients].join(' ').toLowerCase().includes(ql))
    })
  }, [state.files, filter, type, q])

  const count = (k) => state.files.filter((f) => ({ active: !isClosed(f), client: !isClosed(f) && stageInfo(f).owner === 'Client', staff: !isClosed(f) && stageInfo(f).owner === 'Staff', escalated: f.escalated && !isClosed(f), closed: isClosed(f) })[k]).length

  return (
    <>
      <PageHeader
        title="Files"
        sub="Every open transaction and its next step. Replaces the shared Excel tracker."
        actions={<>
          <button className="btn" onClick={() => notify('Exported files.csv (demo)')}><Download size={16} /> Export</button>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ New file</button>
        </>}
      />
      <Tabs value={filter} onChange={(k) => setParams({ filter: k })} tabs={[
        { key: 'active', label: 'Active', count: count('active') },
        { key: 'staff', label: 'Needs staff', count: count('staff') },
        { key: 'client', label: 'Waiting on client', count: count('client') },
        { key: 'escalated', label: 'Escalated', count: count('escalated') },
        { key: 'closed', label: 'Closed', count: count('closed') },
      ]} />
      <div className="row">
        <label className="grow" style={{ flexBasis: 260 }}><span className="sr-only">Search files</span><input className="input" placeholder="Search client, address, file #" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <label><span className="sr-only">Type</span><select className="select" value={type} onChange={(e) => setType(e.target.value)}>{['All', 'Purchase', 'Sale', 'Refinance'].map((t) => <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>)}</select></label>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>File #</th><th>Client(s)</th><th>Type</th><th>Property</th><th>Stage</th><th>Progress</th><th>Next action</th><th>Signing</th></tr></thead>
          <tbody>
            {rows.map(({ f, s }) => (
              <tr key={f.id} onClick={() => nav(`/app/files/${f.id}`)} className={f.isDemo ? 'highlight' : ''}>
                <td className="mono small">{f.id}</td>
                <td><b>{f.clients.join(' & ')}</b></td>
                <td>{f.type}</td>
                <td className="muted">{f.addr}, {f.city}</td>
                <td><Badge tone={s.label === 'Closed' ? 'ok' : 'navy'}>{s.label}</Badge></td>
                <td style={{ minWidth: 110 }}><div className="bar"><div style={{ width: `${(s.i / STAGES.length) * 100}%` }} /></div></td>
                <td className={f.escalated && !isClosed(f) ? 'warn' : ''}>{f.escalated && !isClosed(f) && <TriangleAlert size={14} style={{ verticalAlign: -2, marginRight: 4 }} />}{s.next} <span className="small muted">· {s.owner}</span></td>
                <td className="muted">{fmtDate(f.closingDate)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 32 }}>No files match.</td></tr>}
          </tbody>
        </table>
      </div>
      {adding && <NewFileModal onClose={() => setAdding(false)} />}
    </>
  )
}

export function NewFileModal({ onClose }) {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', type: 'Purchase', addr: '', city: 'Montréal', lang: 'FR' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const id = `26-${String(431 + state.files.length).padStart(4, '0')}`
    const name = f.name || 'New client'
    dispatch({ type: 'file/add', file: {
      id, clients: [name], type: f.type, addr: f.addr || '—', city: f.city, lang: f.lang, notary: 'Me Anne Dubois', paralegal: state.auth?.name ?? 'Nathalie Roy',
      lender: '—', closingDate: addDays(30), contract: { sent: false, signed: false, total: 0, lang: f.lang }, bankReceived: false,
      title: { deeds10: false, chain30: false, cadastre: false }, booking: null, closing: { consigno: false, lenderReport: false }, finalDocs: [],
      docsPublished: false, portalViewed: false, procardex: false, escalated: false, reminders: 0,
      parties: [{ name, role: f.type === 'Sale' ? 'Seller' : f.type === 'Refinance' ? 'Borrower' : 'Buyer', email: '—', phone: '—', marital: '—', ids: [], liveness: 'Not started', questionnaire: 0 }],
      log: [{ t: now(), e: 'File created manually · questionnaire link emailed', who: state.auth?.name ?? 'System' }],
    } })
    notify(`File ${id} created`)
    onClose()
    nav(`/app/files/${id}`)
  }
  return (
    <Modal title="New file" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <label className="field"><span>Client name</span><input className="input" value={f.name} onChange={set('name')} autoFocus /></label>
        <div className="grid-2">
          <label className="field"><span>Transaction</span><select className="select" value={f.type} onChange={set('type')}><option>Purchase</option><option>Sale</option><option>Refinance</option></select></label>
          <label className="field"><span>Client language</span><select className="select" value={f.lang} onChange={set('lang')}><option>FR</option><option>EN</option></select></label>
          <label className="field"><span>Property address</span><input className="input" value={f.addr} onChange={set('addr')} /></label>
          <label className="field"><span>City</span><input className="input" value={f.city} onChange={set('city')} /></label>
        </div>
        <p className="small muted">Most files are opened automatically when a client accepts a mini-mandate (see Leads).</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary">Create file</button></div>
      </form>
    </Modal>
  )
}
