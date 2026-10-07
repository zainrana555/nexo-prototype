import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Video, MapPin, CalendarPlus, X, UserPlus } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { bookingUnlocked, fmtDate } from '../../logic'
import { DEMO_FILE, BOOKABLE } from '../../data'
import { teamsUrl, downloadIcs, DURATION, OFFICE_ADDRESS } from '../../availability'
import SlotPicker from '../../SlotPicker'
import { NotYet } from './Mandate'

export default function Booking() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const [mode, setMode] = useState('In person')
  const [notary, setNotary] = useState(file?.notary ?? 'Me Anne Dubois')
  const [params] = useSearchParams()
  const [pick, setPick] = useState(() => (params.get('date') ? { date: params.get('date'), time: params.get('time') } : null))
  const [attendees, setAttendees] = useState(() => file?.parties.map((p) => p.name) ?? [])
  const [extra, setExtra] = useState('')
  const [phase, setPhase] = useState('view') // view | reschedule | cancel

  if (!file) return <NotYet L={L} />
  const b = file.booking

  if (b && phase !== 'reschedule') {
    const teams = b.mode === 'Teams video'
    return (
      <div className="body">
        <div className="big-check" aria-hidden="true">✓</div>
        <h1 style={{ textAlign: 'center' }}>{t(L, 'bookedTitle')}</h1>
        <div className="appt-card">
          <b>{fmtDate(b.date, L)} · {b.time}</b>
          <span className="row small" style={{ gap: 6 }}>{teams ? <Video size={14} /> : <MapPin size={14} />}{teams ? t(L, 'modeTeams') : `${t(L, 'modeInPerson')} · ${OFFICE_ADDRESS}`}</span>
          <span className="small">{t(L, 'withWhom')} {b.notary} · 60 {t(L, 'minutes')}</span>
          <span className="small muted">{t(L, 'attendees')}: {b.attendees.join(', ')}</span>
          {teams && <span className="small mono teams-link">{b.teamsUrl}</span>}
        </div>
        <p className="small muted" style={{ textAlign: 'center' }}>{t(L, 'outlookNote')} {t(L, 'remindNote')}</p>
        {teams && <button className="btn btn-primary btn-block" onClick={() => notify(L === 'fr' ? 'Ouverture de Microsoft Teams (démo)' : 'Opening Microsoft Teams (demo)')}><Video size={16} /> {t(L, 'joinTeams')}</button>}
        <button className="btn btn-block" onClick={() => downloadIcs({ title: 'Signature – Étude Dubois Notaires', date: b.date, time: b.time, duration: 60, location: b.teamsUrl ?? OFFICE_ADDRESS })}><CalendarPlus size={16} /> {t(L, 'addToCal')}</button>
        {phase === 'cancel' ? (
          <div className="banner warn stack" style={{ gap: 8 }}>
            <span>{t(L, 'cancelConfirm')}</span>
            <div className="row">
              <button className="btn btn-sm" onClick={() => setPhase('view')}>{t(L, 'keep')}</button>
              <button className="btn btn-sm danger" onClick={() => { dispatch({ type: 'booking/cancel', id: file.id, by: 'Client' }); setPhase('view'); notify(L === 'fr' ? 'Rendez-vous annulé' : 'Appointment cancelled') }}>{t(L, 'yesCancel')}</button>
            </div>
          </div>
        ) : (
          <div className="grid-2">
            <button className="btn" onClick={() => { setPick(null); setPhase('reschedule') }}>{t(L, 'reschedule')}</button>
            <button className="btn" onClick={() => setPhase('cancel')}><X size={15} /> {t(L, 'cancelAppt')}</button>
          </div>
        )}
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => nav('/client/file')}>{t(L, 'toFile')}</button>
      </div>
    )
  }

  const unlocked = bookingUnlocked(file)
  const reschedule = phase === 'reschedule'
  const person = reschedule ? b.notary : notary
  const confirm = () => {
    if (reschedule) {
      dispatch({ type: 'booking/reschedule', id: file.id, by: 'Client', changes: { date: pick.date, time: pick.time } })
      notify(L === 'fr' ? 'Rendez-vous déplacé' : 'Appointment moved')
    } else {
      dispatch({ type: 'book', id: file.id, booking: { mode, date: pick.date, time: pick.time, notary, attendees, teamsUrl: mode === 'Teams video' ? teamsUrl(file.id) : null, bookedBy: 'Client' } })
      notify(L === 'fr' ? 'Rendez-vous confirmé' : 'Appointment confirmed')
    }
    setPhase('view')
  }

  return (
    <>
      <div className="body">
        <div>
          <h1>{reschedule ? t(L, 'newTime') : t(L, 'bookTitle')}</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{t(L, 'bookSub', { id: file.id, notary: person })}</p>
        </div>
        {!unlocked && !reschedule ? (
          <p className="banner neutral row" style={{ gap: 8, alignItems: 'flex-start' }}><Lock size={16} style={{ flex: 'none', marginTop: 2 }} />{t(L, 'locked')}</p>
        ) : (
          <>
            {!reschedule && (
              <>
                <p className="banner ok">{t(L, 'unlocked')}</p>
                <div className="grid-2">
                  <button className={'pill-btn' + (mode === 'In person' ? ' on' : '')} onClick={() => setMode('In person')}><MapPin size={15} /> {t(L, 'modeInPerson')}</button>
                  <button className={'pill-btn' + (mode === 'Teams video' ? ' on' : '')} onClick={() => setMode('Teams video')}><Video size={15} /> {t(L, 'modeTeams')}</button>
                </div>
                <label className="field"><span>{t(L, 'withWhom')}</span>
                  <select className="select" value={notary} onChange={(e) => { setNotary(e.target.value); setPick(null) }}>
                    {BOOKABLE.filter((p) => p.for.includes('signing')).map((p) => <option key={p.name} value={p.name}>{p.name}{p.name === file.notary ? (L === 'fr' ? ' (votre notaire)' : ' (your notary)') : ''}</option>)}
                  </select>
                </label>
              </>
            )}
            <SlotPicker person={person} duration={DURATION.signing} value={pick} onChange={setPick} excludeId={'sign-' + file.id} lang={L} />
            {!reschedule && (
              <div className="stack" style={{ gap: 6 }}>
                <span className="small muted">{t(L, 'attendees')}</span>
                <div className="row">{attendees.map((a) => <span key={a} className="chip">{a}{!file.parties.some((p) => p.name === a) && <button className="chip-x" aria-label="Remove" onClick={() => setAttendees(attendees.filter((x) => x !== a))}>×</button>}</span>)}</div>
                <form className="row" style={{ flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (extra.includes('@')) { setAttendees([...attendees, extra.trim()]); setExtra('') } }}>
                  <label className="grow"><span className="sr-only">{t(L, 'addAttendee')}</span><input className="input" type="email" placeholder={t(L, 'addAttendee')} value={extra} onChange={(e) => setExtra(e.target.value)} /></label>
                  <button className="btn"><UserPlus size={15} /> {t(L, 'add')}</button>
                </form>
              </div>
            )}
            <p className="small muted">{t(L, 'liveCal')} {t(L, 'remindNote')}</p>
          </>
        )}
      </div>
      {(unlocked || reschedule) && (
        <footer>
          {reschedule && <button className="btn" style={{ flex: 1 }} onClick={() => setPhase('view')}>{t(L, 'back')}</button>}
          <button className="btn btn-primary btn-block" style={{ flex: 2 }} disabled={!pick?.time} onClick={confirm}>
            {reschedule ? t(L, 'confirmNew') : t(L, 'confirm')}{pick?.time ? ` · ${fmtDate(pick.date, L)} · ${pick.time}` : ''}
          </button>
        </footer>
      )}
    </>
  )
}
