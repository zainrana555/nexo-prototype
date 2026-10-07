import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { stepDone, bookingUnlocked, fmtDate } from '../../logic'
import { DEMO_FILE } from '../../data'

export default function MyFile() {
  const { state } = useStore()
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
    { done: stepDone(file, 'booking'), to: bookingUnlocked(file) ? '/client/booking' : null, client: bookingUnlocked(file), extra: file.booking && `${fmtDate(file.booking.date, L)} · ${file.booking.time}` },
    { done: stepDone(file, 'closing') },
    { done: file.docsPublished, to: file.docsPublished ? '/client/portal' : null, client: file.docsPublished },
  ]
  const current = steps.findIndex((s) => !s.done)

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
      {file.booking && (
        <button className="appt-card as-btn" onClick={() => nav('/client/booking')}>
          <span className="small muted">{L === 'fr' ? 'Rendez-vous de signature' : 'Signing appointment'} · {t(L, 'reschedule')} / {t(L, 'cancelAppt').toLowerCase()}</span>
          <b>{fmtDate(file.booking.date, L)} · {file.booking.time} · {file.booking.notary ?? file.notary}</b>
        </button>
      )}
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
