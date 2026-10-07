import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../store'
import { PageHeader, Tabs, Badge, Avatar, Modal, Switch } from '../../ui'
import { STAFF, INTEGRATIONS, TAX } from '../../data'
import { computeFees, money } from '../../logic'

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'firm'
  return (
    <>
      <PageHeader title="Settings" sub="Firm profile, team, fee table, integrations and privacy" />
      <Tabs value={tab} onChange={(k) => setParams({ tab: k })} tabs={[
        { key: 'firm', label: 'Firm' }, { key: 'team', label: 'Team' }, { key: 'fees', label: 'Fee table' },
        { key: 'integrations', label: 'Integrations' }, { key: 'privacy', label: 'Privacy & security' },
      ]} />
      {tab === 'firm' && <Firm />}
      {tab === 'team' && <Team />}
      {tab === 'fees' && <Fees />}
      {tab === 'integrations' && <Integrations />}
      {tab === 'privacy' && <Privacy />}
    </>
  )
}

function Firm() {
  const { notify } = useStore()
  return (
    <section className="card stack" style={{ maxWidth: 720 }}>
      <div className="grid-2">
        <label className="field"><span>Firm name</span><input className="input" defaultValue="Étude Dubois Notaires inc." /></label>
        <label className="field"><span>Phone</span><input className="input" defaultValue="514-555-0100" /></label>
        <label className="field"><span>Address</span><input className="input" defaultValue="1000 rue Exemple, bureau 200, Montréal" /></label>
        <label className="field"><span>Default client language</span><select className="select"><option>Français</option><option>English</option></select></label>
      </div>
      <label className="field"><span>Email signature</span><textarea className="input" rows={3} defaultValue={'Étude Dubois Notaires inc.\n1000 rue Exemple, Montréal · 514-555-0100'} /></label>
      <div className="row"><button className="btn btn-primary" onClick={() => notify('Firm profile saved')}>Save changes</button></div>
    </section>
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
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Two-factor</th><th /></tr></thead>
          <tbody>
            {STAFF.map((s) => (
              <tr key={s.email} style={{ cursor: 'default' }}>
                <td className="row"><Avatar name={s.name} size={28} /><b>{s.name}</b></td><td>{s.role}</td><td className="muted">{s.email}</td>
                <td><Badge tone="ok">On</Badge></td><td><button className="link-btn" onClick={() => notify(`Editing ${s.name} (demo)`)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invite && (
        <Modal title="Invite team member" onClose={() => setInvite(false)}>
          <label className="field"><span>Email</span><input className="input" type="email" placeholder="name@etude-demo.ca" /></label>
          <label className="field"><span>Role</span><select className="select"><option>Paralegal</option><option>Notary</option><option>Admin</option></select></label>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={() => setInvite(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { setInvite(false); notify('Invitation sent') }}>Send invite</button></div>
        </Modal>
      )}
    </>
  )
}

function Fees() {
  const { state, dispatch, notify } = useStore()
  const [r, setR] = useState(state.rates)
  const rows = [['Purchase', 'Base fee: purchase (with mortgage)'], ['Sale', 'Base fee: sale'], ['Refinance', 'Base fee: refinance'], ['perExtraParty', 'Each additional party'], ['remoteSigning', 'Remote signing'], ['rush', 'Rush file'], ['discharge', 'Each existing mortgage to discharge'], ['disbursements', 'Disbursements (registry, searches)']]
  const example = computeFees({ type: 'Purchase', parties: 2, remote: true }, r)
  return (
    <div className="split">
      <section className="card main stack">
        <p className="banner warn small">Demo values. Replace them with the firm’s official fee reference table.</p>
        {rows.map(([k, label]) => (
          <label key={k} className="fee-row"><span>{label}</span><span className="money-input">$<input inputMode="decimal" value={r[k]} onChange={(e) => setR({ ...r, [k]: e.target.value.replace(/[^\d.]/g, '') })} /></span></label>
        ))}
        <div className="kv small muted"><span>GST / QST</span><span>{TAX.gst * 100}% / {TAX.qst * 100}%</span></div>
        <div className="row"><button className="btn btn-primary" onClick={() => { dispatch({ type: 'rates', rates: r }); notify('Fee table saved · new quotes use these rates') }}>Save fee table</button></div>
      </section>
      <aside className="side card stack" style={{ gap: 8 }}>
        <h2>Example quote</h2>
        <span className="small muted">Purchase, 2 buyers, remote signing</span>
        <div className="kv"><span>Fees</span><span className="mono">{money(example.professional + example.remoteFee)}</span></div>
        <div className="kv"><span>Taxes</span><span className="mono">{money(example.gst + example.qst)}</span></div>
        <div className="kv"><span>Disbursements</span><span className="mono">{money(example.disbursements)}</span></div>
        <div className="kv total"><span>Total</span><span className="mono">{money(example.total)}</span></div>
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
            <button className="btn btn-sm" onClick={() => setSel(i)}>{i.status === 'Connected' ? 'Configure' : 'View setup'}</button>
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
    ['mfa', 'Require two-factor sign-in for all staff'],
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
      <div className="row"><button className="btn" onClick={() => notify('Audit log exported (demo)')}>Export audit log</button></div>
    </section>
  )
}
