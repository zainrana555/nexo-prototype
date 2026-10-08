import { useState } from 'react'
import { Video, MapPin, Phone, CalendarPlus, X } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { fmtDate } from '../../logic'
import { DEMO_LEAD, BOOKABLE } from '../../data'
import { teamsUrl, downloadIcs, DURATION, OFFICE_ADDRESS, slotsFor, nextWeekdays } from '../../availability'
import SlotPicker from '../../SlotPicker'

const MODES = [['Phone', Phone, 'modePhone'], ['Teams video', Video, 'modeTeams'], ['In person', MapPin, 'modeInPerson']]

export default function Consult() {
  const { state, dispatch, notify } = useStore()
  const L = state.lang
  const lead = state.leads.find((l) => l.id === DEMO_LEAD)
  const existing = state.events.find((e) => e.id === lead.consultationId && e.status !== 'cancelled')
  const [who, setWho] = useState('paralegal')
  const [mode, setMode] = useState('Phone')
  const [topic, setTopic] = useState('')
  const [pick, setPick] = useState(null)
  const [phase, setPhase] = useState('view')

  const duration = who === 'paralegal' ? DURATION.consultationParalegal : DURATION.consultation
  // "First available": the paralegal with the most free time on the soonest day.
  const paralegals = BOOKABLE.filter((p) => p.role === 'Paralegal').map((p) => p.name)
  const firstDay = nextWeekdays(1)[0]
  const firstFree = paralegals.map((p) => [p, slotsFor(state, p, firstDay, duration).filter((s) => s.free).length]).sort((a, b) => b[1] - a[1])[0][0]
  const person = phase === 'reschedule' ? existing.who : who === 'paralegal' ? firstFree : 'Me Anne Dubois'

  if (existing && phase !== 'reschedule') {
    const teams = existing.mode === 'Teams video'
    const modeLabel = t(L, MODES.find((m) => m[0] === existing.mode)[2])
    return (
      <div className="body">
        <div className="big-check" aria-hidden="true">✓</div>
        <h1 style={{ textAlign: 'center' }}>{t(L, 'cBooked')}</h1>
        <div className="appt-card">
          <b>{fmtDate(existing.date, L)} · {existing.time}</b>
          <span className="small">{modeLabel}{existing.mode === 'In person' ? ` · ${OFFICE_ADDRESS}` : ''}</span>
          <span className="small">{t(L, 'withWhom')} {existing.who} · {existing.duration} {t(L, 'minutes')}</span>
          {teams && <span className="small mono teams-link">{existing.teamsUrl}</span>}
        </div>
        <p className="small muted" style={{ textAlign: 'center' }}>{t(L, 'outlookNote')} {t(L, 'remindNote')}</p>
        {teams && <button className="btn btn-primary btn-block" onClick={() => notify(L === 'fr' ? 'Ouverture de Microsoft Teams (démo)' : 'Opening Microsoft Teams (demo)')}><Video size={16} /> {t(L, 'joinTeams')}</button>}
        <button className="btn btn-block" onClick={() => downloadIcs({ title: 'Consultation – Acoca Notaires', date: existing.date, time: existing.time, duration: existing.duration, location: existing.teamsUrl ?? OFFICE_ADDRESS })}><CalendarPlus size={16} /> {t(L, 'addToCal')}</button>
        {phase === 'cancel' ? (
          <div className="banner warn stack" style={{ gap: 8 }}>
            <span>{t(L, 'cancelConfirm')}</span>
            <div className="row">
              <button className="btn btn-sm" onClick={() => setPhase('view')}>{t(L, 'keep')}</button>
              <button className="btn btn-sm danger" onClick={() => { dispatch({ type: 'event/cancel', id: existing.id, by: 'Client' }); setPhase('view'); notify(L === 'fr' ? 'Consultation annulée' : 'Consultation cancelled') }}>{t(L, 'yesCancel')}</button>
            </div>
          </div>
        ) : (
          <div className="grid-2">
            <button className="btn" onClick={() => { setPick(null); setPhase('reschedule') }}>{t(L, 'reschedule')}</button>
            <button className="btn" onClick={() => setPhase('cancel')}><X size={15} /> {t(L, 'cancelAppt')}</button>
          </div>
        )}
      </div>
    )
  }

  const reschedule = phase === 'reschedule'
  const confirm = () => {
    if (reschedule) {
      dispatch({ type: 'event/move', id: existing.id, by: 'Client', changes: { date: pick.date, time: pick.time } })
      notify(L === 'fr' ? 'Consultation déplacée' : 'Consultation moved')
    } else {
      const id = 'c' + Date.now().toString(36)
      dispatch({ type: 'consult/book', event: { id, title: `Consultation – ${lead.name}`, date: pick.date, time: pick.time, duration, mode, who: person, leadId: lead.id, attendees: [lead.name], topic, teamsUrl: mode === 'Teams video' ? teamsUrl(id) : null, bookedBy: 'Client' } })
      notify(L === 'fr' ? 'Consultation réservée' : 'Consultation booked')
    }
    setPhase('view')
  }

  return (
    <>
      <div className="body">
        <div>
          <h1>{reschedule ? t(L, 'newTime') : t(L, 'cTitle')}</h1>
          {!reschedule && <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{t(L, 'cSub')}</p>}
        </div>
        {!reschedule && (
          <>
            <div className="stack" style={{ gap: 8 }}>
              <span className="small muted">{t(L, 'cWho')}</span>
              {[['paralegal', 'cParalegal', 'cParalegalSub'], ['notary', 'cNotary', 'cNotarySub']].map(([k, l, sub]) => (
                <button key={k} type="button" className={'choice' + (who === k ? ' on' : '')} onClick={() => { setWho(k); setPick(null) }} aria-pressed={who === k}>
                  <span className="grow"><b style={{ display: 'block' }}>{t(L, l)}</b><span className="small muted">{t(L, sub)}</span></span>
                </button>
              ))}
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <span className="small muted">{t(L, 'cHow')}</span>
              <div className="mode-grid">
                {MODES.map(([m, Icon, key]) => <button key={m} type="button" className={'pill-btn' + (mode === m ? ' on' : '')} onClick={() => setMode(m)}><Icon size={15} /> {t(L, key)}</button>)}
              </div>
            </div>
          </>
        )}
        <SlotPicker person={person} duration={reschedule ? existing.duration : duration} value={pick} onChange={setPick} excludeId={existing?.id} lang={L} />
        {!reschedule && <label className="field"><span>{t(L, 'cTopic')}</span><input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} /></label>}
        <p className="small muted">{who === 'paralegal' && !reschedule ? `${t(L, 'cFirstFree')}: ${person}. ` : ''}{t(L, 'remindNote')}</p>
      </div>
      <footer>
        {reschedule && <button className="btn" style={{ flex: 1 }} onClick={() => setPhase('view')}>{t(L, 'back')}</button>}
        <button className="btn btn-primary btn-block" style={{ flex: 2 }} disabled={!pick?.time} onClick={confirm}>
          {reschedule ? t(L, 'confirmNew') : t(L, 'cBook')}{pick?.time ? ` · ${fmtDate(pick.date, L)} · ${pick.time}` : ''}
        </button>
      </footer>
    </>
  )
}
