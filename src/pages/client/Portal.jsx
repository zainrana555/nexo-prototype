import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { DEMO_FILE } from '../../data'

function downloadSample(name) {
  const blob = new Blob([`${name}\n\nSample document. Nexo demo.\n`], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name.replace(/[^\w]+/g, '-').toLowerCase() + '.txt'
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function Portal() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const [phase, setPhase] = useState('email')
  const [email, setEmail] = useState('emilie.gagnon@exemple.ca')
  const [code, setCode] = useState('')

  if (phase !== 'docs') {
    return (
      <div className="body">
        <h1>{t(L, 'portalTitle')}</h1>
        {phase === 'email' ? (
          <form className="stack" onSubmit={(e) => { e.preventDefault(); setPhase('code'); notify(L === 'fr' ? 'Code envoyé' : 'Code sent') }}>
            <p className="muted" style={{ fontSize: 14 }}>{t(L, 'portalLogin')}</p>
            <label className="field"><span>{t(L, 'email')}</span><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <button className="btn btn-primary btn-block">{t(L, 'sendCode')}</button>
            <button type="button" className="link-btn" onClick={() => nav('/client/signup')}>{t(L, 'suTitle')}</button>
          </form>
        ) : (
          <form className="stack" onSubmit={(e) => { e.preventDefault(); setPhase('docs') }}>
            <label className="field"><span>{t(L, 'code')}</span>
              <input className="input mono otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus />
            </label>
            <p className="small muted">{t(L, 'codeHint')}</p>
            <button className="btn btn-primary btn-block" disabled={code.length !== 6}>{t(L, 'verify')}</button>
          </form>
        )}
      </div>
    )
  }

  const docs = file?.docsPublished ? file.finalDocs : []
  const get = (name) => { downloadSample(name); dispatch({ type: 'portal/viewed', id: DEMO_FILE }) }

  return (
    <>
      <div className="body">
        <div>
          <h1>{t(L, 'portalTitle')}</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{t(L, 'portalSub', { id: DEMO_FILE })}</p>
        </div>
        {docs.length === 0 ? <p className="banner neutral">{t(L, 'portalNone')}</p> : (
          <div className="card" style={{ padding: 0 }}>
            {docs.map((d) => {
              const name = L === 'fr' ? d.nameFr : d.name
              return (
                <div key={d.name} className="doc-row">
                  <span className="doc-icon"><FileText size={18} /></span>
                  <div className="grow" style={{ minWidth: 0 }}><b>{name}</b><div className="small muted">PDF · {d.size}</div></div>
                  <button className="icon-btn" aria-label={`${t(L, 'download')} ${name}`} onClick={() => get(name)}><Download size={18} /></button>
                </div>
              )
            })}
          </div>
        )}
        <p className="banner neutral small">{t(L, 'expires')}</p>
      </div>
      {docs.length > 0 && (
        <footer><button className="btn btn-primary btn-block" onClick={() => { dispatch({ type: 'portal/viewed', id: DEMO_FILE }); notify(L === 'fr' ? 'Téléchargement du .zip' : 'Downloading .zip') }}><Download size={16} /> {t(L, 'downloadAll')}</button></footer>
      )}
    </>
  )
}
