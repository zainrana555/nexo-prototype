import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { DEMO_FILE } from '../../data'
import { NotYet } from './Mandate'

const TOTAL = 6
const ID_TYPES_EN = ['Passport', "Driver's licence", 'Health insurance card']
const MARITAL_EN = ['Single', 'Married', 'Civil union', 'Common-law', 'Divorced', 'Widowed']
const today = () => new Date().toISOString().slice(0, 10)

export default function Intake() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const lead = state.leads.find((l) => l.id === file?.fromLead)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [d, setD] = useState({
    name: 'Émilie Gagnon', email: lead?.email ?? '', phone: lead?.phone ?? '', address: '220 rue Exemple, app. 4, Montréal', dob: '1991-03-14',
    marital: 0, regime: 0, coParty: false, propAddr: lead?.property ?? '', closing: file?.closingDate ?? '', lender: 'Banque Exemple', sellerName: 'Gestion Immo Exemple inc.', insurer: 'Assurances Exemple', policy: '',
    insBank: false, ids: [], signMode: 'remote', face: 'idle', faceConsent: false, consent: false,
  })
  const set = useCallback((k, v) => setD((x) => ({ ...x, [k]: v })), [])

  if (!file) return <NotYet L={L} />
  const party = file.parties[0]
  if (party.questionnaire === 100 && !done) {
    return (
      <div className="body" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h1>{t(L, 'alreadyDone')}</h1>
        <button className="btn btn-primary btn-block" onClick={() => nav('/client/file')}>{t(L, 'toFile')}</button>
      </div>
    )
  }

  const validIds = d.ids.filter((i) => i.exp >= today()).length
  const canContinue = [d.name.trim().length > 1 && d.email, true, !!d.propAddr && !!d.insurer && d.insBank, validIds >= 2, d.signMode === 'inperson' || d.face === 'passed', d.consent][step]

  const submit = () => {
    dispatch({
      type: 'intake/submit', id: DEMO_FILE, party: party.name,
      data: {
        email: d.email, phone: d.phone, marital: MARITAL_EN[d.marital], insurance: { insurer: d.insurer, policy: d.policy, bankAsCreditor: d.insBank },
        ids: d.ids.map((i) => ({ type: ID_TYPES_EN[i.type], exp: i.exp, review: i.exp >= today() ? 'pending' : 'rejected' })),
        liveness: d.signMode === 'remote' ? 'Passed' : 'In person',
      },
    })
    notify(L === 'fr' ? 'Envoyé à l’étude' : 'Sent to the office')
    setDone(true)
  }

  if (done) {
    return (
      <div className="body" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="big-check" aria-hidden="true">✓</div>
        <h1>{t(L, 'doneTitle')}</h1>
        <p className="muted">{t(L, 'doneSub')}</p>
        <button className="btn btn-primary btn-block" onClick={() => nav('/client/file')}>{t(L, 'toFile')}</button>
      </div>
    )
  }

  return (
    <>
      <div className="body">
        <div>
          <div className="small muted">{t(L, 'step', { n: step + 1, total: TOTAL })} · {file.id}</div>
          <div className="progress" style={{ gridTemplateColumns: `repeat(${TOTAL}, minmax(0, 1fr))` }}>
            {Array.from({ length: TOTAL }, (_, i) => <div key={i} className={i <= step ? 'on' : ''} />)}
          </div>
        </div>
        {step === 0 && (
          <>
            <h1>{t(L, 's0Title')}</h1>
            <div className="stack">
              <Field label={t(L, 'fullName')} value={d.name} on={(v) => set('name', v)} />
              <Field label={t(L, 'email')} type="email" value={d.email} on={(v) => set('email', v)} />
              <div className="grid-2">
                <Field label={t(L, 'phone')} type="tel" value={d.phone} on={(v) => set('phone', v)} />
                <Field label={t(L, 'dob')} type="date" value={d.dob} on={(v) => set('dob', v)} />
              </div>
              <Field label={t(L, 'address')} value={d.address} on={(v) => set('address', v)} />
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h1>{t(L, 's1Title')}</h1>
            <div className="stack">
              <label className="field"><span>{t(L, 'marital')}</span><select className="select" value={d.marital} onChange={(e) => set('marital', +e.target.value)}>{t(L, 'maritalOpts').map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>
              {(d.marital === 1 || d.marital === 2) && <label className="field"><span>{t(L, 'regime')}</span><select className="select" value={d.regime} onChange={(e) => set('regime', +e.target.value)}>{t(L, 'regimeOpts').map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>}
              <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="small muted" style={{ marginBottom: 6 }}>{t(L, 'coParty')}</legend>
                <div className="grid-2">
                  <button type="button" className={'pill-btn' + (d.coParty ? ' on' : '')} onClick={() => set('coParty', true)}>{t(L, 'yes')}</button>
                  <button type="button" className={'pill-btn' + (!d.coParty ? ' on' : '')} onClick={() => set('coParty', false)}>{t(L, 'no')}</button>
                </div>
              </fieldset>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1>{t(L, 's2Title')}</h1>
            <div className="stack">
              <Field label={t(L, 'propAddr')} value={d.propAddr} on={(v) => set('propAddr', v)} />
              <div className="grid-2">
                <Field label={t(L, 'closingDate')} type="date" value={d.closing} on={(v) => set('closing', v)} />
                <Field label={t(L, 'lender')} value={d.lender} on={(v) => set('lender', v)} />
              </div>
              <Field label={t(L, 'sellerName')} value={d.sellerName} on={(v) => set('sellerName', v)} />
              <label className="field"><span>{t(L, 'offer')}</span><input className="input" type="file" accept="application/pdf,image/*" style={{ paddingTop: 10 }} /></label>
              <div className="ins-box stack" style={{ gap: 10 }}>
                <b>{t(L, 'insTitle')}</b>
                <span className="small muted">{t(L, 'insWhy')}</span>
                <div className="grid-2">
                  <Field label={t(L, 'insurer')} value={d.insurer} on={(v) => set('insurer', v)} />
                  <Field label={t(L, 'policy')} value={d.policy} on={(v) => set('policy', v)} />
                </div>
                <label className="check small" style={{ alignItems: 'flex-start' }}><input type="checkbox" checked={d.insBank} onChange={(e) => set('insBank', e.target.checked)} style={{ marginTop: 3 }} />{t(L, 'insBank')}</label>
                <label className="field"><span>{t(L, 'insProof')}</span><input className="input" type="file" accept="application/pdf,image/*" style={{ paddingTop: 10 }} /></label>
              </div>
            </div>
          </>
        )}
        {step === 3 && <StepIds L={L} d={d} set={set} validIds={validIds} />}
        {step === 4 && <StepSign L={L} d={d} set={set} />}
        {step === 5 && (
          <>
            <h1>{t(L, 's5Title')}</h1>
            <div className="card" style={{ padding: 14 }}>
              {[[t(L, 'fullName'), d.name], [t(L, 'email'), d.email], [t(L, 'propAddr'), d.propAddr], [t(L, 's3Title'), `${validIds} ✓`], [t(L, 's4Title'), d.signMode === 'remote' ? t(L, 'remote') : t(L, 'inPerson')]].map(([k, v]) => (
                <div key={k} className="list-row"><span className="muted small">{k}</span><span style={{ textAlign: 'right' }}>{v}</span></div>
              ))}
            </div>
            <label className="check" style={{ alignItems: 'flex-start' }}>
              <input type="checkbox" checked={d.consent} onChange={(e) => set('consent', e.target.checked)} style={{ marginTop: 3 }} />
              <span className="small">{t(L, 'consent')}</span>
            </label>
          </>
        )}
      </div>
      <footer>
        <button className="btn" style={{ flex: 1, minHeight: 48 }} onClick={() => (step ? setStep(step - 1) : nav('/client'))}>{t(L, 'back')}</button>
        <button className="btn btn-primary" style={{ flex: 2, minHeight: 48 }} disabled={!canContinue} onClick={() => (step === TOTAL - 1 ? submit() : setStep(step + 1))}>
          {step === TOTAL - 1 ? t(L, 'submit') : t(L, 'continue')}
        </button>
      </footer>
    </>
  )
}

function Field({ label, value, on, type = 'text' }) {
  return <label className="field"><span>{label}</span><input className="input" type={type} value={value} onChange={(e) => on(e.target.value)} /></label>
}

function Choice({ on, onClick, title, sub }) {
  return (
    <button type="button" className={'choice' + (on ? ' on' : '')} onClick={onClick} aria-pressed={on}>
      <span className="grow"><b style={{ display: 'block' }}>{title}</b>{sub && <span className="small muted">{sub}</span>}</span>
      {on && <span aria-hidden="true">✓</span>}
    </button>
  )
}

function StepIds({ L, d, set, validIds }) {
  const [adding, setAdding] = useState(d.ids.length === 0)
  const [draft, setDraft] = useState({ type: d.ids.length ? 1 : 0, exp: d.ids.length ? '2029-09-30' : '2031-06-30' })
  const types = t(L, 'idTypes')
  return (
    <>
      <div>
        <h1>{t(L, 's3Title')}</h1>
        <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>{t(L, 's3Sub')}</p>
      </div>
      <div className="stack">
        {d.ids.map((id, i) => {
          const ok = id.exp >= today()
          return (
            <div key={i} className={'id-card' + (ok ? '' : ' bad')}>
              <div className="id-thumb" aria-hidden="true" />
              <div className="grow">
                <div style={{ fontWeight: 500 }}>{types[id.type]}</div>
                <div className={'small ' + (ok ? 'ok' : 'warn')}>{ok ? t(L, 'validTo', { d: id.exp }) : t(L, 'expiredOn', { d: id.exp })}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => set('ids', d.ids.filter((_, j) => j !== i))}>{t(L, 'remove')}</button>
            </div>
          )
        })}
      </div>
      {adding ? (
        <div className="card stack" style={{ padding: 14 }}>
          <label className="field"><span>{t(L, 'idType')}</span><select className="select" value={draft.type} onChange={(e) => setDraft({ ...draft, type: +e.target.value })}>{types.map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>
          {draft.type === 2 && <p className="small muted">{t(L, 'ramq')}</p>}
          <label className="field"><span>{t(L, 'photo')}</span>
            <span className="upload-fake"><Camera size={18} /><input type="file" accept="image/*,application/pdf" capture="environment" /></span>
          </label>
          <label className="field"><span>{t(L, 'expiry')}</span><input className="input" type="date" value={draft.exp} onChange={(e) => setDraft({ ...draft, exp: e.target.value })} /></label>
          <p className="small muted">Demo: the expiry date stands in for automatic reading of the ID. Try a past date to see the expired check.</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            {d.ids.length > 0 && <button className="btn" onClick={() => setAdding(false)}>{t(L, 'cancel')}</button>}
            <button className="btn btn-primary" onClick={() => { set('ids', [...d.ids, draft]); setAdding(false); setDraft({ type: 1, exp: '2029-09-30' }) }}>{t(L, 'saveId')}</button>
          </div>
        </div>
      ) : (
        <button className="choice dashed" onClick={() => setAdding(true)}>{t(L, 'addId')}</button>
      )}
      <p className={'banner ' + (validIds >= 2 ? 'ok' : 'warn')}>{validIds >= 2 ? t(L, 'haveTwo') : t(L, 'needTwo', { n: 2 - validIds })}</p>
    </>
  )
}

function StepSign({ L, d, set }) {
  useEffect(() => {
    if (d.face !== 'running') return
    const tm = setTimeout(() => set('face', 'passed'), 2200)
    return () => clearTimeout(tm)
  }, [d.face, set])
  return (
    <>
      <h1>{t(L, 's4Title')}</h1>
      <div className="stack">
        <Choice on={d.signMode === 'inperson'} onClick={() => set('signMode', 'inperson')} title={t(L, 'inPerson')} sub={t(L, 'inPersonSub')} />
        <Choice on={d.signMode === 'remote'} onClick={() => set('signMode', 'remote')} title={t(L, 'remote')} sub={t(L, 'remoteSub')} />
      </div>
      {d.signMode === 'remote' && (
        <div className="banner info stack" style={{ padding: 16 }}>
          <b>{t(L, 'faceTitle')}</b>
          <span style={{ color: 'var(--ink)' }}>{t(L, 'faceSub')}</span>
          {d.face === 'idle' && (
            <>
              <label className="check small" style={{ alignItems: 'flex-start', color: 'var(--ink)' }}><input type="checkbox" checked={d.faceConsent} onChange={(e) => set('faceConsent', e.target.checked)} style={{ marginTop: 3 }} />{t(L, 'faceConsent')}</label>
              <button className="btn" disabled={!d.faceConsent} style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }} onClick={() => set('face', 'running')}>{t(L, 'faceStart')}</button>
            </>
          )}
          {d.face === 'running' && <div className="stack" style={{ alignItems: 'center' }}><div className="face-oval"><div className="spinner" /></div><span>{t(L, 'faceRunning')}</span></div>}
          {d.face === 'passed' && <b className="ok">{t(L, 'facePassed')}</b>}
        </div>
      )}
    </>
  )
}
