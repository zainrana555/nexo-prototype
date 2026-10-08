import { TAX, DEMO_FILE, DEMO_LEAD, accessOf } from './data'
import { CHECKLISTS, DISBURSEMENTS, fileType, matchBase } from './firm'

// The file workflow. A file's stage is the first step not yet done; some steps apply only to some file types.
export const STAGES = [
  { key: 'questionnaire', label: 'Questionnaire', owner: 'Client', next: 'Client to complete questionnaire', tab: 'parties' },
  { key: 'ids', label: 'ID verification', owner: 'Staff', next: 'Review & approve IDs', tab: 'parties' },
  { key: 'contract', label: 'Service contract', owner: 'Staff', next: 'Prepare & send service contract', tab: 'contract' },
  { key: 'lender', label: 'Lender instructions', owner: 'Bank', next: 'Waiting on lender instructions', tab: 'overview' },
  { key: 'title', label: 'Due diligence', owner: 'Staff', next: 'Complete the due-diligence searches (checklist)', tab: 'checklist' },
  { key: 'booking', label: 'Appointments', owner: 'Client', next: 'Client to book signing', tab: 'overview' },
  { key: 'closing', label: 'Signing & closing', owner: 'Staff', next: 'Sign deeds in Consigno', tab: 'closing' },
  { key: 'delivery', label: 'Document delivery', owner: 'Staff', next: 'Publish final documents to portal', tab: 'closing' },
  { key: 'procardex', label: 'Procardex & archive', owner: 'Staff', next: 'Enter in Procardex & close file', tab: 'closing' },
]

export const validIds = (p) => p.ids.filter((i) => !isExpired(i.exp) && i.review !== 'rejected')
export const isExpired = (exp) => exp < new Date().toISOString().slice(0, 10)

const DONE = {
  questionnaire: (f) => f.parties.every((p) => p.questionnaire === 100 && validIds(p).length >= 2),
  ids: (f) => f.parties.every((p) => validIds(p).filter((i) => i.review === 'approved').length >= 2),
  contract: (f) => f.contract.signed,
  lender: (f) => f.bankReceived,
  title: (f) => ddItems(f).every((it) => f.checklist?.[it.id]?.para),
  booking: (f) => !!f.booking && (!fileType(f.type).twoMeetings || !!f.mortgageBooking),
  closing: (f) => f.closing.consigno,
  delivery: (f) => f.docsPublished,
  procardex: (f) => f.procardex,
}

// Stages that apply to this file (no lender step for cash, succession, wills or discharge files).
export const stagesFor = (f) => STAGES.filter((s) => s.key !== 'lender' || fileType(f.type).lender)
export const stepDone = (f, key) => DONE[key](f)
export function stageIndex(f) {
  const st = stagesFor(f)
  const i = st.findIndex((s) => !DONE[s.key](f))
  return i === -1 ? st.length : i
}
export const isClosed = (f) => stageIndex(f) >= stagesFor(f).length
export function stageInfo(f) {
  const i = stageIndex(f)
  const st = stagesFor(f)
  if (i >= st.length) return { i, label: 'Closed', owner: '—', next: 'Archived', tab: 'overview' }
  const s = st[i]
  if (s.key === 'booking' && f.booking && !f.mortgageBooking) return { ...s, i, next: 'Client to book the mortgage signing' }
  if (s.key === 'booking' && f.mortgageBooking && !f.booking) return { ...s, i, next: 'Client to book the sale signing' }
  if (s.key === 'contract' && f.contract.sent) return { ...s, i, owner: 'Client', next: 'Awaiting client e-signature' }
  if (s.key === 'questionnaire' && f.escalated) return { ...s, i, next: `Reminder ${f.reminders} sent – escalated` }
  return { ...s, i }
}
export const bookingUnlocked = (f) => f.contract.signed && (!fileType(f.type).lender || f.bankReceived)

// Fee selection = one published price (dropdown) + quantities of units/options + the contract's itemized disbursements.
export function defaultFeeSelection(file, items, { remote = false, rush = false, corporate = false, radiations = 0 } = {}) {
  const base = matchBase(items, file)
  const qty = { 'u-radiation': Number(radiations) || 0, 'o-remote': remote ? 1 : 0, 'o-rush': rush ? 1 : 0, 'o-resolution': corporate ? 1 : 0 }
  const disb = (DISBURSEMENTS[fileType(file.type).contract] ?? []).map((d) => ({ ...d, on: true }))
  return { base, qty, disb }
}

export function computeFees(sel, items) {
  const base = items.find((i) => i.id === sel.base)
  const fees = [
    ...(base ? [{ id: base.id, label: base.label, qty: 1, amount: Number(base.amount), taxable: true, kind: 'base' }] : []),
    ...items.filter((i) => i.kind !== 'base' && (sel.qty?.[i.id] ?? 0) > 0 && Number(i.amount) > 0)
      .map((i) => ({ id: i.id, label: i.label, qty: Number(sel.qty[i.id]), amount: Number(i.amount) * Number(sel.qty[i.id]), taxable: i.taxable, kind: i.kind })),
  ]
  const disb = (sel.disb ?? []).filter((d) => d.on)
  const feeTotal = fees.reduce((n, l) => n + l.amount, 0)
  const disbTax = disb.filter((d) => d.taxable).reduce((n, d) => n + Number(d.amount), 0)
  const disbNonTax = disb.filter((d) => !d.taxable).reduce((n, d) => n + Number(d.amount), 0)
  const taxableSub = feeTotal + disbTax
  const gst = taxableSub * TAX.gst
  const qst = taxableSub * TAX.qst
  return { lines: fees, fees: feeTotal, disb, disbTax, disbNonTax, taxableSub, gst, qst, total: taxableSub + disbNonTax + gst + qst, deposit: !!base?.deposit, base }
}

// Checklist helpers.
export const checklistFor = (f) => CHECKLISTS[fileType(f.type).checklist]
export const ddItems = (f) => checklistFor(f).items.filter((it) => it.dd)
export function autoDone(f, key) {
  if (key === 'contract') return f.contract.signed
  if (key === 'ids') return DONE.ids(f)
  if (key === 'insurance') return f.parties.some((p) => p.insurance?.bankAsCreditor)
  if (key === 'booking') return DONE.booking(f)
  if (key === 'funds') return !!f.funds?.requested
  return false
}

// Service contract sent but unsigned for 3+ days.
export const contractOverdue = (f) => f.contract.sent && !f.contract.signed && f.contract.sentAt && (Date.now() - new Date(f.contract.sentAt + 'T12:00')) / 86400000 >= 3

// Permission check against the editable role → permissions matrix.
export const can = (state, perm) => (state.rolePerms?.[accessOf(state.auth)] ?? []).includes(perm)


export const money = (n, lang = 'en') => Number(n || 0).toLocaleString(String(lang).toLowerCase() === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD' })

export function fmtDate(iso, lang = 'en') {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Guided demo: each step knows how to tell it's done and where to go.
export function demoSteps(state) {
  const lead = state.leads.find((l) => l.id === DEMO_LEAD)
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const d = (k) => !!file && stepDone(file, k)
  return [
    { side: 'Staff', label: 'Sign in to Nexo', done: !!state.auth, to: '/login' },
    { side: 'Client', label: 'Émilie submits the website form, then creates her client account', done: !!state.clientAccount, to: '/client/signup' },
    { side: 'Staff', label: 'Open the new lead from Émilie Gagnon and send the mini-mandate', done: lead && lead.status !== 'New', to: `/app/leads/${DEMO_LEAD}` },
    { side: 'Client', label: 'Émilie signs in and accepts the quote in her messages', done: !!file, to: '/client' },
    { side: 'Client', label: 'Émilie completes the questionnaire and uploads 2 IDs', done: d('questionnaire'), to: '/client' },
    { side: 'Staff', label: 'Approve her IDs in the ID review queue', done: d('ids'), to: '/app/id-review' },
    { side: 'Staff', label: 'Build the fee quote and send the service contract', done: !!file?.contract.sent, to: `/app/files/${DEMO_FILE}?tab=contract` },
    { side: 'Client', label: 'Émilie e-signs the service contract', done: d('contract'), to: '/client' },
    { side: 'Staff', label: 'Record the lender instructions (unlocks booking)', done: d('lender'), to: `/app/files/${DEMO_FILE}` },
    { side: 'Staff', label: 'Tick the due-diligence searches in the file checklist', done: d('title'), to: `/app/files/${DEMO_FILE}?tab=checklist` },
    { side: 'Client', label: 'Émilie books her two appointments (mortgage, then sale)', done: d('booking'), to: '/client' },
    { side: 'Staff', label: 'Mark deed signed in Consigno and publish final documents', done: d('delivery'), to: `/app/files/${DEMO_FILE}?tab=closing` },
    { side: 'Client', label: 'Émilie downloads her documents from the portal', done: !!file?.portalViewed, to: '/client' },
    { side: 'Staff', label: 'Copy the Procardex summary and close the file', done: d('procardex'), to: `/app/files/${DEMO_FILE}?tab=closing` },
  ]
}
