import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Trash2, ExternalLink, Lock } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Tabs, Badge, Avatar, Modal, Switch } from '../../ui'
import { INTEGRATIONS, TAX, PERMISSIONS, accessOf } from '../../data'
import { VIRTUAL_BANKS, PRIVATE_LENDERS } from '../../firm'
import { can } from '../../logic'

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
          <label className="field"><span>Firm name</span><input className="input" defaultValue="Acoca Notaires inc." /></label>
          <label className="field"><span>Phone</span><input className="input" defaultValue="514 748-6539" /></label>
          <label className="field"><span>Address</span><input className="input" defaultValue="700 Av. Sainte-Croix, Saint-Laurent (Québec) H4L 3Y3" /></label>
          <label className="field"><span>Default client language</span><select className="select"><option>Français</option><option>English</option></select></label>
        </div>
        <label className="field"><span>Email signature</span><textarea className="input" rows={3} defaultValue={'Acoca Notaires inc.\n700 Av. Sainte-Croix, Saint-Laurent · 514 748-6539'} /></label>
        <div className="row"><button className="btn btn-primary" onClick={() => notify('Firm profile saved')}>Save changes</button></div>
      </section>
      <aside className="side card stack" style={{ gap: 8 }}>
        <h2>Workspace</h2>
        <div className="kv"><span className="muted">Workspace</span><span>acoca-notaires</span></div>
        <p className="banner warn small">Address to confirm: the firm moved to 700 Av. Sainte-Croix (Sept 8, 2026), but the service contracts and emails still say 665 boul. Décarie.</p>
        <div className="kv"><span className="muted">Sign-in</span><span>Microsoft 365 (Entra ID)</span></div>
        <div className="kv"><span className="muted">Data region</span><span>Canada</span></div>
        <p className="small muted">Nexo is multi-firm: each notary firm gets its own isolated workspace, users, templates and fee table, so the platform can be offered to other firms later.</p>
      </aside>
    </div>
  )
}

function Team() {
  const { state, dispatch, notify } = useStore()
  const [invite, setInvite] = useState(false)
  const editable = can(state, 'users.manage')
  return (
    <>
      <div className="row between">
        <p className="small muted">Staff sign in with their Microsoft 365 account. Inviting someone sends them a sign-in link; their access role sets what they can see and do.</p>
        <button className="btn btn-primary" disabled={!editable} onClick={() => setInvite(true)}>+ Invite team member</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Job</th><th>Access role</th><th>Email</th><th>Status</th><th /></tr></thead>
          <tbody>
            {state.users.map((u) => (
              <tr key={u.email} style={{ cursor: 'default' }}>
                <td className="row"><Avatar name={u.name} size={28} /><b>{u.name}</b></td><td>{u.role}</td><td><Badge tone={['Owner', 'Super admin'].includes(u.access) ? 'navy' : 'gray'}>{u.access}</Badge></td><td className="muted">{u.email}</td>
                <td>{u.status === 'Invited' ? <Badge tone="warn">Invited</Badge> : <Badge tone="ok">Active</Badge>}</td>
                <td>{u.status === 'Invited' ? <button className="link-btn" onClick={() => { dispatch({ type: 'user/accept', email: u.email }); notify(`${u.name} accepted the invitation (demo)`) }}>Simulate accept</button> : <button className="link-btn" onClick={() => notify(`Editing ${u.name} (demo)`)}>Edit</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invite && <InviteModal onClose={() => setInvite(false)} />}
    </>
  )
}

function InviteModal({ onClose }) {
  const { state, dispatch, notify } = useStore()
  const [u, setU] = useState({ name: '', email: '', role: 'Paralegal', access: 'Paralegal', notaries: [], lang: 'FR' })
  const notaries = state.users.filter((x) => x.role === 'Notary')
  const set = (k) => (e) => setU({ ...u, [k]: e.target.value })
  const ok = u.name.trim() && /@/.test(u.email)
  return (
    <Modal title="Invite a team member" onClose={onClose} wide>
      <div className="split" style={{ gap: 18 }}>
        <div className="main stack">
          <div className="grid-2">
            <label className="field"><span>Full name</span><input className="input" value={u.name} onChange={set('name')} placeholder="e.g. Julie Martin" /></label>
            <label className="field"><span>Microsoft 365 email</span><input className="input" type="email" value={u.email} onChange={set('email')} placeholder="name@acocanotaires.com" /></label>
            <label className="field"><span>Job</span><select className="select" value={u.role} onChange={set('role')}>{['Notary', 'Paralegal', 'Reception', 'Articling student', 'Accounting'].map((r) => <option key={r}>{r}</option>)}</select></label>
            <label className="field"><span>Access role</span><select className="select" value={u.access} onChange={set('access')}>{state.roles.map((r) => <option key={r}>{r}</option>)}</select></label>
            <label className="field"><span>Interface language</span><select className="select" value={u.lang} onChange={set('lang')}><option>FR</option><option>EN</option></select></label>
          </div>
          {u.role !== 'Notary' && (
            <div className="field"><span>Works with (notaries)</span>
              <div className="row" style={{ gap: 10 }}>{notaries.map((n) => <label key={n.name} className="check small" style={{ minHeight: 0 }}><input type="checkbox" checked={u.notaries.includes(n.name)} onChange={(e) => setU({ ...u, notaries: e.target.checked ? [...u.notaries, n.name] : u.notaries.filter((x) => x !== n.name) })} />{n.name}</label>)}</div>
            </div>
          )}
        </div>
        <aside className="side card stack" style={{ gap: 6 }}>
          <b>{u.access} can:</b>
          {PERMISSIONS.filter((p) => (state.rolePerms[u.access] ?? []).includes(p.key)).map((p) => <span key={p.key} className="small"><span className="ok">✓</span> {p.label}</span>)}
          {PERMISSIONS.filter((p) => !(state.rolePerms[u.access] ?? []).includes(p.key)).map((p) => <span key={p.key} className="small muted">✕ {p.label}</span>)}
        </aside>
      </div>
      <p className="small muted">They receive an email with a Microsoft sign-in link. Two-factor rules come from the firm’s Microsoft 365 tenant.</p>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!ok} onClick={() => { dispatch({ type: 'user/invite', user: { name: u.name, email: u.email, role: u.role, access: u.access, notaries: u.notaries } }); notify(`Invitation sent to ${u.email}`); onClose() }}>Send invitation</button></div>
    </Modal>
  )
}

function Roles() {
  const { state, dispatch, notify } = useStore()
  const [creating, setCreating] = useState(false)
  const editable = can(state, 'users.manage')
  const locked = (role) => role === 'Owner' || role === 'Super admin'
  return (
    <section className="card stack">
      <div className="row between">
        <div><h2>Roles &amp; permissions</h2><p className="small muted">Roles are separate from permissions. Owner and Super admin always see everything; other roles get only the permissions ticked here.</p></div>
        <div className="row"><span className="small muted">You are: <b>{accessOf(state.auth)}</b></span><button className="btn btn-primary btn-sm" disabled={!editable} onClick={() => setCreating(true)}>+ New role</button></div>
      </div>
      {!editable && <p className="banner warn small row" style={{ gap: 6 }}><Lock size={14} /> Only Owner and Super admin can change roles and permissions.</p>}
      <div className="table-wrap" style={{ boxShadow: 'none' }}>
        <table className="perm-table">
          <thead><tr><th>Permission</th>{state.roles.map((r) => <th key={r} style={{ textAlign: 'center' }}>{r}<div className="small muted" style={{ fontWeight: 400 }}>{state.users.filter((u) => u.access === r).length} user(s){state.roleInfo?.[r] ? ' · custom' : ''}</div></th>)}</tr></thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.key} style={{ cursor: 'default' }}>
                <td>{p.label}</td>
                {state.roles.map((r) => (
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
      {creating && <NewRoleModal onClose={() => setCreating(false)} />}
    </section>
  )
}

function NewRoleModal({ onClose }) {
  const { state, dispatch, notify } = useStore()
  const [r, setR] = useState({ name: '', description: '', from: 'Paralegal', perms: state.rolePerms.Paralegal ?? [] })
  const exists = state.roles.includes(r.name.trim())
  return (
    <Modal title="Create a role" onClose={onClose} wide>
      <div className="grid-2">
        <label className="field"><span>Role name</span><input className="input" value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} placeholder="e.g. Accounting, Articling student" /></label>
        <label className="field"><span>Start from</span><select className="select" value={r.from} onChange={(e) => setR({ ...r, from: e.target.value, perms: state.rolePerms[e.target.value] ?? [] })}>{state.roles.map((x) => <option key={x}>{x}</option>)}<option value="">Blank</option></select></label>
      </div>
      <label className="field"><span>Description</span><input className="input" value={r.description} onChange={(e) => setR({ ...r, description: e.target.value })} placeholder="What this role is for" /></label>
      <div className="perm-pick">
        {PERMISSIONS.map((p) => <label key={p.key} className="check small"><input type="checkbox" checked={r.perms.includes(p.key)} onChange={(e) => setR({ ...r, perms: e.target.checked ? [...r.perms, p.key] : r.perms.filter((x) => x !== p.key) })} /> {p.label}</label>)}
      </div>
      {exists && <p className="small warn">A role with this name already exists.</p>}
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!r.name.trim() || exists} onClick={() => { dispatch({ type: 'role/add', role: { name: r.name.trim(), description: r.description, perms: r.perms } }); notify(`Role “${r.name.trim()}” created with ${r.perms.length} permissions`); onClose() }}>Create role</button></div>
    </Modal>
  )
}

const CATS = ['Residential', 'Virtual bank', 'Multi-residential', 'Commercial', 'Private lender', 'Wills', 'Mandates', 'Packages', 'Successions']

function Fees() {
  const { state, dispatch, notify } = useStore()
  const editable = can(state, 'fees.edit')
  const [items, setItems] = useState(state.feeItems)
  const upd = (id, k, v) => setItems(items.map((i) => (i.id === id ? { ...i, [k]: v } : i)))
  const add = (category) => setItems([...items, { id: 'x' + Date.now(), kind: category ? 'base' : 'option', category, property: 'New item', transaction: '—', label: 'New item', amount: 0, taxable: true }])
  const row = (i) => (
    <div key={i.id} className="fee-line">
      <input className="input grow" disabled={!editable} value={i.kind === 'base' ? i.label : i.label} onChange={(e) => upd(i.id, 'label', e.target.value)} aria-label="Label" />
      <span className="money-input">$<input inputMode="decimal" disabled={!editable} value={i.amount} onChange={(e) => upd(i.id, 'amount', e.target.value.replace(/[^\d.]/g, ''))} aria-label="Amount" /></span>
      <span className="small muted" style={{ width: 22 }}>{i.kind === 'base' ? '++' : ''}</span>
      {i.deposit && <Badge tone="warn">Deposit</Badge>}
      {editable && <button className="icon-btn" aria-label="Remove" onClick={() => setItems(items.filter((x) => x.id !== i.id))}><Trash2 size={15} /></button>}
    </div>
  )
  return (
    <div className="split">
      <section className="card main stack">
        <div className="row between"><h2>Honoraires (Acoca Notaires)</h2><span className="small muted">++ = plus taxes and disbursements</span></div>
        {!editable && <p className="banner neutral small row" style={{ gap: 6 }}><Lock size={14} /> Read-only for your role.</p>}
        {CATS.map((c) => (
          <div key={c} className="stack" style={{ gap: 6 }}>
            <div className="row between"><h3 className="small muted">{c.toUpperCase()}</h3>{editable && <button className="link-btn" onClick={() => add(c)}><Plus size={13} /> Add</button>}</div>
            {c === 'Virtual bank' && <span className="small muted">{VIRTUAL_BANKS.join(', ')}</span>}
            {c === 'Private lender' && <span className="small muted">{PRIVATE_LENDERS.join(', ')}</span>}
            {items.filter((i) => i.kind === 'base' && i.category === c).map(row)}
          </div>
        ))}
        <div className="stack" style={{ gap: 6 }}>
          <div className="row between"><h3 className="small muted">OTHER FEES</h3>{editable && <button className="link-btn" onClick={() => add(null)}><Plus size={13} /> Add</button>}</div>
          {items.filter((i) => (i.kind === 'option' || i.kind === 'unit') && Number(i.amount) > 0).map(row)}
        </div>
        <div className="kv small muted"><span>GST / QST on fees and taxable disbursements</span><span>{TAX.gst * 100}% / {TAX.qst * 100}%</span></div>
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
          <h2>Disbursements</h2>
          <p className="small muted">Itemized per service contract (registry fees, Telus Assyst, Pro-Cardex, Notarius, Consigno…), taxable or not, exactly as in the firm’s templates. Edited per file on the contract.</p>
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
