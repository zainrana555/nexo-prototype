import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, MonitorUp, Plus, X } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { DEMO_FILE } from '../../data'
import { NotYet } from './Mandate'

const TOTAL = 6
const ID_TYPES_EN = ['Passport', "Driver's licence", 'Health insurance card']
const MARITAL_EN = ['Single', 'Married – partnership of acquests', 'Married – separation of property', 'Married – other contract', 'Civil union', 'Common-law', 'Separated', 'Divorced', 'Widowed']
const WITH_SPOUSE = [1, 2, 3, 4, 5]
const ROLE_OF = { Purchase: 'buyer', Sale: 'seller', Refinance: 'borrower' }
const today = () => new Date().toISOString().slice(0, 10)

// Grab one frame of a shared screen/tab (e.g. the client's Hydro-Québec account page) as a small image.
async function captureScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
  const video = document.createElement('video')
  video.srcObject = stream
  await video.play()
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = Math.round((video.videoHeight / video.videoWidth) * 480) || 300
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
  stream.getTracks().forEach((tr) => tr.stop())
  return canvas.toDataURL('image/jpeg', 0.6)
}

export default function Intake() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const lead = state.leads.find((l) => l.id === file?.fromLead)
  const [role, setRole] = useState(ROLE_OF[file?.type] ?? 'buyer')
  const [ctype, setCtype] = useState(file?.clientType ?? 'Individual')
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [d, setD] = useState({
    name: 'Émilie Gagnon', email: lead?.email ?? '', phone: lead?.phone ?? '', address: '220 rue Exemple, app. 4, Montréal', dob: '1991-03-14',
    coName: 'Gestion Immobilière Exemple inc.', neq: '1170000000', officer: 'Simon Paquette', officerTitle: 'Président',
    marital: 0, spouse: '', coParty: false,
    propAddr: lead?.property ?? '', closing: file?.closingDate ?? '', lender: 'Banque Exemple', sellerName: 'Martin Lavoie',
    currentLender: 'Caisse Exemple', currentAccount: '', insurer: 'Assurances Exemple', policy: '', insBank: false,
    mortgages: [{ lender: 'Banque Exemple', account: '' }], rented: false, captures: [],
    broker: true, syndicate: '', sellerContact: '', sellerEmail: '', fundsOrigin: 0, thirdParty: false, abroad: false, unequal: false, propKind: 0, newAddress: '',
    ids: [], signMode: 'remote', face: 'idle', faceConsent: false, consent: false,
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

  const corp = ctype === 'Corporation'
  const validIds = d.ids.filter((i) => i.exp >= today()).length
  const needsInsurance = role !== 'seller'
  const canContinue = [
    corp ? !!(d.coName && d.neq && d.officer) : d.name.trim().length > 1 && !!d.email,
    true,
    !!d.propAddr && (!needsInsurance || (!!d.insurer && d.insBank)),
    validIds >= 2,
    d.signMode === 'inperson' || d.face === 'passed',
    d.consent,
  ][step]

  const submit = () => {
    dispatch({
      type: 'intake/submit', id: DEMO_FILE, party: party.name,
      data: {
        email: d.email, phone: d.phone, marital: corp ? 'Corporation' : MARITAL_EN[d.marital], corporate: corp,
        insurance: needsInsurance ? { insurer: d.insurer, policy: d.policy, bankAsCreditor: d.insBank } : null,
        ids: d.ids.map((i) => ({ type: ID_TYPES_EN[i.type], exp: i.exp, review: i.exp >= today() ? 'pending' : 'rejected', front: i.front, back: i.back })),
        liveness: d.signMode === 'remote' ? 'Passed' : 'In person',
        answers: {
          role, clientType: ctype, ...(corp ? { corporation: d.coName, neq: d.neq, signingOfficer: `${d.officer} (${d.officerTitle})` } : { spouse: d.spouse || null }),
          property: d.propAddr,
          ...(role === 'seller' ? { mortgagesToDischarge: d.mortgages.filter((m) => m.lender), rented: d.rented, utilityCaptures: d.captures.length } : {}),
          ...(role === 'borrower' ? { currentLender: `${d.currentLender} ${d.currentAccount}`.trim() } : {}),
          ...(role === 'buyer' ? { lender: d.lender, seller: d.sellerName, broker: d.broker, syndicate: d.syndicate || null } : {}),
          ...(role === 'seller' ? { propertyKind: t('en', 'propKinds')[d.propKind], newAddress: d.newAddress || null } : {}),
        },
      },
    })
    if (role === 'buyer') dispatch({ type: 'funds/source', id: DEMO_FILE, source: { origin: t('en', 'fundsOpts')[d.fundsOrigin], thirdParty: d.thirdParty, abroad: d.abroad, unequal: d.unequal } })
    if (role === 'buyer' && d.sellerName && d.sellerEmail.includes('@')) dispatch({ type: 'lead/linkSeller', id: DEMO_FILE, seller: { name: d.sellerName, email: d.sellerEmail } })
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
        {step === 0 && (
          <div className="proto-note row" style={{ gap: 6 }}>
            <span>{t(L, 'previewAs')}</span>
            <select className="select" style={{ width: 'auto', minHeight: 32 }} value={role} onChange={(e) => setRole(e.target.value)} aria-label={t(L, 'qRole')}>
              <option value="buyer">{t(L, 'roleBuyer')}</option><option value="seller">{t(L, 'roleSeller')}</option><option value="borrower">{t(L, 'roleBorrower')}</option>
            </select>
            <select className="select" style={{ width: 'auto', minHeight: 32 }} value={ctype} onChange={(e) => setCtype(e.target.value)} aria-label={t(L, 'qAs')}>
              <option value="Individual">{t(L, 'typeIndividual')}</option><option value="Corporation">{t(L, 'typeCorporation')}</option>
            </select>
          </div>
        )}
        <div>
          <div className="small muted">{t(L, 'step', { n: step + 1, total: TOTAL })} · {file.id} · {t(L, { buyer: 'roleBuyer', seller: 'roleSeller', borrower: 'roleBorrower' }[role])}{corp ? ` · ${t(L, 'typeCorporation')}` : ''}</div>
          <div className="progress" style={{ gridTemplateColumns: `repeat(${TOTAL}, minmax(0, 1fr))` }}>
            {Array.from({ length: TOTAL }, (_, i) => <div key={i} className={i <= step ? 'on' : ''} />)}
          </div>
        </div>

        {step === 0 && !corp && (
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
        {step === 0 && corp && (
          <>
            <h1>{t(L, 'coTitle')}</h1>
            <div className="stack">
              <Field label={t(L, 'coName')} value={d.coName} on={(v) => set('coName', v)} />
              <Field label={t(L, 'coNeq')} value={d.neq} on={(v) => set('neq', v)} />
              <div className="grid-2">
                <Field label={t(L, 'coOfficer')} value={d.officer} on={(v) => set('officer', v)} />
                <Field label={t(L, 'coOfficerTitle')} value={d.officerTitle} on={(v) => set('officerTitle', v)} />
              </div>
              <Field label={t(L, 'email')} type="email" value={d.email} on={(v) => set('email', v)} />
              <Upload label={t(L, 'coArticles')} />
              <Upload label={t(L, 'coResolution')} />
              <p className="small muted">{t(L, 'coIdsNote')}</p>
            </div>
          </>
        )}

        {step === 1 && !corp && (
          <>
            <h1>{t(L, 's1Title')}</h1>
            <div className="stack">
              <label className="field"><span>{t(L, 'marital')}</span><select className="select" value={d.marital} onChange={(e) => set('marital', +e.target.value)}>{t(L, 'maritalOpts').map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>
              {WITH_SPOUSE.includes(d.marital) && <Field label={t(L, 'spouse')} value={d.spouse} on={(v) => set('spouse', v)} />}
              {d.marital !== 0 && d.marital !== 5 && (
                <div className="ins-box stack" style={{ gap: 6 }}>
                  <b>{t(L, 'civilDocs')}</b>
                  <span className="small muted">{t(L, 'civilDocsHint')}</span>
                  <Upload label={[null, 'Certificat de mariage / Marriage certificate', 'Contrat de mariage / Marriage contract', 'Contrat de mariage / Marriage contract', 'Certificat d’union civile / Civil union certificate', null, 'Jugement de séparation / Separation judgment', 'Jugement de divorce / Divorce judgment', 'Certificat de décès / Death certificate'][d.marital]} />
                </div>
              )}
              {role === 'buyer' && (
                <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="small muted" style={{ marginBottom: 6 }}>{t(L, 'coParty')}</legend>
                  <div className="grid-2">
                    <button type="button" className={'pill-btn' + (d.coParty ? ' on' : '')} onClick={() => set('coParty', true)}>{t(L, 'yes')}</button>
                    <button type="button" className={'pill-btn' + (!d.coParty ? ' on' : '')} onClick={() => set('coParty', false)}>{t(L, 'no')}</button>
                  </div>
                </fieldset>
              )}
            </div>
          </>
        )}
        {step === 1 && corp && (
          <>
            <h1>{t(L, 'coOfficer')}</h1>
            <div className="appt-card"><b>{d.officer}</b><span className="small">{d.officerTitle} · {d.coName}</span><span className="small muted">NEQ {d.neq}</span></div>
            <p className="small muted">{t(L, 'coIdsNote')}</p>
          </>
        )}

        {step === 2 && (
          <>
            <h1>{t(L, 's2Title')}</h1>
            <div className="stack">
              <Field label={t(L, 'propAddr')} value={d.propAddr} on={(v) => set('propAddr', v)} />
              <Field label={t(L, 'closingDate')} type="date" value={d.closing} on={(v) => set('closing', v)} />
              {role === 'buyer' && (
                <>
                  <Field label={t(L, 'lender')} value={d.lender} on={(v) => set('lender', v)} />
                  <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend className="small muted" style={{ marginBottom: 6 }}>{t(L, 'hasBroker')}</legend>
                    <div className="grid-2">
                      <button type="button" className={'pill-btn' + (d.broker ? ' on' : '')} onClick={() => set('broker', true)}>{t(L, 'yes')}</button>
                      <button type="button" className={'pill-btn' + (!d.broker ? ' on' : '')} onClick={() => set('broker', false)}>{t(L, 'no')}</button>
                    </div>
                  </fieldset>
                  {d.broker ? <p className="small muted">{t(L, 'brokerYes')}</p> : (
                    <>
                      <Upload label={t(L, 'offer')} />
                      <Upload label={t(L, 'colCert')} />
                      <Field label={t(L, 'syndicate')} value={d.syndicate} on={(v) => set('syndicate', v)} />
                    </>
                  )}
                  <div className="ins-box stack" style={{ gap: 8 }}>
                    <b>{t(L, 'sellerContacts')}</b>
                    <div className="grid-2">
                      <Field label={t(L, 'sellerName')} value={d.sellerName} on={(v) => set('sellerName', v)} />
                      <Field label={t(L, 'sellerEmail')} type="email" value={d.sellerEmail} on={(v) => set('sellerEmail', v)} />
                    </div>
                  </div>
                  <div className="ins-box stack" style={{ gap: 8 }}>
                    <b>{t(L, 'fundsTitle')}</b>
                    <label className="field"><span>{t(L, 'fundsOrigin')}</span><select className="select" value={d.fundsOrigin} onChange={(e) => set('fundsOrigin', +e.target.value)}>{t(L, 'fundsOpts').map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>
                    <label className="check small"><input type="checkbox" checked={d.thirdParty} onChange={(e) => set('thirdParty', e.target.checked)} /> {t(L, 'thirdParty')}</label>
                    <label className="check small"><input type="checkbox" checked={d.abroad} onChange={(e) => set('abroad', e.target.checked)} /> {t(L, 'abroad')}</label>
                    {d.coParty && <label className="check small"><input type="checkbox" checked={d.unequal} onChange={(e) => set('unequal', e.target.checked)} /> {t(L, 'unequal')}</label>}
                  </div>
                </>
              )}
              {role === 'borrower' && (
                <div className="grid-2">
                  <Field label={t(L, 'currentLender')} value={d.currentLender} on={(v) => set('currentLender', v)} />
                  <Field label={t(L, 'emAccount')} value={d.currentAccount} on={(v) => set('currentAccount', v)} />
                  <Field label={t(L, 'newLender')} value={d.lender} on={(v) => set('lender', v)} />
                </div>
              )}
              {role === 'seller' && (
                <>
                  <label className="field"><span>{t(L, 'propKind')}</span><select className="select" value={d.propKind} onChange={(e) => { set('propKind', +e.target.value); set('rented', [1, 2].includes(+e.target.value)) }}>{t(L, 'propKinds').map((o, i) => <option key={o} value={i}>{o}</option>)}</select></label>
                  <Field label={t(L, 'newAddress')} value={d.newAddress} on={(v) => set('newAddress', v)} />
                  {d.propKind <= 1 && <Field label={t(L, 'syndicate')} value={d.syndicate} on={(v) => set('syndicate', v)} />}
                  <Upload label={t(L, 'titles')} />
                  <div className="ins-box stack" style={{ gap: 8 }}>
                    <b>{t(L, 'existingMortgages')}</b>
                    <span className="small muted">{t(L, 'emNote')}</span>
                    {d.mortgages.map((m, i) => (
                      <div key={i} className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-end' }}>
                        <label className="field grow"><span>{t(L, 'emLender')}</span><input className="input" value={m.lender} onChange={(e) => set('mortgages', d.mortgages.map((x, j) => (j === i ? { ...x, lender: e.target.value } : x)))} /></label>
                        <label className="field grow"><span>{t(L, 'emAccount')}</span><input className="input" value={m.account} onChange={(e) => set('mortgages', d.mortgages.map((x, j) => (j === i ? { ...x, account: e.target.value } : x)))} /></label>
                        <button type="button" className="icon-btn" aria-label={t(L, 'remove')} onClick={() => set('mortgages', d.mortgages.filter((_, j) => j !== i))}><X size={16} /></button>
                      </div>
                    ))}
                    <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => set('mortgages', [...d.mortgages, { lender: '', account: '' }])}><Plus size={13} /> {t(L, 'emAdd')}</button>
                  </div>
                  <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend className="small muted" style={{ marginBottom: 6 }}>{t(L, 'rented')}</legend>
                    <div className="grid-2">
                      <button type="button" className={'pill-btn' + (d.rented ? ' on' : '')} onClick={() => set('rented', true)}>{t(L, 'yes')}</button>
                      <button type="button" className={'pill-btn' + (!d.rented ? ' on' : '')} onClick={() => set('rented', false)}>{t(L, 'no')}</button>
                    </div>
                  </fieldset>
                  {d.rented && <><Upload label={t(L, 'leases')} /><Upload label={t(L, 'rentRoll')} /></>}
                  <div className="ins-box stack" style={{ gap: 8 }}>
                    <b>{t(L, 'utilities')}</b>
                    <span className="small muted">{t(L, 'captureHelp')}</span>
                    <div className="row">
                      <button type="button" className="btn btn-sm" onClick={async () => {
                        try { const img = await captureScreen(); set('captures', [...d.captures, img]); notify(t(L, 'captured')) } catch { notify(L === 'fr' ? 'Capture annulée' : 'Capture cancelled') }
                      }}><MonitorUp size={15} /> {t(L, 'capture')}</button>
                      <label className="btn btn-sm" style={{ cursor: 'pointer' }}><Camera size={15} /> {L === 'fr' ? 'Téléverser' : 'Upload'}<input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => e.target.files[0] && set('captures', [...d.captures, URL.createObjectURL(e.target.files[0])])} /></label>
                    </div>
                    {d.captures.length > 0 && <div className="row">{d.captures.map((c, i) => <img key={i} src={c} alt="" className="capture-thumb" />)}</div>}
                  </div>
                </>
              )}
              {needsInsurance && (
                <div className="ins-box stack" style={{ gap: 10 }}>
                  <b>{t(L, 'insTitle')}</b>
                  <span className="small muted">{t(L, 'insWhy')}</span>
                  <div className="grid-2">
                    <Field label={t(L, 'insurer')} value={d.insurer} on={(v) => set('insurer', v)} />
                    <Field label={t(L, 'policy')} value={d.policy} on={(v) => set('policy', v)} />
                  </div>
                  <label className="check small" style={{ alignItems: 'flex-start' }}><input type="checkbox" checked={d.insBank} onChange={(e) => set('insBank', e.target.checked)} style={{ marginTop: 3 }} />{t(L, 'insBank')}</label>
                  <Upload label={t(L, 'insProof')} />
                </div>
              )}
            </div>
          </>
        )}

        {step === 3 && <StepIds L={L} d={d} set={set} validIds={validIds} corp={corp} />}
        {step === 4 && <StepSign L={L} d={d} set={set} />}
        {step === 5 && (
          <>
            <h1>{t(L, 's5Title')}</h1>
            <div className="card" style={{ padding: 14 }}>
              {[[corp ? t(L, 'coName') : t(L, 'fullName'), corp ? d.coName : d.name], [t(L, 'email'), d.email], [t(L, 'propAddr'), d.propAddr], [t(L, 's3Title'), `${validIds} ✓`], [t(L, 's4Title'), d.signMode === 'remote' ? t(L, 'remote') : t(L, 'inPerson')]].map(([k, v]) => (
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

function Upload({ label }) {
  return <label className="field"><span>{label}</span><input className="input" type="file" accept="application/pdf,image/*" style={{ paddingTop: 10 }} /></label>
}

function Choice({ on, onClick, title, sub }) {
  return (
    <button type="button" className={'choice' + (on ? ' on' : '')} onClick={onClick} aria-pressed={on}>
      <span className="grow"><b style={{ display: 'block' }}>{title}</b>{sub && <span className="small muted">{sub}</span>}</span>
      {on && <span aria-hidden="true">✓</span>}
    </button>
  )
}

function StepIds({ L, d, set, validIds, corp }) {
  const [adding, setAdding] = useState(d.ids.length === 0)
  const [draft, setDraft] = useState({ type: d.ids.length ? 1 : 0, exp: d.ids.length ? '2029-09-30' : '2031-06-30', front: '', back: '' })
  const types = t(L, 'idTypes')
  return (
    <>
      <div>
        <h1>{t(L, 's3Title')}</h1>
        <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>{t(L, 's3Sub')}{corp ? ` ${t(L, 'coIdsNote')}` : ''}</p>
      </div>
      <div className="stack">
        {d.ids.map((id, i) => {
          const ok = id.exp >= today()
          return (
            <div key={i} className={'id-card' + (ok ? '' : ' bad')}>
              <div className="id-thumb two" aria-hidden="true"><span /><span /></div>
              <div className="grow">
                <div style={{ fontWeight: 500 }}>{types[id.type]}</div>
                <div className={'small ' + (ok ? 'ok' : 'warn')}>{ok ? t(L, 'validTo', { d: id.exp }) : t(L, 'expiredOn', { d: id.exp })}</div>
                <div className="small muted">{t(L, 'idFront')} ✓ · {t(L, 'idBack')} ✓</div>
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
          <div className="grid-2">
            <label className="field"><span>{t(L, 'idFront')}</span><span className="upload-fake"><Camera size={16} /><input type="file" accept="image/*" capture="environment" onChange={(e) => setDraft({ ...draft, front: e.target.files[0]?.name ?? '' })} /></span></label>
            <label className="field"><span>{t(L, 'idBack')}</span><span className="upload-fake"><Camera size={16} /><input type="file" accept="image/*" capture="environment" onChange={(e) => setDraft({ ...draft, back: e.target.files[0]?.name ?? '' })} /></span></label>
          </div>
          <label className="field"><span>{t(L, 'expiry')}</span><input className="input" type="date" value={draft.exp} onChange={(e) => setDraft({ ...draft, exp: e.target.value })} /></label>
          <p className="small muted">Demo: the expiry date stands in for automatic reading (OCR) of the ID. Try a past date to see the expired check.</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            {d.ids.length > 0 && <button className="btn" onClick={() => setAdding(false)}>{t(L, 'cancel')}</button>}
            <button className="btn btn-primary" onClick={() => { set('ids', [...d.ids, draft]); setAdding(false); setDraft({ type: 1, exp: '2029-09-30', front: '', back: '' }) }}>{t(L, 'saveId')}</button>
          </div>
        </div>
      ) : (
        <button className="choice dashed" onClick={() => setAdding(true)}>{t(L, 'addId')}</button>
      )}
      <p className={'banner ' + (validIds >= 2 ? 'ok' : 'warn')}>{validIds >= 2 ? t(L, 'haveTwo') : t(L, 'needTwo', { n: 2 - validIds })}</p>
      <Upload label={t(L, 'passportCopy')} />
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
