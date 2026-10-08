import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Users, CircleCheck } from 'lucide-react'
import { useStore } from '../store'
import { Logo } from '../ui'
import { DemoBar } from '../layouts'

// A new notary firm creates its own isolated Nexo workspace (multi-firm groundwork).
export default function FirmSignup() {
  const { dispatch, notify } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ name: '', neq: '', address: '', city: 'Montréal', owner: '', email: '', notaries: 3, staff: 4, lang: 'FR', plan: 'Firm' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const slug = f.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const steps = ['Firm', 'Owner', 'Microsoft 365', 'Done']
  return (
    <div className="app">
      <DemoBar />
      <div className="firm-signup">
        <div className="row" style={{ gap: 10 }}><Logo size={36} /><b style={{ fontSize: 20, color: 'var(--navy)' }}>Nexo</b><span className="muted">· Create your firm’s workspace</span></div>
        <div className="stepper">{steps.map((s, i) => <div key={s} className={'step' + (i <= step ? ' on' : '')}><span>{i + 1}</span>{s}</div>)}</div>
        <section className="card stack" style={{ maxWidth: 640 }}>
          {step === 0 && (
            <>
              <h2 className="row" style={{ gap: 6 }}><Building2 size={18} /> Your notary firm</h2>
              <div className="grid-2">
                <label className="field"><span>Firm name</span><input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Étude Exemple Notaires inc." /></label>
                <label className="field"><span>NEQ</span><input className="input" value={f.neq} onChange={set('neq')} /></label>
                <label className="field"><span>Address</span><input className="input" value={f.address} onChange={set('address')} /></label>
                <label className="field"><span>City</span><input className="input" value={f.city} onChange={set('city')} /></label>
                <label className="field"><span>Number of notaries</span><input className="input" type="number" min="1" value={f.notaries} onChange={set('notaries')} /></label>
                <label className="field"><span>Other staff</span><input className="input" type="number" min="0" value={f.staff} onChange={set('staff')} /></label>
              </div>
              {slug && <p className="small muted">Workspace address: <b>{slug}.nexo.app</b> · data hosted in Canada, isolated from other firms</p>}
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="row" style={{ gap: 6 }}><Users size={18} /> Owner account</h2>
              <div className="grid-2">
                <label className="field"><span>Notary in charge</span><input className="input" value={f.owner} onChange={set('owner')} placeholder="Me …" /></label>
                <label className="field"><span>Microsoft 365 email</span><input className="input" type="email" value={f.email} onChange={set('email')} /></label>
                <label className="field"><span>Default client language</span><select className="select" value={f.lang} onChange={set('lang')}><option>FR</option><option>EN</option></select></label>
              </div>
              <p className="small muted">The owner gets the Owner role (all permissions) and can invite the team and create roles afterwards.</p>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Connect Microsoft 365</h2>
              <p className="small muted">An administrator approves Nexo once. Staff then sign in with their Microsoft account; Outlook calendars and Teams links work automatically.</p>
              <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => notify('Microsoft admin consent granted (demo)')}><svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022" /><rect x="11" y="1" width="9" height="9" fill="#7fba00" /><rect x="1" y="11" width="9" height="9" fill="#00a4ef" /><rect x="11" y="11" width="9" height="9" fill="#ffb900" /></svg> Approve access with Microsoft</button>
              <p className="small muted">Then import: fee table, email templates, contract templates, checklists. Default ones are provided to start.</p>
            </>
          )}
          {step === 3 && (
            <div className="stack" style={{ alignItems: 'flex-start' }}>
              <CircleCheck size={36} className="ok" />
              <h2>{f.name || 'Your firm'} is ready</h2>
              <p className="small muted">{slug || 'your-firm'}.nexo.app · owner {f.owner || '—'} · {Number(f.notaries) + Number(f.staff)} seats</p>
              <Link className="btn btn-primary" to="/login">Go to sign-in</Link>
            </div>
          )}
          {step < 3 && (
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              {step > 0 ? <button className="btn" onClick={() => setStep(step - 1)}>Back</button> : <button className="btn" onClick={() => nav('/login')}>Cancel</button>}
              <button className="btn btn-primary" disabled={(step === 0 && !f.name.trim()) || (step === 1 && !(f.owner && f.email.includes('@')))} onClick={() => { if (step === 2) dispatch({ type: 'firm/signup', firm: { name: f.name, workspace: slug, plan: f.plan, users: Number(f.notaries) + Number(f.staff) } }); setStep(step + 1) }}>{step === 2 ? 'Create workspace' : 'Continue'}</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
