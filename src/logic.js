import { TAX, DEMO_FILE, DEMO_LEAD } from './data'

// The file workflow. A file's stage is the first step not yet done.
export const STAGES = [
  { key: 'questionnaire', label: 'Questionnaire', owner: 'Client', next: 'Client to complete questionnaire', tab: 'parties' },
  { key: 'ids', label: 'ID verification', owner: 'Staff', next: 'Review & approve IDs', tab: 'parties' },
  { key: 'contract', label: 'Service contract', owner: 'Staff', next: 'Prepare & send service contract', tab: 'contract' },
  { key: 'lender', label: 'Lender instructions', owner: 'Bank', next: 'Waiting on lender instructions', tab: 'overview' },
  { key: 'title', label: 'Title search', owner: 'Staff', next: 'Complete title search', tab: 'closing' },
  { key: 'booking', label: 'Signing appointment', owner: 'Client', next: 'Client to book signing', tab: 'overview' },
  { key: 'closing', label: 'Signing & closing', owner: 'Staff', next: 'Sign deed in Consigno', tab: 'closing' },
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
  title: (f) => f.title.deeds10 && f.title.chain30 && f.title.cadastre,
  booking: (f) => !!f.booking,
  closing: (f) => f.closing.consigno,
  delivery: (f) => f.docsPublished,
  procardex: (f) => f.procardex,
}

export const stepDone = (f, key) => DONE[key](f)
export function stageIndex(f) {
  const i = STAGES.findIndex((s) => !DONE[s.key](f))
  return i === -1 ? STAGES.length : i
}
export const isClosed = (f) => stageIndex(f) >= STAGES.length
export function stageInfo(f) {
  const i = stageIndex(f)
  if (i >= STAGES.length) return { i, label: 'Closed', owner: '—', next: 'Archived', tab: 'overview' }
  const s = STAGES[i]
  if (s.key === 'contract' && f.contract.sent) return { ...s, i, owner: 'Client', next: 'Awaiting client e-signature' }
  if (s.key === 'questionnaire' && f.escalated) return { ...s, i, next: `Reminder ${f.reminders} sent – escalated` }
  return { ...s, i }
}
export const bookingUnlocked = (f) => f.contract.signed && f.bankReceived

export function computeFees({ type, parties = 1, remote, rush, mortgages = 0 }, rates) {
  const professional = (Number(rates[type]) || 0) + Math.max(0, Number(parties) - 1) * Number(rates.perExtraParty)
  const remoteFee = remote ? Number(rates.remoteSigning) : 0
  const rushFee = rush ? Number(rates.rush) : 0
  const dischargeFee = Math.max(0, Number(mortgages) || 0) * (Number(rates.discharge) || 0)
  const taxable = professional + remoteFee + rushFee + dischargeFee
  const gst = taxable * TAX.gst
  const qst = taxable * TAX.qst
  const disbursements = Number(rates.disbursements)
  return { professional, remoteFee, rushFee, dischargeFee, gst, qst, disbursements, total: taxable + gst + qst + disbursements }
}

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
    { side: 'Staff', label: 'Open the new lead from Émilie Gagnon and send the mini-mandate', done: lead && lead.status !== 'New', to: `/app/leads/${DEMO_LEAD}` },
    { side: 'Client', label: 'Émilie accepts the quote from her inbox', done: !!file, to: '/client' },
    { side: 'Client', label: 'Émilie completes the questionnaire and uploads 2 IDs', done: d('questionnaire'), to: '/client' },
    { side: 'Staff', label: 'Approve her IDs in the ID review queue', done: d('ids'), to: '/app/id-review' },
    { side: 'Staff', label: 'Build the fee quote and send the service contract', done: !!file?.contract.sent, to: `/app/files/${DEMO_FILE}?tab=contract` },
    { side: 'Client', label: 'Émilie e-signs the service contract', done: d('contract'), to: '/client' },
    { side: 'Staff', label: 'Record the lender instructions (unlocks booking)', done: d('lender'), to: `/app/files/${DEMO_FILE}` },
    { side: 'Staff', label: 'Complete the title search checklist', done: d('title'), to: `/app/files/${DEMO_FILE}?tab=closing` },
    { side: 'Client', label: 'Émilie books her signing appointment', done: d('booking'), to: '/client' },
    { side: 'Staff', label: 'Mark deed signed in Consigno and publish final documents', done: d('delivery'), to: `/app/files/${DEMO_FILE}?tab=closing` },
    { side: 'Client', label: 'Émilie downloads her documents from the portal', done: !!file?.portalViewed, to: '/client' },
    { side: 'Staff', label: 'Copy the Procardex summary and close the file', done: d('procardex'), to: `/app/files/${DEMO_FILE}?tab=closing` },
  ]
}
