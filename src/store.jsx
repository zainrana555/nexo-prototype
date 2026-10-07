import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react'
import {
  INITIAL_FILES, INITIAL_LEADS, INITIAL_RULES, INITIAL_RATES, INITIAL_TEMPLATES, INITIAL_EVENTS,
  DEMO_FILE, FINAL_DOCS, addDays,
} from './data'
import { bookingUnlocked, validIds } from './logic'
import { suggestSlots, DURATION } from './availability'

const KEY = 'nexo-demo-v3'

const initial = () => ({
  auth: null,
  lang: 'fr',
  leads: INITIAL_LEADS,
  files: INITIAL_FILES,
  rules: INITIAL_RULES,
  rates: INITIAL_RATES,
  templates: INITIAL_TEMPLATES,
  events: INITIAL_EVENTS,
  emails: [{ id: 'm1', kind: 'ack', t: 'Today 08:41', read: false }],
  notifications: [
    { id: 'n1', text: 'New lead: Émilie Gagnon (purchase, by email)', to: '/app/leads/L-1042', t: 'Today 08:41', read: false },
    { id: 'n2', text: 'Nadia Haddad uploaded 2 IDs for review', to: '/app/id-review', t: 'Today 08:12', read: false },
    { id: 'n3', text: 'File 26-0412 escalated: reminder #2 unanswered', to: '/app/files/26-0412', t: 'Today 09:00', read: false },
  ],
})

export const now = () => 'Today ' + new Date().toTimeString().slice(0, 5)
const uid = () => Math.random().toString(36).slice(2, 9)
const who = (s) => s.auth?.name ?? 'System'

const mapFile = (s, id, fn) => ({ ...s, files: s.files.map((f) => (f.id === id ? fn(f) : f)) })
const mapLead = (s, id, fn) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? fn(l) : l)) })
const log = (x, e, by = 'System') => ({ ...x, log: [{ t: now(), e, who: by }, ...x.log] })
const email = (s, kind, data) => ({ ...s, emails: [{ id: uid(), kind, t: now(), read: false, data }, ...s.emails] })

// What an appointment email needs to describe the meeting.
const apptData = (kind, a) => ({ kind, date: a.date, time: a.time, duration: a.duration, mode: a.mode, with: a.who ?? a.notary, teams: a.teamsUrl, title: a.title })
const fmtWhen = (a) => `${a.date} ${a.time}`
const isSoon = (date) => { const d = (new Date(date + 'T12:00') - new Date()) / 86400000; return d > -0.5 && d <= 3 }
const notify = (s, text, to) => ({ ...s, notifications: [{ id: uid(), text, to, t: now(), read: false }, ...s.notifications] })
const ruleOn = (s, id) => s.rules.find((r) => r.id === id)?.on

// Rule 8: once the contract is signed and lender instructions are in, email the booking link.
function maybeUnlock(s, id) {
  const f = s.files.find((x) => x.id === id)
  if (!f || f.bookingLinkSent || f.booking || !bookingUnlocked(f) || !ruleOn(s, 8)) return s
  return sendBookingOptions(s, f, 'System')
}

// Email the client 2–3 proposed signing times from their notary's calendar, plus a link to see all times.
function sendBookingOptions(s, f, by) {
  const notary = f.notary
  const slots = suggestSlots(s, notary, DURATION.signing, 3, 'sign-' + f.id)
  let n = mapFile(s, f.id, (x) => log({ ...x, bookingLinkSent: true }, `${by === 'System' ? 'Automation: ' : ''}booking email sent with 3 proposed times (${slots.map((t) => `${t.date} ${t.time}`).join(', ')})`, by))
  if (f.isDemo) n = email(n, 'booking', { slots, with: notary })
  return n
}

function fileFromLead(lead) {
  return {
    id: DEMO_FILE, isDemo: !!lead.isDemo, fromLead: lead.id,
    clients: [lead.name], type: lead.type, addr: lead.property.split(',').slice(0, -1).join(',') || lead.property,
    city: lead.property.split(',').pop().trim(), lang: lead.lang, notary: 'Me Anne Dubois', paralegal: 'Nathalie Roy',
    lender: '—', closingDate: lead.closingDate ?? addDays(30),
    contract: { sent: false, signed: false, total: lead.quote ?? 0, lang: lead.lang },
    bankReceived: false, title: { deeds10: false, chain30: false, cadastre: false }, booking: null,
    closing: { consigno: false, lenderReport: false }, finalDocs: [], docsPublished: false, portalViewed: false,
    procardex: false, escalated: false, reminders: 0,
    parties: [{ name: lead.name, role: lead.type === 'Sale' ? 'Seller' : lead.type === 'Refinance' ? 'Borrower' : 'Buyer', email: lead.email, phone: lead.phone, marital: '—', ids: [], liveness: 'Not started', questionnaire: 0 }],
    log: [
      { t: now(), e: 'Automation: questionnaire link emailed to client', who: 'System' },
      { t: now(), e: `File opened from lead ${lead.id} (mini-mandate accepted)`, who: 'System' },
    ],
  }
}

function reducer(s, a) {
  switch (a.type) {
    case 'reset': return { ...initial(), auth: s.auth }
    case 'login': return { ...s, auth: a.user }
    case 'logout': return { ...s, auth: null }
    case 'lang': return { ...s, lang: a.lang }

    // Leads
    case 'lead/mandate': {
      const lead = s.leads.find((l) => l.id === a.id)
      let n = mapLead(s, a.id, (l) => log({ ...l, status: 'Mini-mandate sent', quote: a.total, lang: a.lang }, `Mini-mandate sent (${a.lang}) · quote ${a.totalLabel}`, who(s)))
      if (lead.isDemo) n = email(n, 'mandate')
      return n
    }
    case 'lead/log': return mapLead(s, a.id, (l) => log(l, a.e, who(s)))
    case 'lead/followup': return mapLead(s, a.id, (l) => log({ ...l, status: 'Follow-up' }, 'Follow-up email sent', who(s)))
    case 'lead/lost': return mapLead(s, a.id, (l) => log({ ...l, status: 'Lost', lostReason: a.reason }, `Marked lost: ${a.reason}`, who(s)))
    case 'lead/reopen': return mapLead(s, a.id, (l) => log({ ...l, status: 'New' }, 'Lead reopened', who(s)))
    case 'lead/accept': {
      const lead = s.leads.find((l) => l.id === a.id)
      if (lead.fileId) return s
      const file = fileFromLead(lead)
      let n = mapLead(s, a.id, (l) => log({ ...l, status: 'Won', fileId: file.id }, `Mini-mandate accepted ${a.byClient ? 'by client' : 'manually'} · file ${file.id} created`, a.byClient ? lead.name : who(s)))
      n = { ...n, files: [file, ...n.files] }
      if (lead.isDemo) n = email(n, 'questionnaire')
      return notify(n, `${lead.name} accepted the mini-mandate · file ${file.id} opened`, `/app/files/${file.id}`)
    }
    case 'lead/add': return { ...s, leads: [a.lead, ...s.leads] }

    // Files
    case 'file/add': return { ...s, files: [a.file, ...s.files] }
    case 'file/log': return mapFile(s, a.id, (f) => log(f, a.e, who(s)))
    case 'file/reminder': {
      const f = s.files.find((x) => x.id === a.id)
      let n = mapFile(s, a.id, (x) => log({ ...x, reminders: x.reminders + 1 }, `Reminder emailed to ${x.clients.join(' & ')}`, who(s)))
      if (f.isDemo) n = email(n, 'reminder')
      return n
    }
    case 'intake/submit': {
      let n = mapFile(s, a.id, (f) => {
        const parties = f.parties.map((p) => (p.name === a.party ? { ...p, ...a.data, questionnaire: 100 } : p))
        return log({ ...f, parties, escalated: false }, `${a.party} completed questionnaire, uploaded ${a.data.ids.length} ID(s), face check: ${a.data.liveness}`, a.party)
      })
      return notify(n, `${a.party} submitted questionnaire + IDs for review`, '/app/id-review')
    }
    case 'id/review': {
      let n = mapFile(s, a.id, (f) => {
        const parties = f.parties.map((p) => (p.name !== a.party ? p : { ...p, ids: p.ids.map((d, i) => (i === a.idx ? { ...d, review: a.decision } : d)) }))
        return log({ ...f, parties }, `${a.decision === 'approved' ? 'Approved' : 'Rejected'} ${a.party}'s ${a.docType}`, who(s))
      })
      const f = n.files.find((x) => x.id === a.id)
      const p = f.parties.find((x) => x.name === a.party)
      if (a.decision === 'rejected') {
        n = mapFile(n, a.id, (x) => log(x, `Automation: re-upload requested from ${a.party}`))
      } else if (validIds(p).filter((d) => d.review === 'approved').length >= 2) {
        n = mapFile(n, a.id, (x) => log(x, `Identity verified: ${a.party}`, who(s)))
      }
      return n
    }
    case 'contract/send': {
      const f = s.files.find((x) => x.id === a.id)
      let n = mapFile(s, a.id, (x) => log({ ...x, contract: { ...x.contract, sent: true, total: a.total, lang: a.lang, options: a.options } }, `Service contract sent for e-signature (${a.lang}, ${a.totalLabel})`, who(s)))
      if (f.isDemo) n = email(n, 'contract')
      return n
    }
    case 'contract/sign': {
      let n = mapFile(s, a.id, (x) => log({ ...x, contract: { ...x.contract, signed: true, signedBy: a.signer } }, `Service contract e-signed by ${a.signer}`, a.signer))
      n = notify(n, `${a.signer} signed the service contract (${a.id})`, `/app/files/${a.id}?tab=contract`)
      return maybeUnlock(n, a.id)
    }
    case 'lender/record': {
      const n = mapFile(s, a.id, (x) => log({ ...x, bankReceived: true, lender: a.lender, mortgage: a.amount, closingDate: a.closingDate || x.closingDate }, `Lender instructions recorded (${a.lender}, ${a.amountLabel})`, who(s)))
      return maybeUnlock(n, a.id)
    }
    case 'booking/sendLink': return sendBookingOptions(s, s.files.find((x) => x.id === a.id), who(s))
    case 'file/assign': return mapFile(s, a.id, (f) => log({ ...f, [a.key]: a.value }, `${a.key === 'notary' ? 'Notary' : 'Paralegal'} assigned: ${a.value}`, who(s)))
    case 'book': {
      const f = s.files.find((x) => x.id === a.id)
      const byStaff = a.booking.bookedBy === 'Staff'
      const b = { ...a.booking, duration: 60, title: `Signing – ${f.clients.join(' & ')}` }
      let n = mapFile(s, a.id, (x) => log(log({ ...x, booking: a.booking }, `${byStaff ? `${who(s)} booked` : 'Client booked'} signing: ${a.booking.mode}, ${fmtWhen(a.booking)} with ${a.booking.notary}`, byStaff ? who(s) : x.clients[0]), `Outlook: event created in ${a.booking.notary}'s calendar${a.booking.teamsUrl ? ' with Teams link' : ''}; invitation sent to ${a.booking.attendees.join(', ')}`))
      if (f.isDemo) n = email(n, 'booked', apptData('signing', { ...b, who: a.booking.notary }))
      return byStaff ? n : notify(n, `${f.clients[0]} booked signing on ${a.booking.date} at ${a.booking.time}`, '/app/calendar')
    }
    case 'booking/reschedule': {
      const f = s.files.find((x) => x.id === a.id)
      const nb = { ...f.booking, ...a.changes }
      let n = mapFile(s, a.id, (x) => log({ ...x, booking: nb }, `Signing rescheduled by ${a.by === 'Client' ? 'client' : who(s)}: ${fmtWhen(nb)} · Outlook event updated`, a.by === 'Client' ? x.clients[0] : who(s)))
      if (f.isDemo) n = email(n, 'rescheduled', apptData('signing', { ...nb, who: nb.notary, duration: 60 }))
      return a.by === 'Client' ? notify(n, `${f.clients[0]} rescheduled signing to ${fmtWhen(nb)}`, '/app/calendar') : n
    }
    case 'booking/cancel': {
      const f = s.files.find((x) => x.id === a.id)
      let n = mapFile(s, a.id, (x) => log({ ...x, booking: null }, `Signing cancelled by ${a.by === 'Client' ? 'client' : who(s)} · Outlook event removed · booking link re-opened`, a.by === 'Client' ? x.clients[0] : who(s)))
      if (f.isDemo) n = email(n, 'cancelled', apptData('signing', { ...f.booking, who: f.booking.notary, duration: 60 }))
      return a.by === 'Client' ? notify(n, `${f.clients[0]} cancelled their signing appointment`, `/app/files/${a.id}`) : n
    }
    case 'consult/book': {
      const ev = { ...a.event, id: a.event.id ?? uid(), kind: 'consultation' }
      const lead = s.leads.find((l) => l.id === ev.leadId)
      let n = { ...s, events: [...s.events, ev] }
      if (lead) n = mapLead(n, lead.id, (l) => log({ ...l, consultationId: ev.id }, `Consultation booked: ${ev.mode}, ${fmtWhen(ev)} with ${ev.who} · Outlook invite sent`, ev.bookedBy === 'Staff' ? who(s) : l.name))
      if (lead?.isDemo) n = email(n, 'consultBooked', apptData('consultation', ev))
      return ev.bookedBy === 'Staff' ? n : notify(n, `${lead?.name ?? 'A client'} booked a consultation with ${ev.who} (${fmtWhen(ev)})`, '/app/calendar')
    }
    case 'event/move': {
      const ev = s.events.find((e) => e.id === a.id)
      const moved = { ...ev, ...a.changes }
      let n = { ...s, events: s.events.map((e) => (e.id === a.id ? moved : e)) }
      const lead = s.leads.find((l) => l.id === ev.leadId)
      if (lead) n = mapLead(n, lead.id, (l) => log(l, `Consultation rescheduled to ${fmtWhen(moved)}`, a.by === 'Client' ? l.name : who(s)))
      if (lead?.isDemo) n = email(n, 'rescheduled', apptData('consultation', moved))
      return a.by === 'Client' ? notify(n, `${lead?.name} rescheduled their consultation to ${fmtWhen(moved)}`, '/app/calendar') : n
    }
    case 'event/cancel': {
      const ev = s.events.find((e) => e.id === a.id)
      let n = { ...s, events: s.events.map((e) => (e.id === a.id ? { ...e, status: 'cancelled' } : e)) }
      const lead = s.leads.find((l) => l.id === ev.leadId)
      if (lead) n = mapLead(n, lead.id, (l) => log({ ...l, consultationId: null }, 'Consultation cancelled', a.by === 'Client' ? l.name : who(s)))
      if (lead?.isDemo) n = email(n, 'cancelled', apptData('consultation', ev))
      return a.by === 'Client' ? notify(n, `${lead?.name} cancelled their consultation`, '/app/calendar') : n
    }
    case 'lead/consultLink': {
      const lead = s.leads.find((l) => l.id === a.id)
      let n = mapLead(s, a.id, (l) => log(l, 'Consultation booking link emailed', who(s)))
      if (lead.isDemo) n = email(n, 'consultLink')
      return n
    }
    case 'reminders/run': {
      let n = s
      let count = 0
      for (const f of s.files.filter((x) => x.booking && isSoon(x.booking.date))) {
        count++
        n = mapFile(n, f.id, (x) => log(x, `Automation: reminder sent (email + SMS) for ${fmtWhen(f.booking)}`))
        if (f.isDemo) n = email(n, 'apptReminder', apptData('signing', { ...f.booking, who: f.booking.notary, duration: 60 }))
      }
      for (const ev of s.events.filter((e) => e.kind === 'consultation' && e.status !== 'cancelled' && isSoon(e.date))) {
        count++
        const lead = s.leads.find((l) => l.id === ev.leadId)
        if (lead) n = mapLead(n, lead.id, (l) => log(l, `Automation: consultation reminder sent for ${fmtWhen(ev)}`))
        if (lead?.isDemo) n = email(n, 'apptReminder', apptData('consultation', ev))
      }
      return { ...n, lastReminderCount: count }
    }
    case 'title/toggle': return mapFile(s, a.id, (f) => ({ ...f, title: { ...f.title, [a.key]: !f.title[a.key] } }))
    case 'closing/toggle': return mapFile(s, a.id, (f) => log({ ...f, closing: { ...f.closing, [a.key]: !f.closing[a.key] } }, a.label + (f.closing[a.key] ? ' (unchecked)' : ''), who(s)))
    case 'docs/upload': return mapFile(s, a.id, (f) => log({ ...f, finalDocs: FINAL_DOCS }, `${FINAL_DOCS.length} final documents uploaded`, who(s)))
    case 'docs/publish': {
      const f = s.files.find((x) => x.id === a.id)
      let n = mapFile(s, a.id, (x) => log(log({ ...x, docsPublished: true }, 'Final documents published to client portal', who(s)), 'Automation: secure portal link emailed to client'))
      if (f.isDemo && ruleOn(s, 9)) n = email(n, 'documents')
      return n
    }
    case 'portal/viewed': {
      const f = s.files.find((x) => x.id === a.id)
      if (!f || f.portalViewed) return s
      return notify(mapFile(s, a.id, (x) => log({ ...x, portalViewed: true }, 'Client downloaded documents from portal', x.clients[0])), `${f.clients[0]} downloaded the closing documents`, `/app/files/${a.id}`)
    }
    case 'procardex/done': return mapFile(s, a.id, (f) => log({ ...f, procardex: true }, 'Entered in Procardex · file closed and archived', who(s)))

    // Settings & config
    case 'rule/toggle': return { ...s, rules: s.rules.map((r) => (r.id === a.id ? { ...r, on: !r.on } : r)) }
    case 'rule/add': return { ...s, rules: [...s.rules, { ...a.rule, id: Date.now(), on: true, runs: 0 }] }
    case 'rates': return { ...s, rates: { ...s.rates, ...a.rates } }
    case 'template/save': return { ...s, templates: s.templates.map((t) => (t.id === a.template.id ? a.template : t)) }
    case 'event/add': return { ...s, events: [...s.events, { kind: 'internal', duration: 60, attendees: [], ...a.event, id: uid() }] }

    // Inboxes
    case 'notif/readAll': return { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }
    case 'notif/read': return { ...s, notifications: s.notifications.map((n) => (n.id === a.id ? { ...n, read: true } : n)) }
    case 'email/read': return { ...s, emails: s.emails.map((m) => (m.id === a.id ? { ...m, read: true } : m)) }
    default: return s
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY))
      if (saved?.files && saved?.leads) return saved
    } catch { /* storage unavailable */ }
    return initial()
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const toastFn = useCallback((msg) => setToast({ msg, k: Date.now() }), [])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <Ctx.Provider value={{ state, dispatch, notify: toastFn }}>
      {children}
      {toast && <div className="toast" role="status" key={toast.k}>{toast.msg}</div>}
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)
export const useFile = (id) => useStore().state.files.find((f) => f.id === id)
