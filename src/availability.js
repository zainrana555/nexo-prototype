// Appointment availability, simulating what Nexo would read from each person's Outlook calendar.

export const WORK = { start: 9 * 60, end: 17 * 60, step: 30, buffer: 15 }
export const DURATION = { signing: 60, consultation: 30, consultationParalegal: 15 }

export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0) }
export const fmtTime = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`
export const iso = (d) => d.toISOString().slice(0, 10)

function hash(s) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

// Busy blocks that would come from Outlook: lunch plus one or two meetings per day, stable per person and date.
export function outlookBusy(person, date) {
  const h = hash(person + date)
  const starts = [10 * 60, 11 * 60, 13 * 60 + 30, 14 * 60 + 30, 15 * 60 + 30]
  const blocks = [{ start: 12 * 60, end: 13 * 60, label: 'Lunch' }]
  const a = starts[h % starts.length]
  blocks.push({ start: a, end: a + (h % 2 ? 60 : 90), label: 'Busy' })
  if (h % 3 === 0) { const b = starts[(h >> 3) % starts.length]; if (b !== a) blocks.push({ start: b, end: b + 30, label: 'Busy' }) }
  return blocks
}

// Every appointment Nexo itself knows about (file signings + calendar events), normalised.
export function appointments(state) {
  const meeting = (f, b, which) => ({
    id: (which === 'mortgage' ? 'mort-' : 'sign-') + f.id, kind: 'signing', which,
    title: `${which === 'mortgage' ? 'Mortgage signing' : f.mortgageBooking || f.type === 'Purchase' ? 'Sale signing' : 'Signing'} – ${f.clients.join(' & ')}`, date: b.date, time: b.time,
    duration: DURATION.signing, mode: b.mode, who: b.notary ?? f.notary, fileId: f.id,
    attendees: b.attendees ?? f.parties.map((p) => p.name), teamsUrl: b.teamsUrl, bookedBy: b.bookedBy, isDemo: f.isDemo,
  })
  const fromFiles = state.files.flatMap((f) => [f.mortgageBooking && meeting(f, f.mortgageBooking, 'mortgage'), f.booking && meeting(f, f.booking, 'main')].filter(Boolean))
  const events = state.events.filter((e) => e.status !== 'cancelled').map((e) => ({ duration: 60, kind: 'internal', attendees: [], ...e }))
  return [...fromFiles, ...events]
}

export function busyFor(state, person, date, excludeId) {
  const own = appointments(state)
    .filter((a) => a.date === date && (a.who === person || a.who === 'All') && a.id !== excludeId)
    .map((a) => ({ start: toMin(a.time), end: toMin(a.time) + a.duration, label: a.title }))
  return [...outlookBusy(person, date), ...own]
}

export function slotsFor(state, person, date, duration, excludeId) {
  const busy = busyFor(state, person, date, excludeId)
  const out = []
  for (let s = WORK.start; s + duration <= WORK.end; s += WORK.step) {
    const e = s + duration
    const clash = busy.some((b) => s < b.end + WORK.buffer && e > b.start - WORK.buffer)
    out.push({ time: fmtTime(s), free: !clash })
  }
  return out
}

export function nextWeekdays(n, from = new Date()) {
  const out = []
  const d = new Date(from)
  while (out.length < n) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() % 6 !== 0) out.push(iso(d))
  }
  return out
}

// 2–3 proposed times to put straight into the booking email (one per day, alternating morning/afternoon).
export function suggestSlots(state, person, duration, n = 3, excludeId) {
  const out = []
  for (const [i, date] of nextWeekdays(10).entries()) {
    const free = slotsFor(state, person, date, duration, excludeId).filter((s) => s.free)
    const pref = free.filter((s) => (i % 2 ? toMin(s.time) >= 13 * 60 : toMin(s.time) < 12 * 60))
    const s = (pref[0] ?? free[0])
    if (s) out.push({ date, time: s.time })
    if (out.length === n) break
  }
  return out
}

export const teamsUrl =(id) => `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${id}%40thread.v2`

// Real .ics calendar file (opens in Outlook, Apple Calendar, Google Calendar).
export function downloadIcs({ title, date, time, duration = 60, location = '', description = '' }) {
  const start = new Date(`${date}T${time.padStart(5, '0')}:00`)
  const end = new Date(start.getTime() + duration * 60000)
  const f = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nexo//Demo//EN', 'BEGIN:VEVENT',
    `UID:${Date.now()}@nexo.demo`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:${title}`, `LOCATION:${location}`, `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'BEGIN:VALARM', 'TRIGGER:-PT24H', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'appointment.ics'
  a.click()
  URL.revokeObjectURL(a.href)
}

export const OFFICE_ADDRESS = '700 Av. Sainte-Croix, Saint-Laurent (Québec) H4L 3Y3'
