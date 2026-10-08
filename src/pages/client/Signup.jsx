import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'

// Client account creation: email → one-time code → password (or Google / Microsoft) → two-step verification by text.
export default function Signup() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const [step, setStep] = useState(state.clientAccount ? 4 : 0)
  const [email, setEmail] = useState('emilie.gagnon@exemple.ca')
  const [code, setCode] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [phone, setPhone] = useState('514-555-0142')
  const [method, setMethod] = useState('password')
  const pwOk = pw.length >= 10 && /\d/.test(pw) && pw === pw2
  const finish = (m) => { dispatch({ type: 'client/signup', email, method: m ?? method, twoFactor: true }); notify(L === 'fr' ? 'Compte créé' : 'Account created'); setStep(4) }

  return (
    <>
      <div className="body">
        <div className="progress" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>{[0, 1, 2, 3].map((i) => <div key={i} className={i <= step ? 'on' : ''} />)}</div>
        {step === 0 && (
          <>
            <h1>{t(L, 'suTitle')}</h1>
            <p className="muted" style={{ fontSize: 14 }}>{t(L, 'suSub')}</p>
            <label className="field"><span>{t(L, 'email')}</span><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <div className="divider"><span>{t(L, 'suOr')}</span></div>
            <button className="btn btn-block" onClick={() => { setMethod('Google'); setStep(3) }}><svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg> {t(L, 'suGoogle')}</button>
            <button className="btn btn-block" onClick={() => { setMethod('Microsoft'); setStep(3) }}><svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022" /><rect x="11" y="1" width="9" height="9" fill="#7fba00" /><rect x="1" y="11" width="9" height="9" fill="#00a4ef" /><rect x="11" y="11" width="9" height="9" fill="#ffb900" /></svg> {t(L, 'suMicrosoft')}</button>
            <p className="small muted" style={{ textAlign: 'center' }}>{t(L, 'liHaveAccount')} <Link to="/client/login">{t(L, 'liSignIn')}</Link></p>
          </>
        )}
        {step === 1 && (
          <>
            <h1>{t(L, 'suCode')}</h1>
            <p className="muted small">{email}</p>
            <input className="input mono otp" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} aria-label={t(L, 'code')} autoFocus />
            <p className="small muted">{t(L, 'codeHint')}</p>
          </>
        )}
        {step === 2 && (
          <>
            <h1>{t(L, 'suPassword')}</h1>
            <label className="field"><span>{t(L, 'suPassword')}</span><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
            <label className="field"><span>{t(L, 'suPassword2')}</span><input className="input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></label>
            <p className={'small ' + (pwOk ? 'ok' : 'muted')}>{pwOk ? '✓ ' : ''}{t(L, 'pwRules')}</p>
          </>
        )}
        {step === 3 && (
          <>
            <h1>{t(L, 'su2fa')}</h1>
            <p className="muted small">{method !== 'password' ? `${method} · ` : ''}{L === 'fr' ? 'Un code vous sera envoyé par texto à chaque nouvelle connexion.' : 'A code will be texted to you at each new sign-in.'}</p>
            <label className="field"><span>{t(L, 'suPhone')}</span><input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          </>
        )}
        {step === 4 && (
          <div className="stack" style={{ alignItems: 'center', textAlign: 'center', gap: 12 }}>
            <div className="big-check" aria-hidden="true"><ShieldCheck size={30} /></div>
            <h1>{t(L, 'suDone')}</h1>
            <p className="muted small">{state.clientAccount?.email ?? email} · {L === 'fr' ? 'vérification en deux étapes activée' : 'two-step verification on'}</p>
            <button className="btn btn-primary btn-block" onClick={() => nav('/client')}>{t(L, 'toMessages')}</button>
          </div>
        )}
      </div>
      {step < 4 && (
        <footer>
          {step > 0 && <button className="btn" style={{ flex: 1 }} onClick={() => setStep(method !== 'password' && step === 3 ? 0 : step - 1)}>{t(L, 'back')}</button>}
          <button className="btn btn-primary" style={{ flex: 2, minHeight: 48 }}
            disabled={(step === 0 && !email.includes('@')) || (step === 1 && code.length !== 6) || (step === 2 && !pwOk) || (step === 3 && phone.length < 7)}
            onClick={() => { if (step === 0) { setMethod('password'); notify(L === 'fr' ? 'Code envoyé' : 'Code sent'); setStep(1) } else if (step === 3) finish(); else setStep(step + 1) }}>
            {step === 3 ? t(L, 'suCreate') : t(L, 'suNext')}
          </button>
        </footer>
      )}
    </>
  )
}
