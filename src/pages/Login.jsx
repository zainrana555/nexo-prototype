import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Zap, FolderOpen, Mail } from 'lucide-react'
import { useStore } from '../store'
import { Logo } from '../ui'
import { DemoBar } from '../layouts'
import { STAFF } from '../data'

export default function Login() {
  const { dispatch, notify } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState(STAFF[0].email)
  const [pw, setPw] = useState('demo-password')
  const [loading, setLoading] = useState(false)

  const signIn = (e) => {
    e?.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const user = STAFF.find((s) => s.email === email) ?? STAFF[0]
      dispatch({ type: 'login', user })
      notify(`Welcome back, ${user.name.replace(/^Me /, '').split(' ')[0]}`)
      nav('/app')
    }, 650)
  }

  return (
    <div className="app">
      <DemoBar />
      <div className="login">
        <section className="login-hero">
          <div className="row" style={{ gap: 12 }}>
            <Logo size={44} color="#ffffff" />
            <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: 1 }}>Nexo</span>
          </div>
          <div className="stack" style={{ gap: 18, maxWidth: 440 }}>
            <h1 style={{ fontSize: 34, lineHeight: 1.15 }}>Every real-estate file, from first inquiry to final deed.</h1>
            <p style={{ opacity: 0.85, fontSize: 16 }}>Nexo replaces email back-and-forth, Excel trackers and Word templates with one bilingual workflow for your notaries, paralegals and clients.</p>
          </div>
          <ul className="hero-list">
            <li><Mail size={18} /> Leads, quotes &amp; mini-mandates</li>
            <li><ShieldCheck size={18} /> Online questionnaires with ID verification</li>
            <li><Zap size={18} /> Automatic reminders, escalations &amp; booking</li>
            <li><FolderOpen size={18} /> Secure post-closing document portal</li>
          </ul>
          <p className="small" style={{ opacity: 0.6 }}>© Nexo · Hosted in Canada · Law 25 ready</p>
        </section>

        <section className="login-form-wrap">
          <form className="login-form stack" onSubmit={signIn}>
            <div>
              <h2 style={{ fontSize: 24 }}>Sign in</h2>
              <p className="muted">Acoca Notaires · staff workspace</p>
            </div>
            <button type="button" className="btn btn-block ms-btn" onClick={signIn}>
              <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022" /><rect x="11" y="1" width="9" height="9" fill="#7fba00" /><rect x="1" y="11" width="9" height="9" fill="#00a4ef" /><rect x="11" y="11" width="9" height="9" fill="#ffb900" /></svg>
              Sign in with Microsoft
            </button>
            <div className="divider"><span>or</span></div>
            <label className="field"><span>Demo user (choose a role to see permissions)</span>
              <select className="select" value={email} onChange={(e) => setEmail(e.target.value)}>
                {STAFF.map((s) => <option key={s.email} value={s.email}>{s.name} · {s.access}</option>)}
              </select>
            </label>
            <label className="field"><span>Password</span><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
            <div className="row between">
              <label className="check" style={{ minHeight: 0 }}><input type="checkbox" defaultChecked /> Keep me signed in</label>
              <button type="button" className="link-btn" onClick={() => notify('Password reset email sent (demo)')}>Forgot password?</button>
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
            <p className="small muted" style={{ textAlign: 'center' }}>Demo: any password works. Two-factor sign-in would apply in production.</p>
            <div className="client-cta">
              <span>Are you a client?</span>
              <Link to="/client">Open your client space →</Link>
            </div>
            <p className="small muted" style={{ textAlign: 'center' }}>New notary firm? <Link to="/signup-firm">Create your workspace</Link></p>
          </form>
        </section>
      </div>
    </div>
  )
}
