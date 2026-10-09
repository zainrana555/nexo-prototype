import { isCore } from '../../editions'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Copy, Video, MapPin, Phone, Plus, BellRing, X, CalendarClock, CircleCheck } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Modal, Badge } from '../../ui'
import { STAFF, BOOKABLE } from '../../data'
import { appointments, outlookBusy, toMin, fmtTime, iso, teamsUrl, DURATION } from '../../availability'
import { bookingUnlocked, isClosed, fmtDate } from '../../logic'
import { fileType } from '../../firm'
import SlotPicker from '../../SlotPicker'

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16]
const MODE_ICON = { 'Teams video': Video, 'In person': MapPin, Phone }

function shiftWeekday(dateIso, n) {
  const d = new Date(dateIso + 'T12:00')
  let left = Math.abs(n)
  while (left > 0) { d.setDate(d.getDate() + Math.sign(n)); if (d.getDay() % 6 !== 0) left-- }
  return iso(d)
}
const todayIso = () => { const d = new Date(); while (d.getDay() % 6 === 0) d.setDate(d.getDate() + 1); return iso(d) }

export default function Calendar() {
  const { state, dispatch, notify } = useStore()
  const [view, setView] = useState('team')
  const [day, setDay] = useState(todayIso())
  const [group, setGroup] = useState('Notary')
  const [person, setPerson] = useState('Me Anne Dubois')
  const [sel, setSel] = useState(null)
  const [booking, setBooking] = useState(false)

  const appts = appointments(state)
  const people = view === 'team' ? STAFF.filter((s) => group === 'All' || s.role === group).map((s) => s.name) : [person]
  const week = useMemo(() => { const d = new Date(day + 'T12:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return Array.from({ length: 5 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return iso(x) }) }, [day])
  const days = view === 'team' ? [day] : week
  const cols = view === 'team' ? people.map((p) => ({ key: p, person: p, date: day, label: p.replace(/^Me /, ''), sub: STAFF.find((s) => s.name === p)?.role })) : days.map((d) => ({ key: d, person, date: d, label: new Date(d + 'T12:00').toLocaleDateString('en-CA', { weekday: 'short', day: 'numeric' }), today: d === iso(new Date()) }))

  const itemsAt = (col, h) => [
    ...(isCore(state) ? [] : outlookBusy(col.person, col.date)).filter((b) => Math.floor(b.start / 60) === h).map((b) => ({ id: `busy-${col.key}-${b.start}`, busy: true, title: b.label === 'Lunch' ? 'Lunch' : 'Busy · Outlook', time: fmtTime(b.start), end: fmtTime(b.end) })),
    ...appts.filter((a) => a.date === col.date && (a.who === col.person || a.who === 'All') && Math.floor(toMin(a.time) / 60) === h),
  ]
  const runReminders = () => {
    dispatch({ type: 'reminders/run' })
    const soon = appts.filter((a) => a.kind !== 'internal' && (new Date(a.date + 'T12:00') - new Date()) / 86400000 <= 3 && (new Date(a.date + 'T12:00') - new Date()) > -43200000).length
    notify(`${soon} reminder${soon === 1 ? '' : 's'} sent (email + SMS) for upcoming appointments`)
  }

  return (
    <>
      <PageHeader
        title="Calendar"
        sub={isCore(state) ? 'Shared Nexo calendar: everyone at the firm sees all appointments and can book for any notary. No Outlook sync.' : 'Shared team calendar, synced with each person’s Outlook. Paralegals can book for any notary.'}
        actions={<>
          <button className="btn" onClick={runReminders}><BellRing size={16} /> Send due reminders</button>
          <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText('https://book.nexo.demo/acoca-notaires/consultation') } catch { /* blocked */ } notify('Consultation booking link copied') }}><Copy size={16} /> Copy booking link</button>
          <button className="btn btn-primary" onClick={() => setBooking(true)}><Plus size={16} /> Book appointment</button>
        </>}
      />

      <div className="card" style={{ padding: 0 }}>
        <div className="row between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <div className="row">
            <div className="seg light"><button className={view === 'team' ? 'on' : ''} onClick={() => setView('team')}>Team · day</button><button className={view === 'week' ? 'on' : ''} onClick={() => setView('week')}>Person · week</button></div>
            <button className="icon-btn" aria-label="Previous" onClick={() => setDay(shiftWeekday(day, view === 'team' ? -1 : -5))}><ChevronLeft size={18} /></button>
            <button className="btn btn-sm" onClick={() => setDay(todayIso())}>Today</button>
            <button className="icon-btn" aria-label="Next" onClick={() => setDay(shiftWeekday(day, view === 'team' ? 1 : 5))}><ChevronRight size={18} /></button>
            <b>{view === 'team' ? new Date(day + 'T12:00').toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long' }) : `Week of ${new Date(days[0] + 'T12:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}`}</b>
          </div>
          {view === 'team' ? (
            <div className="seg light">{['Notary', 'Paralegal', 'All'].map((g) => <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>{{ Notary: 'Notaries', Paralegal: 'Paralegals', All: 'Everyone' }[g]}</button>)}</div>
          ) : (
            <label><span className="sr-only">Person</span><select className="select" value={person} onChange={(e) => setPerson(e.target.value)}>{STAFF.map((s) => <option key={s.name}>{s.name}</option>)}</select></label>
          )}
        </div>
        <div className="cal-scroll">
          <div className="cal" style={{ gridTemplateColumns: `60px repeat(${cols.length}, minmax(130px, 1fr))`, minWidth: 60 + cols.length * 130 }}>
            <div />
            {cols.map((c) => <div key={c.key} className={'cal-day' + (c.today ? ' today' : '')}><b style={{ fontSize: 13 }}>{c.label}</b>{c.sub && <span>{c.sub}</span>}</div>)}
            {HOURS.map((h) => (
              <div key={h} style={{ display: 'contents' }}>
                <div className="cal-hour">{h}:00</div>
                {cols.map((c) => (
                  <div key={c.key + h} className="cal-cell">
                    {itemsAt(c, h).map((e) => e.busy ? (
                      <div key={e.id} className="cal-ev busy" title="Imported from Outlook">{e.time}–{e.end} {e.title}</div>
                    ) : (
                      <button key={e.id} className={'cal-ev ' + e.kind} onClick={() => setSel(e)}><b>{e.time}</b> {e.title}</button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="row small muted" style={{ padding: '10px 16px', gap: 16, borderTop: '1px solid var(--line)' }}>
          <span className="row"><span className="legend signing" /> Signing</span>
          <span className="row"><span className="legend consultation" /> Consultation</span>
          <span className="row"><span className="legend internal" /> Internal</span>
          {!isCore(state) && <span className="row"><span className="legend busy" /> Busy in Outlook (read-only)</span>}
        </div>
      </div>

      {sel && <EventModal ev={sel} onClose={() => setSel(null)} />}
      {booking && <BookModal onClose={() => setBooking(false)} />}
    </>
  )
}

export function EventModal({ ev, onClose }) {
  const { dispatch, notify } = useStore()
  const [mode, setMode] = useState('view')
  const [pick, setPick] = useState(null)
  const Icon = MODE_ICON[ev.mode] ?? MapPin
  const isSigning = ev.kind === 'signing'
  const reschedule = () => {
    if (isSigning) dispatch({ type: 'booking/reschedule', id: ev.fileId, which: ev.which, by: 'Staff', changes: { date: pick.date, time: pick.time } })
    else dispatch({ type: 'event/move', id: ev.id, by: 'Staff', changes: { date: pick.date, time: pick.time } })
    notify('Moved · Outlook updated · client notified'); onClose()
  }
  const cancel = () => {
    if (isSigning) dispatch({ type: 'booking/cancel', id: ev.fileId, which: ev.which, by: 'Staff' })
    else dispatch({ type: 'event/cancel', id: ev.id, by: 'Staff' })
    notify('Cancelled · removed from Outlook · client notified'); onClose()
  }
  return (
    <Modal title={ev.title} onClose={onClose} wide={mode === 'reschedule'}>
      {mode === 'reschedule' ? (
        <>
          <p className="small muted">Pick a new time in {ev.who}’s calendar. The client gets an updated invitation automatically.</p>
          <SlotPicker person={ev.who} duration={ev.duration} value={pick} onChange={setPick} excludeId={ev.id} />
          <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={() => setMode('view')}>Back</button><button className="btn btn-primary" disabled={!pick?.time} onClick={reschedule}>Confirm new time</button></div>
        </>
      ) : (
        <>
          <div className="kv"><span className="muted">When</span><span>{fmtDate(ev.date)} · {ev.time} · {ev.duration} min</span></div>
          <div className="kv"><span className="muted">How</span><span className="row" style={{ gap: 4 }}><Icon size={14} />{ev.mode}</span></div>
          <div className="kv"><span className="muted">With</span><span>{ev.who}</span></div>
          {ev.attendees?.length > 0 && <div className="kv"><span className="muted">Attendees</span><span>{ev.attendees.join(', ')}</span></div>}
          {ev.bookedBy && <div className="kv"><span className="muted">Booked by</span><span>{ev.bookedBy === 'Client' ? 'Client (self-booking)' : 'Staff'}</span></div>}
          {ev.topic && <div className="kv"><span className="muted">Topic</span><span>{ev.topic}</span></div>}
          {ev.teamsUrl && <div className="teams-box"><Video size={16} /><span className="grow mono small">{ev.teamsUrl}</span><button className="btn btn-sm" onClick={() => notify('Opening Microsoft Teams (demo)')}>Join</button></div>}
          <p className="small ok row" style={{ gap: 6 }}><CircleCheck size={14} /> In {ev.who === 'All' ? 'everyone’s' : `${ev.who}’s`} Outlook calendar{ev.attendees?.length ? ' · invitation sent to attendees' : ''}</p>
          {ev.kind !== 'internal' && mode === 'cancel' && (
            <div className="banner warn row between"><span>Cancel and notify the client?</span><span className="row"><button className="btn btn-sm" onClick={() => setMode('view')}>Keep</button><button className="btn btn-sm danger" onClick={cancel}>Cancel appointment</button></span></div>
          )}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            {ev.kind !== 'internal' && mode !== 'cancel' && <button className="btn" onClick={() => setMode('cancel')}><X size={15} /> Cancel</button>}
            {ev.kind !== 'internal' && <button className="btn" onClick={() => setMode('reschedule')}><CalendarClock size={15} /> Reschedule</button>}
            {ev.fileId && <Link className="btn btn-primary" to={`/app/files/${ev.fileId}`}>Open file</Link>}
            {ev.leadId && <Link className="btn btn-primary" to={`/app/leads/${ev.leadId}`}>Open lead</Link>}
          </div>
        </>
      )}
    </Modal>
  )
}

export function BookModal({ onClose, fileId, leadId }) {
  const { state, dispatch, notify } = useStore()
  const files = state.files.filter((f) => !isClosed(f) && (!f.booking || (fileType(f.type).twoMeetings && !f.mortgageBooking)))
  const leads = state.leads.filter((l) => ['New', 'Mini-mandate sent', 'Follow-up'].includes(l.status))
  const [type, setType] = useState(leadId ? 'consultation' : 'signing')
  const [fid, setFid] = useState(fileId ?? files[0]?.id)
  const [lid, setLid] = useState(leadId ?? leads[0]?.id)
  const file = state.files.find((f) => f.id === fid)
  const lead = state.leads.find((l) => l.id === lid)
  const [who, setWho] = useState(file?.notary ?? 'Me Anne Dubois')
  const two = !!file && fileType(file.type).twoMeetings
  const [which, setWhich] = useState(file && two && !file.mortgageBooking ? 'mortgage' : 'main')
  const [mode, setMode] = useState('In person')
  const [pick, setPick] = useState(null)
  const duration = type === 'signing' ? DURATION.signing : BOOKABLE.find((b) => b.name === who)?.role === 'Paralegal' ? DURATION.consultationParalegal : DURATION.consultation
  const people = BOOKABLE.filter((b) => b.for.includes(type))

  const submit = () => {
    const id = 'b' + Date.now().toString(36)
    const tUrl = mode === 'Teams video' ? teamsUrl(id) : null
    if (type === 'signing') {
      dispatch({ type: 'book', id: fid, which, booking: { mode, date: pick.date, time: pick.time, notary: who, attendees: file.parties.map((p) => p.name), teamsUrl: tUrl, bookedBy: 'Staff' } })
    } else {
      dispatch({ type: 'consult/book', event: { id, title: `Consultation – ${lead.name}`, date: pick.date, time: pick.time, duration, mode, who, leadId: lead.id, attendees: [lead.name], teamsUrl: tUrl, bookedBy: 'Staff' } })
    }
    notify(isCore(state) ? 'Booked in the Nexo calendar · confirmation emailed to the client' : 'Booked · added to Outlook · invitation emailed to the client'); onClose()
  }

  return (
    <Modal title="Book an appointment for a client" onClose={onClose} wide>
      <div className="split" style={{ gap: 18 }}>
        <div className="side stack" style={{ flexBasis: 260 }}>
          <div className="seg light"><button className={type === 'signing' ? 'on' : ''} onClick={() => { setType('signing'); setPick(null) }}>Signing</button><button className={type === 'consultation' ? 'on' : ''} onClick={() => { setType('consultation'); setPick(null) }}>Consultation</button></div>
          {type === 'signing' ? (
            <label className="field"><span>File</span><select className="select" value={fid} onChange={(e) => { setFid(e.target.value); setWho(state.files.find((f) => f.id === e.target.value)?.notary ?? who); setPick(null) }}>{files.map((f) => <option key={f.id} value={f.id}>{f.id} · {f.clients.join(' & ')}</option>)}</select></label>
          ) : (
            <label className="field"><span>Lead</span><select className="select" value={lid} onChange={(e) => setLid(e.target.value)}>{leads.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.type}</option>)}</select></label>
          )}
          <label className="field"><span>With</span><select className="select" value={who} onChange={(e) => { setWho(e.target.value); setPick(null) }}>{people.map((p) => <option key={p.name} value={p.name}>{p.name} ({p.role})</option>)}</select></label>
          <label className="field"><span>How</span><select className="select" value={mode} onChange={(e) => setMode(e.target.value)}><option>In person</option>{!isCore(state) && <option>Teams video</option>}{type === 'consultation' && <option>Phone</option>}</select></label>
          {type === 'signing' && two && (
            <label className="field"><span>Meeting</span><select className="select" value={which} onChange={(e) => { setWhich(e.target.value); setPick(null) }}><option value="mortgage" disabled={!!file.mortgageBooking}>1 · Mortgage signing</option><option value="main" disabled={!!file.booking}>2 · Sale signing (with seller)</option></select></label>
          )}
          {type === 'signing' && file && !bookingUnlocked(file) && <p className="banner warn small">Preconditions not met yet (signed contract + bank instructions). You can still book manually.</p>}
          {mode === 'Teams video' && <p className="small muted row" style={{ gap: 4 }}><Video size={14} /> A Teams link is created automatically.</p>}
        </div>
        <div className="main stack">
          <SlotPicker person={who} duration={duration} value={pick} onChange={setPick} />
          <p className="small muted">Free times combine {isCore(state) ? '' : `${who}’s Outlook busy times and `}appointments already in Nexo, with a 15-minute buffer.</p>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!pick?.time || (type === 'signing' ? !file : !lead)} onClick={submit}>Book {pick?.time ? `· ${fmtDate(pick.date)} ${pick.time}` : ''}</button>
      </div>
    </Modal>
  )
}
