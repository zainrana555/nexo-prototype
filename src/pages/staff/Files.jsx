import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Download, TriangleAlert } from 'lucide-react'
import { useStore, now } from '../../store'
import { PageHeader, Badge, Modal, Tabs } from '../../ui'
import { stageInfo, isClosed, fmtDate, STAGES, contractOverdue, money } from '../../logic'
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
        escalated: f.escalated && !isClosed(f), overdue: contractOverdue(f), closed: isClosed(f), all: true,
      }[filter]
      return byFilter && (type === 'All' || f.type === type) && (!ql || [f.id, f.addr, f.city, ...f.clients].join(' ').toLowerCase().includes(ql))
    })
  }, [state.files, filter, type, q])

  const count = (k) => state.files.filter((f) => ({ active: !isClosed(f), client: !isClosed(f) && stageInfo(f).owner === 'Client', staff: !isClosed(f) && stageInfo(f).owner === 'Staff', escalated: f.escalated && !isClosed(f), overdue: contractOverdue(f), closed: isClosed(f) })[k]).length

  return (
    <>
      <PageHeader
        title="Files"
        sub="Every open transaction and its next step. Replaces the shared Excel tracker."
        actions={<>
          <button className="btn" onClick={() => exportRows(rows, 'csv', notify)}><Download size={16} /> CSV</button>
          <button className="btn" onClick={() => exportRows(rows, 'xls', notify)}><Download size={16} /> Excel</button>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ New file</button>
        </>}
      />
      <Tabs value={filter} onChange={(k) => setParams({ filter: k })} tabs={[
        { key: 'active', label: 'Active', count: count('active') },
        { key: 'staff', label: 'Needs staff', count: count('staff') },
        { key: 'client', label: 'Waiting on client', count: count('client') },
        { key: 'escalated', label: 'Escalated', count: count('escalated') },
        { key: 'overdue', label: 'Contract overdue', count: count('overdue') },
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

// Export the visible rows. Excel opens the .xls (HTML table) natively; CSV is UTF-8 with BOM for accents.
function exportRows(rows, kind, notify) {
  const head = ['File', 'Clients', 'Type', 'Address', 'City', 'Stage', 'Next action', 'Owner', 'Notary', 'Paralegal', 'Signing date', 'Fees']
  const data = rows.map(({ f, s }) => [f.id, f.clients.join(' & '), f.type, f.addr, f.city, s.label, s.next, s.owner, f.notary, f.paralegal, f.booking?.date ?? f.closingDate ?? '', f.contract.total ? money(f.contract.total) : ''])
  let blob
  if (kind === 'csv') {
    const csv = [head, ...data].map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    blob = new Blob(['\ufeff' + csv], { type: 'text/csv' })
  } else {
    const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const html = `<html><head><meta charset="utf-8"></head><body><table border="1"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${data.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nexo-files.${kind}`; a.click(); URL.revokeObjectURL(a.href)
  notify(`Exported ${rows.length} files (${kind === 'csv' ? 'CSV' : 'Excel'})`)
}

export function NewFileModal({ onClose }) {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', type: 'Purchase', addr: '', city: 'Montréal', lang: 'FR', status: 'Offer accepted', clientType: 'Individual' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const id = `26-${String(431 + state.files.length).padStart(4, '0')}`
    const name = f.name || 'New client'
    dispatch({ type: 'file/add', file: {
      id, clients: [name], type: f.type, addr: f.addr || '—', city: f.city, lang: f.lang, notary: 'Me Anne Dubois', paralegal: state.auth?.name ?? 'Nathalie Roy',
      lender: '—', closingDate: addDays(30), contract: { sent: false, signed: false, total: 0, lang: f.lang }, bankReceived: false,
      title: { deeds10: false, chain30: false, cadastre: false, index: false, bankruptcy: false, municipalTax: false, schoolTax: false }, funds: { requested: false, received: false }, clientType: f.clientType, purchaseStatus: f.status, booking: null, closing: { consigno: false, lenderReport: false }, finalDocs: [],
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
          <label className="field"><span>Transaction status</span><select className="select" value={f.status} onChange={set('status')}><option>Offer accepted</option><option>Conditional</option><option>Firm (conditions lifted)</option><option>Refinance approved</option></select></label>
          <label className="field"><span>Client is</span><select className="select" value={f.clientType} onChange={set('clientType')}><option>Individual</option><option>Corporation</option></select></label>
          <label className="field"><span>Property address</span><input className="input" value={f.addr} onChange={set('addr')} /></label>
          <label className="field"><span>City</span><input className="input" value={f.city} onChange={set('city')} /></label>
        </div>
        <p className="small muted">Most files are opened automatically when a client accepts a mini-mandate (see Leads).</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary">Create file</button></div>
      </form>
    </Modal>
  )
}
