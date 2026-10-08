import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { t } from '../../i18n'

// Returning clients sign in (password or Google / Microsoft, then a texted code). No account → sign-up.
export default function ClientLogin() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const [email, setEmail] = useState(state.clientAccount?.email ?? 'emilie.gagnon@exemple.ca')
  const [pw, setPw] = useState('')
  const [phase, setPhase] = useState('creds')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const known = state.clientAccount && state.clientAccount.email.toLowerCase() === email.trim().toLowerCase()
  const next = () => {
    if (!known) { setError(t(L, 'liUnknown')); return }
    setError(''); setPhase('code'); notify(L === 'fr' ? 'Code envoyé par texto' : 'Code texted')
  }
  const done = () => { dispatch({ type: 'client/login' }); nav('/client') }

  return (
    <>
      <div className="body">
        <h1>{t(L, 'liTitle')}</h1>
        <p className="muted" style={{ fontSize: 14 }}>{t(L, 'liSub')}</p>
        {phase === 'creds' ? (
          <>
            <label className="field"><span>{t(L, 'email')}</span><input className="input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} /></label>
            {state.clientAccount?.method && state.clientAccount.method !== 'password' ? (
              <button className="btn btn-block" onClick={next}>{L === 'fr' ? 'Continuer avec' : 'Continue with'} {state.clientAccount.method}</button>
            ) : (
              <label className="field"><span>{L === 'fr' ? 'Mot de passe' : 'Password'}</span><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
            )}
            {error && <p className="small" style={{ color: 'var(--bad)' }}>{error} <Link to="/client/signup">{t(L, 'suTitle')}</Link></p>}
            <p className="small muted" style={{ textAlign: 'center' }}>{t(L, 'liNoAccount')} <Link to="/client/signup">{t(L, 'suTitle')}</Link></p>
          </>
        ) : (
          <>
            <p className="small muted">{L === 'fr' ? 'Entrez le code reçu par texto.' : 'Enter the code we texted you.'}</p>
            <input className="input mono otp" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} aria-label={t(L, 'code')} autoFocus />
            <p className="small muted">{t(L, 'codeHint')}</p>
          </>
        )}
      </div>
      <footer>
        {phase === 'creds'
          ? <button className="btn btn-primary btn-block" disabled={!email.includes('@') || (!pw && state.clientAccount?.method === 'password')} onClick={next}>{t(L, 'liSignIn')}</button>
          : <button className="btn btn-primary btn-block" disabled={code.length !== 6} onClick={done}>{t(L, 'verify')}</button>}
      </footer>
    </>
  )
}
