import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, FileText, Banknote } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { stepDone, bookingUnlocked, fmtDate } from '../../logic'
import { DEMO_FILE } from '../../data'
import { fileType } from '../../firm'

export default function MyFile() {
  const { state, dispatch, notify } = useStore()
  const [src, setSrc] = useState({ origin: '', thirdParty: false, abroad: false })
  const [openFunds, setOpenFunds] = useState(false)
  const nav = useNavigate()
  const L = state.lang
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const lead = state.leads.find((l) => l.isDemo)
  const consult = state.events.find((e) => e.id === lead.consultationId && e.status !== 'cancelled')

  if (!file) {
    return (
      <div className="body">
        <h1>{t(L, 'myFile')}</h1>
        <p className="banner neutral">{t(L, 'noFile')}</p>
        {consult && <button className="appt-card as-btn" onClick={() => nav('/client/consult')}><span className="small muted">Consultation</span><b>{fmtDate(consult.date, L)} · {consult.time} · {consult.who}</b></button>}
        {lead.status !== 'New' && <button className="btn btn-primary btn-block" onClick={() => nav('/client/mandate')}>{t(L, 'mAccept')}</button>}
      </div>
    )
  }

  const labels = t(L, 'tracker')
  const steps = [
    { done: true },
    { done: stepDone(file, 'questionnaire'), to: '/client/intake', client: true },
    { done: stepDone(file, 'ids') },
    { done: stepDone(file, 'contract'), to: file.contract.sent ? '/client/sign' : null, client: file.contract.sent },
    { done: stepDone(file, 'lender') },
    { done: stepDone(file, 'booking'), to: bookingUnlocked(file) ? '/client/booking' : null, client: bookingUnlocked(file), extra: [file.mortgageBooking, file.booking].filter(Boolean).map((b) => `${fmtDate(b.date, L)} · ${b.time}`).join(' · ') },
    { done: stepDone(file, 'closing') },
    { done: file.docsPublished, to: file.docsPublished ? '/client/portal' : null, client: file.docsPublished },
  ]
  const current = steps.findIndex((s) => !s.done)
  const buyer = ['Purchase', 'Cash purchase', 'Refinance'].includes(file.type) || fileType(file.type).contract === 'buyer'

  return (
    <div className="body">
      <div>
        <h1>{t(L, 'myFile')} · {file.id}</h1>
        <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{t(L, 'myFileSub')}</p>
      </div>
      {consult && (
        <button className="appt-card as-btn" onClick={() => nav('/client/consult')}>
          <span className="small muted">{L === 'fr' ? 'Consultation' : 'Consultation'}</span>
          <b>{fmtDate(consult.date, L)} · {consult.time} · {consult.who}</b>
        </button>
      )}
      {[['mortgageBooking', t(L, 'meetMortgage')], ['booking', fileType(file.type).twoMeetings ? t(L, 'meetSale') : (L === 'fr' ? 'Rendez-vous de signature' : 'Signing appointment')]].filter(([k]) => file[k]).map(([k, label]) => (
        <button key={k} className="appt-card as-btn" onClick={() => nav('/client/booking')}>
          <span className="small muted">{label} · {t(L, 'reschedule')} / {t(L, 'cancelAppt').toLowerCase()}</span>
          <b>{fmtDate(file[k].date, L)} · {file[k].time} · {file[k].notary ?? file.notary}</b>
        </button>
      ))}
      {buyer && (
        <section className="card stack" style={{ gap: 8 }}>
          <b className="row" style={{ gap: 6 }}><Banknote size={16} /> {t(L, 'fundsTitle')}</b>
          {file.funds?.source ? <span className="small ok">{t(L, 'fundsDeclared')} · {t(L, 'fundsOpts')[t('en', 'fundsOpts').indexOf(file.funds.source.origin)] ?? file.funds.source.origin}</span> : openFunds ? (
            <>
              <label className="field"><span>{t(L, 'fundsOrigin')}</span>
                <select className="select" value={src.origin} onChange={(e) => setSrc({ ...src, origin: e.target.value })}><option value="">—</option>{t(L, 'fundsOpts').map((o) => <option key={o}>{o}</option>)}</select>
              </label>
              <label className="check-line"><input type="checkbox" checked={src.thirdParty} onChange={(e) => setSrc({ ...src, thirdParty: e.target.checked })} /> {t(L, 'thirdParty')}</label>
              <label className="check-line"><input type="checkbox" checked={src.abroad} onChange={(e) => setSrc({ ...src, abroad: e.target.checked })} /> {t(L, 'abroad')}</label>
              <button className="btn btn-primary btn-sm" disabled={!src.origin} onClick={() => { dispatch({ type: 'funds/source', id: file.id, source: { ...src, origin: t('en', 'fundsOpts')[t(L, 'fundsOpts').indexOf(src.origin)] ?? src.origin } }); notify(t(L, 'fundsDeclared')) }}>{t(L, 'fundsDeclare')}</button>
            </>
          ) : <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setOpenFunds(true)}>{t(L, 'fundsDeclare')}</button>}
          <p className="fraud-note">{t(L, 'fraud')}</p>
        </section>
      )}
      <div className="row">
        <button className="attach-chip as-link" onClick={() => nav(`/client/guide?role=${buyer ? 'buyer' : 'seller'}`)}><FileText size={13} /> {t(L, 'guide')}</button>
      </div>
      <ol className="tracker">
        {steps.map((s, i) => (
          <li key={i} className={s.done ? 'done' : i === current ? 'current' : ''}>
            <span className="tr-dot">{s.done ? <Check size={13} /> : i + 1}</span>
            <div className="grow">
              <div>{labels[i]}</div>
              {s.extra && <div className="small muted">{s.extra}</div>}
              {!s.done && i === current && !s.client && <div className="small muted">{t(L, 'inProgress')}…</div>}
            </div>
            {!s.done && s.client && s.to && <button className="btn btn-primary btn-sm" onClick={() => nav(s.to)}>{t(L, 'doNow')}</button>}
            {s.done && i === 7 && <button className="btn btn-sm" onClick={() => nav('/client/portal')}>{t(L, 'download')}</button>}
          </li>
        ))}
      </ol>
    </div>
  )
}
