import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Trash2, ExternalLink, Lock } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Tabs, Badge, Avatar, Modal, Switch } from '../../ui'
import { STAFF, INTEGRATIONS, TAX, ROLES, PERMISSIONS, accessOf } from '../../data'
import { computeFees, defaultFeeSelection, money, can } from '../../logic'

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'firm'
  return (
    <>
      <PageHeader title="Settings" sub="Firm workspace, team, roles and permissions, fee table, integrations and privacy" />
      <Tabs value={tab} onChange={(k) => setParams({ tab: k })} tabs={[
        { key: 'firm', label: 'Firm' }, { key: 'team', label: 'Team' }, { key: 'roles', label: 'Roles & permissions' }, { key: 'fees', label: 'Fee table' },
        { key: 'integrations', label: 'Integrations' }, { key: 'privacy', label: 'Privacy & security' },
      ]} />
      {tab === 'firm' && <Firm />}
      {tab === 'team' && <Team />}
      {tab === 'roles' && <Roles />}
      {tab === 'fees' && <Fees />}
      {tab === 'integrations' && <Integrations />}
      {tab === 'privacy' && <Privacy />}
    </>
  )
}

function Firm() {
  const { notify } = useStore()
  return (
    <div className="split">
      <section className="card stack main">
        <div className="grid-2">
          <label className="field"><span>Firm name</span><input className="input" defaultValue="Étude Dubois Notaires inc." /></label>
          <label className="field"><span>Phone</span><input className="input" defaultValue="514-555-0100" /></label>
          <label className="field"><span>Address</span><input className="input" defaultValue="1000 rue Exemple, bureau 200, Montréal" /></label>
          <label className="field"><span>Default client language</span><select className="select"><option>Français</option><option>English</option></select></label>
        </div>
        <label className="field"><span>Email signature</span><textarea className="input" rows={3} defaultValue={'Étude Dubois Notaires inc.\n1000 rue Exemple, Montréal · 514-555-0100'} /></label>
        <div className="row"><button className="btn btn-primary" onClick={() => notify('Firm profile saved')}>Save changes</button></div>
      </section>
      <aside className="side card stack" style={{ gap: 8 }}>
        <h2>Workspace</h2>
        <div className="kv"><span className="muted">Workspace</span><span>etude-dubois</span></div>
        <div className="kv"><span className="muted">Sign-in</span><span>Microsoft 365 (Entra ID)</span></div>
        <div className="kv"><span className="muted">Data region</span><span>Canada</span></div>
        <p className="small muted">Nexo is multi-firm: each notary firm gets its own isolated workspace, users, templates and fee table, so the platform can be offered to other firms later.</p>
      </aside>
    </div>
  )
}

function Team() {
  const { notify } = useStore()
  const [invite, setInvite] = useState(false)
  return (
    <>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn btn-primary" onClick={() => setInvite(true)}>+ Invite member</button></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Job</th><th>Access role</th><th>Email</th><th>Sign-in</th><th /></tr></thead>
          <tbody>
            {STAFF.map((s) => (
              <tr key={s.email} style={{ cursor: 'default' }}>
                <td className="row"><Avatar name={s.name} size={28} /><b>{s.name}</b></td><td>{s.role}</td><td><Badge tone={['Owner', 'Super admin'].includes(s.access) ? 'navy' : 'gray'}>{s.access}</Badge></td><td className="muted">{s.email}</td>
                <td><Badge tone="ok">Microsoft</Badge></td><td><button className="link-btn" onClick={() => notify(`Editing ${s.name} (demo)`)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invite && (
        <Modal title="Invite team member" onClose={() => setInvite(false)}>
          <label className="field"><span>Microsoft 365 email</span><input className="input" type="email" placeholder="name@acocanotaires.com" /></label>
          <label className="field"><span>Access role</span><select className="select">{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={() => setInvite(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { setInvite(false); notify('Invitation sent') }}>Send invite</button></div>
        </Modal>
      )}
    </>
  )
}

function Roles() {
  const { state, dispatch, notify } = useStore()
  const editable = can(state, 'users.manage')
  const locked = (role) => role === 'Owner' || role === 'Super admin'
  return (
    <section className="card stack">
      <div className="row between">
        <div><h2>Roles &amp; permissions</h2><p className="small muted">Roles are separate from permissions. Owner and Super admin always see everything; other roles get only the permissions ticked here.</p></div>
        <span className="small muted">You are: <b>{accessOf(state.auth)}</b></span>
      </div>
      {!editable && <p className="banner warn small row" style={{ gap: 6 }}><Lock size={14} /> Only Owner and Super admin can change permissions.</p>}
      <div className="table-wrap" style={{ boxShadow: 'none' }}>
        <table className="perm-table">
          <thead><tr><th>Permission</th>{ROLES.map((r) => <th key={r} style={{ textAlign: 'center' }}>{r}<div className="small muted" style={{ fontWeight: 400 }}>{STAFF.filter((s) => s.access === r).length} user(s)</div></th>)}</tr></thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.key} style={{ cursor: 'default' }}>
                <td>{p.label}</td>
                {ROLES.map((r) => (
                  <td key={r} style={{ textAlign: 'center' }}>
                    <input type="checkbox" aria-label={`${r}: ${p.label}`} checked={(state.rolePerms[r] ?? []).includes(p.key)} disabled={!editable || locked(r)}
                      onChange={() => { dispatch({ type: 'perm/toggle', role: r, perm: p.key }); notify(`${r}: ${p.label} ${(state.rolePerms[r] ?? []).includes(p.key) ? 'removed' : 'granted'}`) }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">Example: paralegals don’t see back-office banking. Only the Owner and Super admin (the two managing notaries) assign notaries and paralegals to files.</p>
    </section>
  )
}

const KIND_LABEL = { base: 'Published price', unit: 'Per unit', option: 'Option', disbursement: 'Disbursement' }

function Fees() {
  const { state, dispatch, notify } = useStore()
  const editable = can(state, 'fees.edit')
  const [items, setItems] = useState(state.feeItems)
  const upd = (id, k, v) => setItems(items.map((i) => (i.id === id ? { ...i, [k]: v } : i)))
  const add = (kind) => setItems([...items, { id: 'x' + Date.now(), kind, type: kind === 'base' ? 'Purchase' : undefined, label: 'New line item', amount: 0, taxable: kind !== 'disbursement' }])
  const sel = defaultFeeSelection('Purchase', items, { parties: 2, remote: true })
  const ex = computeFees(sel, items)
  return (
    <div className="split">
      <section className="card main stack">
        <p className="banner warn small">Demo values. The firm’s official fee table will be loaded here.</p>
        {!editable && <p className="banner neutral small row" style={{ gap: 6 }}><Lock size={14} /> Read-only for your role.</p>}
        {['base', 'unit', 'option', 'disbursement'].map((kind) => (
          <div key={kind} className="stack" style={{ gap: 6 }}>
            <div className="row between"><h3 className="small muted">{KIND_LABEL[kind].toUpperCase()}{kind === 'base' ? 'S (CHOSEN FROM A DROPDOWN ON EACH FILE)' : 'S'}</h3>{editable && <button className="link-btn" onClick={() => add(kind)}><Plus size={13} /> Add line item</button>}</div>
            {items.filter((i) => i.kind === kind).map((i) => (
              <div key={i.id} className="fee-line">
                {kind === 'base' && <select className="select" disabled={!editable} value={i.type} onChange={(e) => upd(i.id, 'type', e.target.value)} aria-label="Transaction type"><option>Purchase</option><option>Sale</option><option>Refinance</option></select>}
                <input className="input grow" disabled={!editable} value={i.label} onChange={(e) => upd(i.id, 'label', e.target.value)} aria-label="Label" />
                <span className="money-input">$<input inputMode="decimal" disabled={!editable} value={i.amount} onChange={(e) => upd(i.id, 'amount', e.target.value.replace(/[^\d.]/g, ''))} aria-label="Amount" /></span>
                <label className="check small" style={{ minHeight: 0 }}><input type="checkbox" disabled={!editable} checked={i.taxable} onChange={(e) => upd(i.id, 'taxable', e.target.checked)} /> Taxable</label>
                {editable && <button className="icon-btn" aria-label="Remove" onClick={() => setItems(items.filter((x) => x.id !== i.id))}><Trash2 size={15} /></button>}
              </div>
            ))}
          </div>
        ))}
        <div className="kv small muted"><span>GST / QST on taxable items</span><span>{TAX.gst * 100}% / {TAX.qst * 100}%</span></div>
        {editable && <div className="row"><button className="btn btn-primary" onClick={() => { dispatch({ type: 'fees/save', items }); notify('Fee table saved · new quotes and contracts use it') }}>Save fee table</button></div>}
      </section>
      <aside className="side stack-lg">
        <section className="card stack" style={{ gap: 8 }}>
          <h2>Pricing rules</h2>
          {state.feeRules.map((r) => (
            <div key={r.id} className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              <div className="grow small"><b>If</b> {r.when}<br /><b>Then</b> {r.then}</div>
              <Switch checked={r.on} label={r.when} onChange={() => editable && dispatch({ type: 'feeRule/toggle', id: r.id })} />
            </div>
          ))}
        </section>
        <section className="card stack" style={{ gap: 6 }}>
          <h2>Example quote</h2>
          <span className="small muted">Purchase with mortgage, 2 buyers, remote signing</span>
          {ex.lines.map((l) => <div key={l.id} className="kv small"><span>{l.label}{l.qty > 1 ? ` ×${l.qty}` : ''}{!l.taxable && <span className="muted"> (non-taxable)</span>}</span><span className="mono">{money(l.amount)}</span></div>)}
          <div className="kv small"><span>GST + QST</span><span className="mono">{money(ex.gst + ex.qst)}</span></div>
          <div className="kv total"><span>Total</span><span className="mono">{money(ex.total)}</span></div>
        </section>
      </aside>
    </div>
  )
}

function Integrations() {
  const { notify } = useStore()
  const [sel, setSel] = useState(null)
  return (
    <>
      <div className="tpl-grid">
        {INTEGRATIONS.map((i) => (
          <div key={i.key} className="card stack" style={{ gap: 8 }}>
            <div className="row between"><b>{i.name}</b><Badge>{i.status}</Badge></div>
            <p className="small muted grow">{i.desc}</p>
            <div className="row">
              <button className="btn btn-sm" onClick={() => setSel(i)}>{i.status === 'Connected' ? 'Configure' : 'View setup'}</button>
              {i.key === 'consigno' && <button className="btn btn-sm btn-primary" onClick={() => notify('Opening Consigno: signed in through the secure tunnel (demo)')}><ExternalLink size={14} /> Open Consigno</button>}
            </div>
          </div>
        ))}
      </div>
      {sel && (
        <Modal title={sel.name} onClose={() => setSel(null)}>
          <p>{sel.desc}</p>
          <div className="kv"><span className="muted">Status</span><Badge>{sel.status}</Badge></div>
          {sel.status === 'Manual' && <p className="small muted">No public API is available, so Nexo tracks this step with a checklist and copy-ready data.</p>}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setSel(null)}>Close</button>
            {sel.status === 'Connected' && <button className="btn btn-primary" onClick={() => { setSel(null); notify('Connection tested: OK') }}>Test connection</button>}
          </div>
        </Modal>
      )}
    </>
  )
}

function Privacy() {
  const { notify } = useStore()
  const [s, setS] = useState({ mfa: true, ca: true, bio: true, purge: true })
  const items = [
    ['mfa', 'Require two-factor sign-in for all staff (Microsoft Entra)'],
    ['ca', 'Store all data in Canada (Canada Central / East)'],
    ['bio', 'Ask explicit consent before face check (biometrics, Law 25)'],
    ['purge', 'Delete client ID images 90 days after closing'],
  ]
  return (
    <section className="card stack" style={{ maxWidth: 720 }}>
      {items.map(([k, l]) => (
        <div key={k} className="row between" style={{ padding: '6px 0' }}><span>{l}</span><Switch checked={s[k]} label={l} onChange={() => { setS({ ...s, [k]: !s[k] }); notify('Setting updated') }} /></div>
      ))}
      <div className="kv"><span className="muted">Privacy officer (Law 25)</span><span>Me Anne Dubois</span></div>
      <div className="kv"><span className="muted">Client portal link expiry</span><span>30 days</span></div>
      <div className="kv"><span className="muted">Development team</span><span>Under signed NDA</span></div>
      <div className="row"><button className="btn" onClick={() => notify('Audit log exported (demo)')}>Export audit log</button></div>
    </section>
  )
}
