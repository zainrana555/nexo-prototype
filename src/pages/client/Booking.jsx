import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Video, MapPin, CalendarPlus, X, UserPlus, Check } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { bookingUnlocked, fmtDate } from '../../logic'
import { DEMO_FILE, BOOKABLE } from '../../data'
import { fileType } from '../../firm'
import { teamsUrl, downloadIcs, DURATION, OFFICE_ADDRESS } from '../../availability'
import SlotPicker from '../../SlotPicker'
import { NotYet } from './Mandate'
import { isCore } from '../../editions'

// Purchases need two meetings (mortgage signing, then the sale with the seller); other files need one.
export default function Booking() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const [params] = useSearchParams()
  const [mode, setMode] = useState('In person')
  const [notary, setNotary] = useState(file?.notary ?? 'Me Anne Dubois')
  const [pick, setPick] = useState(() => (params.get('date') ? { date: params.get('date'), time: params.get('time') } : null))
  const [attendees, setAttendees] = useState(() => file?.parties.map((p) => p.name) ?? [])
  const [extra, setExtra] = useState('')
  const [phase, setPhase] = useState(null) // { kind: 'reschedule' | 'cancel', which }

  if (!file) return <NotYet L={L} />
  const two = !!fileType(file.type).twoMeetings
  const meetings = two
    ? [{ which: 'mortgage', key: 'mortgageBooking', title: t(L, 'meetMortgage'), hint: t(L, 'meetMortgageHint') }, { which: 'main', key: 'booking', title: t(L, 'meetSale'), hint: t(L, 'meetSaleHint') }]
    : [{ which: 'main', key: 'booking', title: t(L, 'bookTitle'), hint: '' }]
  const next = meetings.find((m) => !file[m.key])
  const unlocked = bookingUnlocked(file)
  const target = phase?.kind === 'reschedule' ? meetings.find((m) => m.which === phase.which) : next

  const confirm = () => {
    if (phase?.kind === 'reschedule') {
      dispatch({ type: 'booking/reschedule', id: file.id, which: phase.which, by: 'Client', changes: { date: pick.date, time: pick.time } })
      notify(L === 'fr' ? 'Rendez-vous déplacé' : 'Appointment moved')
    } else {
      dispatch({ type: 'book', id: file.id, which: target.which, booking: { mode, date: pick.date, time: pick.time, notary, attendees, teamsUrl: mode === 'Teams video' ? teamsUrl(file.id + target.which) : null, bookedBy: 'Client' } })
      notify(L === 'fr' ? 'Rendez-vous confirmé' : 'Appointment confirmed')
    }
    setPhase(null); setPick(null)
  }

  const booked = (
    <div className="stack" style={{ gap: 10 }}>
      {meetings.map((m, i) => {
        const b = file[m.key]
        return (
          <div key={m.which} className={'appt-card' + (b ? '' : ' pending')}>
            <span className="small muted">{two ? `${i + 1} · ` : ''}{m.title}</span>
            {b ? (
              <>
                <b>{fmtDate(b.date, L)} · {b.time}</b>
                <span className="row small" style={{ gap: 6 }}>{b.mode === 'Teams video' ? <Video size={14} /> : <MapPin size={14} />}{b.mode === 'Teams video' ? t(L, 'modeTeams') : `${t(L, 'modeInPerson')} · ${OFFICE_ADDRESS}`}</span>
                {b.teamsUrl && <span className="small mono teams-link">{b.teamsUrl}</span>}
                {phase?.kind === 'cancel' && phase.which === m.which ? (
                  <div className="row"><span className="small">{t(L, 'cancelConfirm')}</span><button className="btn btn-sm" onClick={() => setPhase(null)}>{t(L, 'keep')}</button><button className="btn btn-sm danger" onClick={() => { dispatch({ type: 'booking/cancel', id: file.id, which: m.which, by: 'Client' }); setPhase(null); notify(L === 'fr' ? 'Rendez-vous annulé' : 'Appointment cancelled') }}>{t(L, 'yesCancel')}</button></div>
                ) : (
                  <div className="row">
                    {b.teamsUrl && <button className="btn btn-sm btn-primary" onClick={() => notify(L === 'fr' ? 'Ouverture de Microsoft Teams (démo)' : 'Opening Microsoft Teams (demo)')}><Video size={14} /> Teams</button>}
                    <button className="btn btn-sm" onClick={() => downloadIcs({ title: `${m.title} – Acoca Notaires`, date: b.date, time: b.time, duration: 60, location: b.teamsUrl ?? OFFICE_ADDRESS })}><CalendarPlus size={14} /> .ics</button>
                    <button className="btn btn-sm" onClick={() => { setPick(null); setPhase({ kind: 'reschedule', which: m.which }) }}>{t(L, 'reschedule')}</button>
                    <button className="btn btn-sm" aria-label={t(L, 'cancelAppt')} onClick={() => setPhase({ kind: 'cancel', which: m.which })}><X size={13} /></button>
                  </div>
                )}
              </>
            ) : <span className="small">{m.hint || t(L, 'notBooked')}</span>}
          </div>
        )
      })}
    </div>
  )

  if (!next && phase?.kind !== 'reschedule') {
    return (
      <div className="body">
        <div className="big-check" aria-hidden="true">✓</div>
        <h1 style={{ textAlign: 'center' }}>{two ? t(L, 'bothBooked') : t(L, 'bookedTitle')}</h1>
        {booked}
        <p className="small muted" style={{ textAlign: 'center' }}>{t(L, 'outlookNote')} {t(L, 'remindNote')} {t(L, 'bringOriginals')}</p>
        <button className="link-btn" style={{ alignSelf: 'center' }} onClick={() => nav('/client/file')}>{t(L, 'toFile')}</button>
      </div>
    )
  }

  const reschedule = phase?.kind === 'reschedule'
  const person = reschedule ? file[target.key].notary : notary
  return (
    <>
      <div className="body">
        <div>
          <h1>{reschedule ? t(L, 'newTime') : two ? t(L, 'bookTwo') : t(L, 'bookTitle')}</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{t(L, 'bookSub', { id: file.id, notary: person })}</p>
          {isCore(state) && <p className="small" style={{ margin: '6px 0 0', color: 'var(--navy)' }}>{L === 'fr' ? 'Disponibilités du calendrier Nexo de l’étude · rendez-vous en personne' : 'Times from the firm’s Nexo calendar · in-person appointments'}</p>}
        </div>
        {!unlocked && !reschedule ? (
          <p className="banner neutral row" style={{ gap: 8, alignItems: 'flex-start' }}><Lock size={16} style={{ flex: 'none', marginTop: 2 }} />{t(L, 'locked')}</p>
        ) : (
          <>
            {two && (file.booking || file.mortgageBooking) && booked}
            {two && <div className="step-pill"><Check size={13} /> {meetings.indexOf(target) + 1}/2 · <b>{target.title}</b> · {target.hint}</div>}
            {!reschedule && (
              <>
                {!isCore(state) && <div className="grid-2">
                  <button className={'pill-btn' + (mode === 'In person' ? ' on' : '')} onClick={() => setMode('In person')}><MapPin size={15} /> {t(L, 'modeInPerson')}</button>
                  <button className={'pill-btn' + (mode === 'Teams video' ? ' on' : '')} onClick={() => setMode('Teams video')}><Video size={15} /> {t(L, 'modeTeams')}</button>
                </div>}
                <label className="field"><span>{t(L, 'withWhom')}</span>
                  <select className="select" value={notary} onChange={(e) => { setNotary(e.target.value); setPick(null) }}>
                    {BOOKABLE.filter((p) => p.for.includes('signing')).map((p) => <option key={p.name} value={p.name}>{p.name}{p.name === file.notary ? (L === 'fr' ? ' (votre notaire)' : ' (your notary)') : ''}</option>)}
                  </select>
                </label>
              </>
            )}
            <SlotPicker person={person} duration={DURATION.signing} value={pick} onChange={setPick} excludeId={(target.which === 'mortgage' ? 'mort-' : 'sign-') + file.id} lang={L} />
            {!reschedule && target === meetings[0] && (
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
          {reschedule && <button className="btn" style={{ flex: 1 }} onClick={() => setPhase(null)}>{t(L, 'back')}</button>}
          <button className="btn btn-primary btn-block" style={{ flex: 2 }} disabled={!pick?.time} onClick={confirm}>
            {reschedule ? t(L, 'confirmNew') : t(L, 'confirm')}{pick?.time ? ` · ${fmtDate(pick.date, L)} · ${pick.time}` : ''}
          </button>
        </footer>
      )}
    </>
  )
}
