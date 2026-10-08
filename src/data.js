import { CHECKLISTS, fileType } from './firm'
// Seed data for the Nexo demo. All names, addresses and amounts are fictional sample data.

// `role` is the job title; `access` is the permission role (Settings → Roles & permissions).
export const STAFF = [
  { name: 'Nathalie Roy', role: 'Paralegal', access: 'Paralegal', email: 'nathalie@acoca-demo.ca' },
  { name: 'Me Anne Dubois', role: 'Notary', access: 'Owner', email: 'anne@acoca-demo.ca' },
  { name: 'Me Paul Lefebvre', role: 'Notary', access: 'Super admin', email: 'paul@acoca-demo.ca' },
  { name: 'Me Sophie Gagné', role: 'Notary', access: 'Notary', email: 'sophie@acoca-demo.ca' },
  { name: 'Me Marc Tremblay', role: 'Notary', access: 'Notary', email: 'marc@acoca-demo.ca' },
  { name: 'Me Julie Bélanger', role: 'Notary', access: 'Notary', email: 'julie@acoca-demo.ca' },
  { name: 'Me Éric Lavoie', role: 'Notary', access: 'Notary', email: 'eric@acoca-demo.ca' },
  { name: 'Me Nadia Lapointe', role: 'Notary', access: 'Notary', email: 'nadia@acoca-demo.ca' },
  { name: 'Karine Ouellet', role: 'Paralegal', access: 'Paralegal', email: 'karine@acoca-demo.ca' },
  { name: 'Sarah Pelletier', role: 'Reception', access: 'Reception', email: 'sarah@acoca-demo.ca' },
]

export const ROLES = ['Owner', 'Super admin', 'Notary', 'Paralegal', 'Reception']
export const PERMISSIONS = [
  { key: 'files.viewAll', label: 'View all files and clients' },
  { key: 'files.assign', label: 'Assign notaries and paralegals to files' },
  { key: 'leads.manage', label: 'Manage leads and send quotes' },
  { key: 'ids.review', label: 'Approve or reject client IDs' },
  { key: 'fax.route', label: 'Route unassigned faxes' },
  { key: 'templates.manage', label: 'Create and edit templates' },
  { key: 'automations.manage', label: 'Build and edit automations' },
  { key: 'fees.edit', label: 'Edit the fee table' },
  { key: 'banking.view', label: 'Back-office banking (funds and trust tracking)' },
  { key: 'users.manage', label: 'Manage users, roles and permissions' },
]
const ALL = PERMISSIONS.map((p) => p.key)
export const INITIAL_ROLE_PERMS = {
  Owner: ALL,
  'Super admin': ALL,
  Notary: ['files.viewAll', 'leads.manage', 'ids.review', 'templates.manage', 'banking.view'],
  Paralegal: ['files.viewAll', 'leads.manage', 'ids.review', 'fax.route'],
  Reception: ['files.viewAll', 'leads.manage', 'fax.route'],
}
export const accessOf = (user) => STAFF.find((s) => s.name === user?.name)?.access ?? 'Reception'

// Fee table: the firm's real price list (firm.js).
export { INITIAL_FEE_ITEMS } from './firm'
export const INITIAL_FEE_RULES = [
  { id: 'r1', on: true, when: 'Lender is a virtual bank (EQB, Manuvie, Computershare, CHIP, Haventree)', then: 'Use the virtual-bank price' },
  { id: 'r2', on: true, when: 'Lender is a private lender (PADS, Olympia, Neighbourhood…)', then: 'Use the private-lender price and require a deposit' },
  { id: 'r3', on: true, when: 'House sold over $2M / $3M', then: 'Use the $3,500 / $4,000 price' },
  { id: 'r4', on: true, when: 'A party is a corporation', then: 'Add "Resolution (corporation)" (100 $)' },
  { id: 'r5', on: true, when: 'Seller has more than one mortgage to discharge', then: 'Add "Additional radiation" (101 $ each)' },
  { id: 'r6', on: true, when: 'Signing within 5 business days', then: 'Add "Rush fees" (500 $)' },
]

export const TAX = { gst: 0.05, qst: 0.09975 }

export const DEMO_LEAD = 'L-1042'
export const DEMO_FILE = '26-0430'

// Date n days from today, moved off weekends (notary offices book weekdays only).
export function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  if (d.getDay() === 6) d.setDate(d.getDate() + (n < 0 ? -1 : 2))
  if (d.getDay() === 0) d.setDate(d.getDate() + (n < 0 ? -2 : 1))
  return d.toISOString().slice(0, 10)
}

const idDoc = (type, exp, review = 'approved') => ({ type, exp, review })

// Fill every workflow field up to (not including) stage `upTo`, so seeds land on a realistic stage.
function makeFile(f, upTo) {
  const base = {
    lang: 'FR',
    notary: 'Me Anne Dubois',
    paralegal: 'Nathalie Roy',
    lender: 'Banque Exemple',
    closingDate: addDays(21),
    contract: { sent: false, signed: false, total: 0, lang: 'FR' },
    bankReceived: false,
    checklist: {},
    sheet: {},
    tracker: {},
    funds: { requested: false, received: false },
    clientType: 'Individual',
    propertyType: 'Condo',
    lenderType: 'Conventional',
    booking: null,
    mortgageBooking: null,
    closing: { consigno: false, lenderReport: false },
    finalDocs: [],
    docsPublished: false,
    portalViewed: false,
    procardex: false,
    escalated: false,
    reminders: 0,
    log: [],
  }
  const file = { ...base, ...f }
  if (upTo > 2) file.contract = { sent: true, signed: true, total: 1612.4, lang: 'FR', sentAt: addDays(-10) }
  if (upTo > 3) file.bankReceived = true
  if (upTo > 4) for (const it of CHECKLISTS[fileType(file.type).checklist].items.filter((x) => x.dd)) file.checklist = { ...file.checklist, [it.id]: { req: true, para: true, notary: true } }
  if (upTo > 5) file.funds = { requested: true, received: upTo > 6 }
  if (upTo > 5) file.booking = file.booking ?? { mode: 'In person', date: addDays(-3), time: '10:30', notary: file.notary ?? 'Me Anne Dubois' }
  if (upTo > 5 && fileType(file.type).twoMeetings) file.mortgageBooking = file.mortgageBooking ?? { mode: 'In person', date: addDays(-8), time: '14:00', notary: file.notary ?? 'Me Anne Dubois' }
  if (upTo > 6) file.closing = { consigno: true, lenderReport: true }
  if (upTo > 7) {
    file.finalDocs = FINAL_DOCS
    file.docsPublished = true
  }
  if (upTo > 8) file.procardex = true
  return { ...file, ...f.override }
}

export const FINAL_DOCS = [
  { name: 'Deed of sale (executed)', nameFr: 'Acte de vente (signé)', size: '1.2 MB' },
  { name: 'Hypothec deed', nameFr: 'Acte d’hypothèque', size: '980 KB' },
  { name: 'Statement of adjustments', nameFr: 'État des ajustements', size: '210 KB' },
  { name: 'Final invoice & receipt', nameFr: 'Facture finale et reçu', size: '96 KB' },
]

const party = (name, role, ids, extra = {}) => ({
  name, role, email: name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.') + '@exemple.ca',
  phone: '514-555-01' + String(name.length).padStart(2, '0'),
  marital: 'Married', ids, liveness: 'Passed', questionnaire: 100, ...extra,
})

const log = (...entries) => entries.map(([t, e, who = 'System']) => ({ t, e, who }))

export const INITIAL_FILES = [
  makeFile({
    id: '26-0412', clients: ['Lucas Bergeron', 'Chloé Bergeron'], type: 'Purchase', propertyType: 'House', addr: '4520 av. des Érables', city: 'Montréal',
    escalated: true, reminders: 2,
    parties: [
      party('Lucas Bergeron', 'Buyer', [idDoc('Passport', '2031-04-30'), idDoc("Driver's licence", '2029-08-15')]),
      party('Chloé Bergeron', 'Buyer', [idDoc("Driver's licence", '2025-02-11', 'rejected')], { questionnaire: 60, liveness: 'Not started' }),
    ],
    log: log(['Today 09:00', 'Automation: reminder #2 emailed to Chloé Bergeron'], ['2 days ago', 'Expired licence detected for Chloé Bergeron'], ['4 days ago', 'Lucas Bergeron completed questionnaire'], ['5 days ago', 'File created from lead L-1031', 'Nathalie Roy']),
  }, 0),
  makeFile({
    id: '26-0415', clients: ['Nadia Haddad'], type: 'Refinance', addr: '77 rue Saint-Charles O.', city: 'Longueuil', lender: 'Caisse Exemple',
    parties: [party('Nadia Haddad', 'Borrower', [idDoc('Passport', '2030-01-10', 'pending'), idDoc("Driver's licence", '2028-05-21', 'pending')], { marital: 'Single' })],
    log: log(['Today 08:12', 'Nadia Haddad uploaded 2 IDs + passed face check'], ['3 days ago', 'File created from lead L-1036', 'Karine Ouellet']),
  }, 1),
  makeFile({
    id: '26-0418', clients: ['Robert Simard'], type: 'Sale', addr: '1200 boul. René-Lévesque', city: 'Québec', notary: 'Me Paul Lefebvre',
    contract: { sent: true, signed: false, total: 912.3, lang: 'FR', sentAt: addDays(-4) },
    parties: [party('Robert Simard', 'Seller', [idDoc('Passport', '2032-06-01'), idDoc("Driver's licence", '2028-03-03')], { marital: 'Divorced' })],
    log: log(['Yesterday', 'Service contract sent for e-signature', 'Nathalie Roy']),
  }, 2),
  makeFile({
    id: '26-0421', clients: ['Kevin Morin', 'Julie Morin'], type: 'Purchase', lenderType: 'Virtual bank', lender: 'EQB', addr: '35 rue des Pins', city: 'Brossard', lender: 'Banque Exemple',
    parties: [
      party('Kevin Morin', 'Buyer', [idDoc('Passport', '2030-09-09'), idDoc("Driver's licence", '2027-12-12')], { marital: 'Common-law' }),
      party('Julie Morin', 'Buyer', [idDoc('Passport', '2031-02-02'), idDoc("Driver's licence", '2028-07-07')], { marital: 'Common-law' }),
    ],
    log: log(['2 days ago', 'Service contract signed by all parties']),
  }, 3),
  makeFile({
    id: '26-0423', clients: ['Isabelle Fortin'], type: 'Purchase', addr: '980 ch. du Lac', city: 'Laval', closingDate: addDays(2),
    booking: { mode: 'In person', date: addDays(2), time: '10:30', notary: 'Me Anne Dubois' },
    mortgageBooking: { mode: 'Teams video', date: addDays(-3), time: '14:00', notary: 'Me Anne Dubois' },
    parties: [party('Isabelle Fortin', 'Buyer', [idDoc('Passport', '2033-01-01'), idDoc("Driver's licence", '2029-01-01')], { marital: 'Single' })],
    log: log(['Yesterday', 'Client booked signing (in person)']),
  }, 6),
  makeFile({
    id: '26-0426', clients: ['Daniel Roy'], type: 'Refinance', addr: '15 rue King', city: 'Sherbrooke', closingDate: addDays(-2),
    parties: [party('Daniel Roy', 'Borrower', [idDoc('Passport', '2030-05-05'), idDoc("Driver's licence", '2027-05-05')])],
    log: log(['Yesterday', 'Final documents published to client portal', 'Nathalie Roy']),
  }, 8),
  makeFile({
    id: '26-0429', clients: ['Mélanie Pelletier'], type: 'Sale', propertyType: 'House', addr: '210 rue Principale', city: 'Gatineau', closingDate: addDays(-6),
    parties: [party('Mélanie Pelletier', 'Seller', [idDoc('Passport', '2031-11-11'), idDoc("Driver's licence", '2028-11-11')], { marital: 'Single' })],
    log: log(['3 days ago', 'File closed and archived', 'Nathalie Roy']),
  }, 9),
  makeFile({
    id: '26-0427', clients: ['Gestion Immobilière Exemple inc.'], clientType: 'Corporation', type: 'Discharge', addr: '18 rue des Cèdres', city: 'Longueuil', lender: 'Prêteur privé (Olympia)', lenderType: 'Private lender',
    parties: [party('Simon Paquette', 'Borrower', [idDoc('Passport', '2031-03-03'), idDoc("Driver's licence", '2029-03-03')], { corporate: true, marital: 'Corporation' })],
    log: log(['Yesterday', 'Payout statement requested from the lender', 'Karine Ouellet']),
  }, 4),
  makeFile({
    id: '26-0432', clients: ['Succession de feu Robert Gauthier'], type: 'Succession', addr: '12 rue des Lilas', city: 'Montréal', notary: 'Me Paul Lefebvre', lender: '—',
    parties: [party('Hélène Gauthier', 'Liquidator', [idDoc('Passport', '2030-07-07'), idDoc("Driver's licence", '2028-07-07')], { marital: 'Widowed' })],
    log: log(['2 days ago', 'Will searches requested (Chambre des notaires, Barreau)', 'Nathalie Roy']),
  }, 4),
  makeFile({
    id: '26-0434', clients: ['Marc et Lise Fontaine'], type: 'Wills & mandates', addr: '—', city: 'Laval', notary: 'Me Sophie Gagné', lender: '—',
    parties: [party('Marc Fontaine', 'Testator', [idDoc('Passport', '2031-01-01'), idDoc("Driver's licence", '2029-01-01')]), party('Lise Fontaine', 'Testator', [idDoc('Passport', '2031-02-02'), idDoc("Driver's licence", '2029-02-02')])],
    log: log(['Yesterday', 'Wills and mandates questionnaire received', 'Sarah Pelletier']),
  }, 2),
]

// The demo lead is the one the guided journey follows.
export const INITIAL_LEADS = [
  {
    id: DEMO_LEAD, isDemo: true, name: 'Émilie Gagnon', email: 'emilie.gagnon@exemple.ca', phone: '514-555-0142', source: 'Website form', formNo: '1649881573', subject: 'Achat condo - Soumission',
    service: 'Real estate', propertyType: 'Condo', lenderType: 'Conventional',
    type: 'Purchase', property: '1450 rue Sherbrooke E., app. 302, Montréal', closingDate: addDays(35), lang: 'FR', status: 'New', received: 'Today 08:41',
    message: 'Bonjour, je suis en processus d’achat d’un condo (4 ½) à Montréal, avec une offre acceptée et toutes les conditions levées, pour une signature chez le notaire prévue dans environ 5 semaines. Je souhaiterais obtenir une soumission pour les frais liés à l’achat. Merci beaucoup!',
    log: [{ t: 'Today 08:41', e: 'Inquiry received by email', who: 'System' }, { t: 'Today 08:41', e: 'Automation: acknowledgement sent by email + SMS', who: 'System' }],
  },
  {
    id: 'L-1045', name: 'Thomas Nguyen', email: 't.nguyen@exemple.ca', phone: '514-555-0166', source: 'AI phone agent', type: 'Purchase',
    property: 'Condo, Rosemont, Montréal', closingDate: addDays(45), lang: 'FR', status: 'New', received: 'Today 09:12', callMinutes: 4.2,
    message: 'Résumé de l’appel (agent IA) : premier achat d’un condo à Rosemont, offre acceptée, signature prévue vers le début décembre. Demande une estimation des honoraires et si la signature à distance est possible. Préfère le français. Rappeler en après-midi.',
    transcript: [
      ['Agent IA', 'Acoca Notaires, bonjour! Je suis l’assistante virtuelle. Comment puis-je vous aider?'],
      ['Appelant', 'Bonjour, j’achète un condo à Rosemont, mon offre a été acceptée hier.'],
      ['Agent IA', 'Félicitations! Avez-vous une date de signature prévue?'],
      ['Appelant', 'Vers le début décembre. Je voudrais savoir combien coûtent vos services, et si on peut signer à distance.'],
      ['Agent IA', 'Une parajuriste vous enverra une soumission détaillée aujourd’hui. La signature à distance par Teams est possible. Quel est le meilleur moment pour vous rappeler?'],
      ['Appelant', 'En après-midi, c’est parfait.'],
    ],
    log: [{ t: 'Today 09:12', e: 'Phone call answered by AI agent (4.2 min) · transcript and summary saved', who: 'System' }],
  },
  {
    id: 'L-1046', name: 'Gestion Immobilière Exemple inc.', clientType: 'Corporation', email: 'admin@gie-exemple.ca', phone: '450-555-0133', source: 'Website form', type: 'Refinance',
    property: '18 rue des Cèdres, Longueuil', closingDate: addDays(30), lang: 'FR', status: 'New', received: 'Yesterday',
    message: 'Refinancement d’un immeuble de 6 logements détenu par notre société, avec un prêteur privé. Le signataire sera notre président, M. Simon Paquette.',
    log: [{ t: 'Yesterday', e: 'Inquiry received via website form · corporate client detected', who: 'System' }, { t: 'Yesterday', e: 'Automation: email + SMS acknowledgement sent', who: 'System' }],
  },
  {
    id: 'L-1047', name: 'Équipe Courtage Exemple (courtier)', email: 'acquisitions@courtage-exemple.ca', phone: '514-555-0181', source: 'Broker email', service: 'Real estate',
    type: 'Purchase', propertyType: 'Commercial', lenderType: 'Conventional', property: 'Immeuble commercial, Vaudreuil', closingDate: addDays(14), lang: 'EN', status: 'New', received: 'Today 07:32',
    subject: 'Commercial property – Vaudreuil', message: 'Hello, please provide the notary fee for this commercial property in Vaudreuil. Signing day as soon as possible. Thank you!',
    log: [{ t: 'Today 07:32', e: 'Broker email received at info@ · forwarded by reception', who: 'System' }],
  },
  {
    id: 'L-1048', name: 'Claire et Martin Roy', email: 'claire.roy@exemple.ca', phone: '450-555-0161', source: 'Referral (financial planner)', service: 'Wills & mandates',
    type: 'Wills & mandates', property: '—, Laval', lang: 'FR', status: 'New', received: 'Yesterday',
    message: 'Notre planificateur financier nous a recommandé votre étude pour nos testaments et mandats de protection (couple).',
    log: [{ t: 'Yesterday', e: 'Referral received from a financial planner', who: 'System' }],
  },
  {
    id: 'L-1049', name: 'David Bélanger', email: 'd.belanger@exemple.ca', phone: '514-555-0175', source: 'Phone', service: 'Will search',
    type: 'Succession', property: '—, Montréal', lang: 'FR', status: 'New', received: '2 days ago',
    message: 'Mon père est décédé le mois dernier; nous ne savons pas s’il avait un testament. Pouvez-vous faire une recherche testamentaire?',
    log: [{ t: '2 days ago', e: 'Call logged by reception', who: 'Sarah Pelletier' }],
  },
  {
    id: 'L-1043', name: 'Olivier Martin', email: 'o.martin@exemple.ca', phone: '438-555-0177', source: 'Website form', formNo: '1649877210', subject: 'Vente duplex - quittance', service: 'Real estate', propertyType: 'Multi ≤ 6 units', type: 'Sale',
    property: '62 rue Bélanger, Montréal', closingDate: addDays(50), lang: 'FR', status: 'New', received: 'Today 07:15',
    message: 'Je vends mon duplex, l’acheteur a choisi son notaire mais j’ai besoin d’une quittance. Combien?',
    log: [{ t: 'Today 07:15', e: 'Inquiry received via website form', who: 'System' }],
  },
  {
    id: 'L-1040', name: 'Priya Sharma', email: 'priya.s@exemple.ca', phone: '514-555-0190', source: 'Broker referral', type: 'Refinance',
    property: '3300 av. Van Horne, Montréal', closingDate: addDays(28), lang: 'EN', status: 'Mini-mandate sent', received: 'Yesterday', quote: 1184.5,
    message: 'Hi, my mortgage broker referred me. I am refinancing with a new lender. What are your fees?',
    log: [{ t: 'Yesterday', e: 'Mini-mandate sent (EN)', who: 'Karine Ouellet' }],
  },
  {
    id: 'L-1038', name: 'Jean-François Côté', email: 'jf.cote@exemple.ca', phone: '819-555-0123', source: 'Email', type: 'Purchase',
    property: '45 rue du Moulin, Gatineau', closingDate: addDays(40), lang: 'FR', status: 'Follow-up', received: '4 days ago', quote: 1622.9,
    message: 'Bonjour, quel est le coût pour un achat avec hypothèque?',
    log: [{ t: '4 days ago', e: 'Mini-mandate sent (FR)', who: 'Nathalie Roy' }, { t: '2 days ago', e: 'Automation: follow-up #1 sent', who: 'System' }],
  },
  {
    id: 'L-1036', name: 'Nadia Haddad', email: 'nadia.h@exemple.ca', phone: '450-555-0110', source: 'Email', type: 'Refinance',
    property: '77 rue Saint-Charles O., Longueuil', lang: 'FR', status: 'Won', received: '6 days ago', quote: 1184.5, fileId: '26-0415',
    message: 'Refinancement hypothécaire, combien?', log: [{ t: '3 days ago', e: 'Mini-mandate accepted, file 26-0415 created', who: 'System' }],
  },
  {
    id: 'L-1033', name: 'Marc-André Bouchard', email: 'ma.bouchard@exemple.ca', phone: '418-555-0150', source: 'Phone', type: 'Purchase',
    property: 'Québec', lang: 'FR', status: 'Lost', received: '9 days ago', quote: 1622.9, lostReason: 'Chose another notary (price)',
    message: 'Demande de prix pour un achat.', log: [{ t: '5 days ago', e: 'Marked lost: chose another notary', who: 'Nathalie Roy' }],
  },
]

export const LEAD_COLUMNS = ['New', 'Mini-mandate sent', 'Follow-up', 'Won', 'Lost']

// Automations are sequences: a trigger, then ordered steps (email, sms, wait, condition, notify, escalate).
const E = (template) => ({ kind: 'email', template })
const SMS = (text) => ({ kind: 'sms', text })
const WAIT = (days) => ({ kind: 'wait', days })
const IF = (label) => ({ kind: 'condition', label })
const NOTIFY = (who) => ({ kind: 'notify', who })
const ESC = (who) => ({ kind: 'escalate', who })
export const INITIAL_RULES = [
  { id: 1, name: 'Acknowledge new inquiry', trigger: 'New lead received', steps: [E('Acknowledgement'), SMS('Merci! Nous vous répondons sous 24 h.'), NOTIFY('Reception')], maxRetries: 1, stopOnReply: true, on: true, runs: 42 },
  { id: 2, name: 'Mini-mandate follow-up', trigger: 'Mini-mandate not accepted', steps: [WAIT(2), IF('Client accepted?'), E('Mini-mandate follow-up'), WAIT(3), SMS('Petit rappel : votre soumission vous attend.'), ESC('Paralegal')], maxRetries: 2, stopOnReply: true, on: true, runs: 17 },
  { id: 3, name: 'Open file on acceptance', trigger: 'Client accepts mini-mandate', steps: [{ kind: 'action', label: 'Create file' }, E('Questionnaire invitation'), NOTIFY('Assigned paralegal')], maxRetries: 1, stopOnReply: false, on: true, runs: 23 },
  { id: 4, name: 'Questionnaire reminder', trigger: 'Questionnaire incomplete after 48 h', steps: [E('Reminder · Missing documents'), WAIT(2), IF('Questionnaire complete?'), SMS('Il nous manque quelques informations pour votre dossier.'), WAIT(2), ESC('Paralegal')], maxRetries: 3, stopOnReply: true, on: true, runs: 31 },
  { id: 5, name: 'Escalate unanswered files', trigger: '3rd reminder unanswered after 2 days', steps: [{ kind: 'action', label: 'Flag file as escalated' }, ESC('Assigned paralegal'), NOTIFY('Assigned notary')], maxRetries: 1, stopOnReply: false, on: true, runs: 6 },
  { id: 6, name: 'ID problem', trigger: 'ID expired or 2nd ID missing', steps: [E('Reminder · Missing documents'), NOTIFY('Assigned paralegal')], maxRetries: 2, stopOnReply: true, on: true, runs: 9 },
  { id: 7, name: 'Contract signature chase', trigger: 'Service contract unsigned after 3 days', steps: [E('Service contract for signature'), WAIT(2), IF('Signed?'), SMS('Votre convention est prête à signer.'), WAIT(2), ESC('Assigned paralegal')], maxRetries: 2, stopOnReply: true, on: true, runs: 11 },
  { id: 8, name: 'Unlock booking', trigger: 'Bank instructions received AND contract signed', steps: [E('Booking link (3 proposed times)'), WAIT(2), IF('Booked?'), SMS('Choisissez votre rendez-vous de signature.')], maxRetries: 2, stopOnReply: true, on: true, runs: 19 },
  { id: 9, name: 'Post-closing delivery', trigger: 'Final documents published', steps: [E('Documents ready'), WAIT(7), IF('Downloaded?'), E('Documents ready')], maxRetries: 1, stopOnReply: false, on: true, runs: 15 },
  { id: 10, name: 'Appointment reminder', trigger: 'Appointment in 24 hours', steps: [E('Appointment reminder'), SMS('Rappel : votre rendez-vous demain. Lien Teams dans le courriel.')], maxRetries: 1, stopOnReply: false, on: true, runs: 27 },
  { id: 11, name: 'Outlook changes', trigger: 'Appointment moved or deleted in Outlook', steps: [{ kind: 'action', label: 'Update the file' }, E('Appointment changed'), NOTIFY('Assigned paralegal')], maxRetries: 1, stopOnReply: false, on: true, runs: 4 },
  { id: 12, name: 'Fax routing fallback', trigger: 'Fax received with low match confidence', steps: [NOTIFY('Reception'), WAIT(1), IF('Routed?'), ESC('Office manager')], maxRetries: 1, stopOnReply: false, on: true, runs: 8 },
]
export const RULE_TRIGGERS = ['New lead received', 'Mini-mandate not accepted', 'Client accepts mini-mandate', 'Questionnaire incomplete after 48 h', 'ID expired or 2nd ID missing', 'Service contract unsigned after 3 days', 'Bank instructions received AND contract signed', 'Appointment in 24 hours', 'Appointment moved or deleted in Outlook', 'Closing date in 7 days', 'Final documents published', 'Fax received with low match confidence', '3rd reminder unanswered after 2 days']
export const STEP_KINDS = [
  { kind: 'email', label: 'Send email' }, { kind: 'sms', label: 'Send text message' }, { kind: 'wait', label: 'Wait' },
  { kind: 'condition', label: 'Check (if / else)' }, { kind: 'notify', label: 'Notify staff' }, { kind: 'escalate', label: 'Escalate' }, { kind: 'action', label: 'Update file' },
]

export const INITIAL_TEMPLATES = [
  { id: 't1', group: 'Leads', name: 'Mini-mandate · Buyer', subject: { FR: "Votre achat – {{adresse}}", EN: "Your purchase – {{address}}" }, body: { FR: "Bonjour {{client}},\n\nFélicitations pour votre nouvel achat!\n\nVeuillez trouver ci-dessous les informations relatives à l’acquisition de votre nouvelle propriété ({{adresse}}). Nous vous joignons un guide explicatif destiné à l’acheteur.\n\nNos honoraires pour ce dossier sont approximativement de {{total}} + taxes et frais. Nous vous saurions gré de confirmer votre acceptation de ces frais (bouton ci-dessous). Dès réception, l’un(e) de nos parajuristes procédera à la recherche des titres et vous transmettra un contrat de service professionnel détaillant l’ensemble des frais.\n\nVeuillez informer votre représentant bancaire de faire parvenir les instructions hypothécaires au nom du notaire à être désigné. Les rendez-vous sont fixés uniquement après la signature du contrat de service et la réception des instructions bancaires.\n\nAfin de débuter votre dossier, veuillez nous fournir dans les plus brefs délais :\n• Deux pièces d’identité valides (avec photo, en couleurs, recto verso), ainsi qu’une copie de votre passeport canadien pour chaque acheteur\n• Votre adresse complète\n• Votre état civil (et, selon le cas, jugement de divorce, contrat et certificat de mariage, ou certificat de décès; les conjoints de fait jamais mariés sont célibataires)\n• Les coordonnées de toutes les parties, incluant le vendeur, afin que nous puissions lui transmettre ses frais\n• Si vous n’avez pas de courtier : la promesse d’achat acceptée, le certificat de localisation et les coordonnées du syndicat / de la gestion\n\nUne assurance habitation prenant effet à la date de l’acte de vente devra être obtenue.\n\nTout délai pourrait entraîner un report de votre rendez-vous. Merci d’avoir choisi Acoca Notaires. Si vous ne souhaitez pas poursuivre avec notre étude, avisez-nous dans les plus brefs délais.\n\n{{signature}}", EN: "Hello {{client}},\n\nCongratulations on your new purchase!\n\nPlease find below information regarding the acquisition of your new property ({{address}}). An explanatory guide for buyers is attached.\n\nOur professional fees for this file are approximately {{total}} + taxes and disbursements. Kindly confirm your acceptance of these fees (button below). Upon confirmation, one of our paralegals will proceed with the title search and send you a professional services agreement detailing all applicable fees.\n\nPlease ask your bank representative to send the mortgage instructions in the name of the notary to be designated. Appointments are scheduled only after the services agreement is signed and the mortgage instructions are received.\n\nTo open your file, please provide as soon as possible:\n• Two valid pieces of identification (photo, in colour, front and back), plus a copy of your Canadian passport for each purchaser\n• Your full address\n• Your civil status (and, as applicable, divorce judgment, marriage contract and certificate, or death certificate; common-law partners never married are single)\n• Contact details of all parties, including the seller, so we can send them their fees\n• If you have no broker: the accepted promise to purchase, the certificate of location and the syndicate / management contacts\n\nA home insurance policy effective on the date of the deed of sale must be obtained.\n\nAny delay may postpone your appointment. Thank you for choosing Acoca Notaires. If you do not wish to proceed with our firm, please let us know as soon as possible.\n\n{{signature}}" } },
  { id: 't2', group: 'Leads', name: 'Mini-mandate · Seller', subject: { FR: "Votre vente – {{adresse}}", EN: "Your sale – {{address}}" }, body: { FR: "Bonjour {{client}},\n\nMerci d’avoir choisi Acoca Notaires pour la vente de votre propriété ({{adresse}}). Vous trouverez ci-joint notre guide explicatif destiné au vendeur.\n\nNos honoraires pour ce dossier sont approximativement de {{total}} + taxes et frais, payables à même le produit de la vente. Veuillez confirmer votre acceptation (bouton ci-dessous).\n\nAfin de débuter votre dossier, veuillez nous fournir :\n• Deux pièces d’identité valides (photo, en couleurs, recto verso)\n• Votre état civil et, s’il y a lieu, les documents qui s’y rattachent\n• Le nom de votre institution financière et votre numéro de prêt hypothécaire (pour l’état de compte de quittance)\n• Votre nouvelle adresse après la vente\n• Si la propriété est louée : les baux en vigueur et la liste des loyers\n• Les titres originaux, si vous les avez\n\n{{signature}}", EN: "Hello {{client}},\n\nThank you for choosing Acoca Notaires for the sale of your property ({{address}}). Our explanatory guide for sellers is attached.\n\nOur professional fees for this file are approximately {{total}} + taxes and disbursements, payable from the sale proceeds. Kindly confirm your acceptance (button below).\n\nTo open your file, please provide:\n• Two valid pieces of identification (photo, in colour, front and back)\n• Your civil status and related documents, if any\n• Your lender’s name and mortgage loan number (for the payout statement)\n• Your new address after the sale\n• If the property is rented: current leases and the rent roll\n• Original titles, if you have them\n\n{{signature}}" } },
  { id: 't3', group: 'Leads', name: 'Mini-mandate · Refinance', subject: { FR: "Votre refinancement – {{adresse}}", EN: "Your refinancing – {{address}}" }, body: { FR: "Bonjour {{client}},\n\nSuite à notre appel, nous vous transmettons les détails relatifs au refinancement de votre propriété ({{adresse}}).\n\nNos honoraires sont estimés à environ {{total}} + taxes et frais. Veuillez confirmer votre acceptation (bouton ci-dessous). Informez aussi votre représentant bancaire de faire parvenir les instructions hypothécaires au nom du notaire à être désigné.\n\nDès réception, une parajuriste vous fera parvenir un contrat de service professionnel détaillant l’ensemble des frais, puis nous fixerons les rendez-vous pour la signature.\n\nVeuillez nous fournir : deux pièces d’identité valides (photo, couleurs, recto verso) et une copie de votre passeport canadien, votre adresse complète, votre état civil et les documents qui s’y rattachent.\n\nUne assurance prenant effet à la date de l’acte d’hypothèque devra être obtenue.\n\n{{signature}}", EN: "Hello {{client}},\n\nFollowing our call, here are the details regarding the refinancing of your property ({{address}}).\n\nOur fees are estimated at approximately {{total}} + taxes and disbursements. Kindly confirm your acceptance (button below). Please also ask your bank representative to send the mortgage instructions in the name of the notary to be designated.\n\nUpon confirmation, a paralegal will send you a professional services agreement detailing all fees, and we will then schedule the signing appointments.\n\nPlease provide: two valid pieces of ID (photo, colour, front and back) and a copy of your Canadian passport, your full address, your civil status and related documents.\n\nInsurance effective on the date of the mortgage deed must be obtained.\n\n{{signature}}" } },
  { id: 't11', group: 'Leads', name: 'Mini-mandate · Wills & mandates', subject: { FR: "Votre testament et mandat de protection", EN: "Your will and protection mandate" }, body: { FR: "Bonjour {{client}},\n\nNous sommes ravis de vous accompagner dans la préparation de votre testament (et de votre mandat de protection). Vous trouverez ci-joint nos questionnaires afin de bien préparer votre première rencontre.\n\nLes testaments simples et les mandats de protection débutent à 650 $ + frais d’inscription et taxes, par document. À la suite de la première rencontre, des frais de consultation initiale de 250 $ + taxes seront facturés et entièrement crédités si vous poursuivez.\n\nPour un rendez-vous en personne, apportez deux pièces d’identité valides, votre carte d’assurance sociale et un document attestant votre état civil. Une rencontre en ligne (Teams) est aussi possible.\n\n{{signature}}", EN: "Hello {{client}},\n\nWe are delighted to help you prepare your will (and protection mandate). Please find attached our questionnaires to prepare your first meeting.\n\nSimple wills and protection mandates start at $650 plus registration fees and taxes, per document. After the first meeting, an initial consultation fee of $250 + taxes is billed and fully credited if you proceed.\n\nFor an in-person meeting, bring two valid IDs, your social insurance card and a document showing your civil status. An online (Teams) meeting is also possible.\n\n{{signature}}" } },
  { id: 't12', group: 'Leads', name: 'Mini-mandate · Homologation', subject: { FR: "Homologation d’un mandat de protection", EN: "Homologation of a protection mandate" }, body: { FR: "Bonjour {{client}},\n\nMerci de nous avoir contactés concernant l’homologation d’un mandat de protection. Il s’agit d’une procédure en plusieurs étapes (évaluations médicale et psychosociale, rencontre des mandataires, vérification du mandat, notification des parties, démarches notariales et judiciaires) qui prend généralement entre 6 et 9 mois.\n\nNos honoraires sont de 3 500 $ + taxes, en plus des déboursés. Si vous souhaitez aller de l’avant, nous vous ferons parvenir un contrat de service détaillé et la liste des documents requis.\n\n{{signature}}", EN: "Bonjour {{client}},\n\nMerci de nous avoir contactés concernant l’homologation d’un mandat de protection. Il s’agit d’une procédure en plusieurs étapes (évaluations médicale et psychosociale, rencontre des mandataires, vérification du mandat, notification des parties, démarches notariales et judiciaires) qui prend généralement entre 6 et 9 mois.\n\nNos honoraires sont de 3 500 $ + taxes, en plus des déboursés. Si vous souhaitez aller de l’avant, nous vous ferons parvenir un contrat de service détaillé et la liste des documents requis.\n\n{{signature}}" } },
  { id: 't13', group: 'Leads', name: 'Mini-mandate · Will search', subject: { FR: "Recherche testamentaire", EN: "Will search" }, body: { FR: "Bonjour {{client}},\n\nMerci de votre confiance. Vous trouverez ci-joint notre questionnaire pour les recherches testamentaires.\n\nSans le certificat de décès original délivré par le Directeur de l’état civil, nous ne pourrons pas fournir les certificats de recherche. À la réception du questionnaire et du certificat, nous lancerons les recherches à la Chambre des notaires et au Barreau du Québec. Un dépôt de 400 $ est requis avant de commencer.\n\n{{signature}}", EN: "Bonjour {{client}},\n\nMerci de votre confiance. Vous trouverez ci-joint notre questionnaire pour les recherches testamentaires.\n\nSans le certificat de décès original délivré par le Directeur de l’état civil, nous ne pourrons pas fournir les certificats de recherche. À la réception du questionnaire et du certificat, nous lancerons les recherches à la Chambre des notaires et au Barreau du Québec. Un dépôt de 400 $ est requis avant de commencer.\n\n{{signature}}" } },
  { id: 't4', group: 'Files', name: 'Questionnaire invitation', subject: { FR: 'Ouvrez votre dossier en ligne – {{adresse}}', EN: 'Open your file online – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nVotre dossier {{dossier}} est ouvert. Remplissez le questionnaire sécurisé : {{lien}}', EN: 'Hello {{client}},\n\nYour file {{file}} is open. Complete the secure questionnaire: {{link}}' } },
  { id: 't5', group: 'Files', name: 'Reminder · Missing documents', subject: { FR: 'Rappel : documents manquants – {{adresse}}', EN: 'Reminder: missing documents – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nIl nous manque encore : {{manquants}}.', EN: 'Hello {{client}},\n\nWe are still missing: {{missing}}.' } },
  { id: 't6', group: 'Files', name: 'Service contract for signature', subject: { FR: 'Votre convention de services à signer – {{adresse}}', EN: 'Your service contract to sign – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nVeuillez signer votre convention : {{lien}}', EN: 'Hello {{client}},\n\nPlease sign your service contract: {{link}}' } },
  { id: 't7', group: 'Files', name: 'Booking link', subject: { FR: 'Réservez votre signature – {{adresse}}', EN: 'Book your signing – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nChoisissez votre rendez-vous : {{lien}}', EN: 'Hello {{client}},\n\nPick your appointment: {{link}}' } },
  { id: 't8', group: 'Files', name: 'Documents ready', subject: { FR: 'Vos documents sont prêts – {{adresse}}', EN: 'Your documents are ready – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nVos documents finaux sont disponibles : {{lien}}', EN: 'Hello {{client}},\n\nYour final documents are available: {{link}}' } },
  { id: 't9', group: 'Files', name: 'Funds request', subject: { FR: 'Fonds requis pour la signature – {{adresse}}', EN: 'Funds required for signing – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nVoici le montant à prévoir pour la signature : {{montant}}.\n\n• Virement ou coupon bancaire (Atlas) au compte en fidéicommis de l’étude\n• Preuve d’assurance habitation indiquant la banque comme créancier\n\nPour votre sécurité, nos coordonnées bancaires ne sont jamais envoyées par courriel : appelez-nous pour les obtenir.\n\n{{signature}}', EN: 'Hello {{client}},\n\nHere is the amount to provide for signing: {{amount}}.\n\n• Wire transfer or bank coupon (Atlas) to the firm’s trust account\n• Proof of home insurance naming the bank as creditor\n\nFor your security, our banking details are never sent by email: call us to get them.\n\n{{signature}}' } },
  { id: 't10', group: 'Leads', name: 'Mini-mandate · Corporation', subject: { FR: 'Votre soumission – société – {{adresse}}', EN: 'Your quote – corporation – {{address}}' }, body: { FR: 'Bonjour,\n\nPour une transaction au nom d’une société, nous aurons besoin :\n• des statuts et du registre des entreprises (NEQ)\n• d’une résolution autorisant le signataire\n• des pièces d’identité du signataire\n\nNos honoraires : {{total}}.\n\n{{signature}}', EN: 'Hello,\n\nFor a transaction in a corporation’s name we will need:\n• articles and enterprise register (NEQ)\n• a resolution authorizing the signing officer\n• the signing officer’s IDs\n\nOur fees: {{total}}.\n\n{{signature}}' } },
  { id: 'i1', group: 'Internal', name: 'Fax received (staff notification)', recipients: 'Notary + paralegal', access: ['Owner', 'Super admin', 'Paralegal', 'Reception'], subject: { FR: 'Télécopie reçue – dossier {{dossier}}', EN: 'Fax received – file {{file}}' }, body: { FR: 'Une télécopie ({{type}}) a été associée au dossier {{dossier}}.', EN: 'A fax ({{type}}) was matched to file {{file}}.' } },
  { id: 'c1', group: 'Contracts', name: 'Service contract · Purchase', subject: { FR: 'Convention – achat', EN: 'Agreement – purchase' }, body: { FR: 'CONVENTION DE SERVICES PROFESSIONNELS\n\nEntre {{etude}} et {{client}}…', EN: 'PROFESSIONAL SERVICES AGREEMENT\n\nBetween {{office}} and {{client}}…' } },
  { id: 'c2', group: 'Contracts', name: 'Service contract · Sale', subject: { FR: 'Convention – vente', EN: 'Agreement – sale' }, body: { FR: 'CONVENTION DE SERVICES PROFESSIONNELS – VENTE…', EN: 'PROFESSIONAL SERVICES AGREEMENT – SALE…' } },
  { id: 'c3', group: 'Contracts', name: 'Service contract · Refinance', subject: { FR: 'Convention – refinancement', EN: 'Agreement – refinance' }, body: { FR: 'CONVENTION DE SERVICES PROFESSIONNELS – REFINANCEMENT…', EN: 'PROFESSIONAL SERVICES AGREEMENT – REFINANCE…' } },
]

// kind: consultation | internal. File signings live on each file's `booking`.
export const INITIAL_EVENTS = [
  { id: 'e1', kind: 'consultation', title: 'Consultation – Olivier Martin', date: addDays(1), time: '14:00', duration: 30, mode: 'Teams video', who: 'Me Anne Dubois', leadId: 'L-1043', attendees: ['Olivier Martin'], teamsUrl: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_e1%40thread.v2', bookedBy: 'Client' },
  { id: 'e2', kind: 'consultation', title: 'Consultation – Priya Sharma', date: addDays(2), time: '11:00', duration: 15, mode: 'Phone', who: 'Karine Ouellet', leadId: 'L-1040', attendees: ['Priya Sharma'], bookedBy: 'Client' },
  { id: 'e3', kind: 'internal', title: 'Team meeting', date: addDays(0), time: '16:00', duration: 60, mode: 'Office', who: 'All', attendees: [] },
]

// Who clients can book, and for what (paralegals book on behalf of any notary: many-to-many).
export const BOOKABLE = STAFF.map((s) => ({ name: s.name, role: s.role, for: s.role === 'Notary' ? ['signing', 'consultation'] : ['consultation'] }))

export const INTEGRATIONS = [
  { key: 'm365', name: 'Microsoft 365 (Outlook + Teams)', status: 'Connected', desc: 'Calendar availability, Teams meeting links, sending email.' },
  { key: 'esign', name: 'E-signature (service contracts)', status: 'Connected', desc: 'Signature of service contracts. Provider to be confirmed.' },
  { key: 'idv', name: 'Remote ID verification', status: 'Connected', desc: 'Document reading + face match. Replaces Treefort; vendor to be selected.' },
  { key: 'consigno', name: 'Consigno (Notarius)', status: 'Connected', desc: 'One-click secure sign-in (tunnel) from the file; Nexo tracks signing completion.' },
  { key: 'fax', name: 'eFaxgate (fax to email)', status: 'Connected', desc: 'Incoming faxes are read by AI and routed to the right file, notary and paralegal.' },
  { key: 'procardex', name: 'Procardex', status: 'Manual', desc: 'No API: Nexo prepares a copy-ready summary for entry.' },
  { key: 'registry', name: 'Registre foncier du Québec', status: 'Manual', desc: 'Title search checklist; API availability under review.' },
  { key: 'lender', name: 'Telus Lender Assist / AvisImmo', status: 'Manual', desc: 'Lender instructions recorded in Nexo when received.' },
]

// Incoming faxes (arrive as emails from eFaxgate). AI reads each one, matches it against a lookup table
// (client names, file numbers, lender references) and routes it, or asks reception when unsure.
export const INITIAL_FAXES = [
  { id: 'fx1', received: 'Today 08:05', pages: 3, sender: 'Banque Exemple – Centre hypothécaire', senderFax: '514-555-0199', docType: 'Lender instructions',
    extracted: { client: 'Kevin Morin & Julie Morin', reference: 'Prêt 77-30412', property: '35 rue des Pins' }, confidence: 0.96, status: 'routed', fileId: '26-0421',
    snippet: 'INSTRUCTIONS AU NOTAIRE – Emprunteurs : Kevin Morin, Julie Morin – Montant du prêt : 412 000 $' },
  { id: 'fx2', received: 'Today 09:40', pages: 2, sender: 'Caisse Exemple', senderFax: '450-555-0144', docType: 'Payout statement',
    extracted: { client: 'Robert Simard', reference: 'Compte 4471-22', property: '1200 boul. René-Lévesque' }, confidence: 0.91, status: 'routed', fileId: '26-0418',
    snippet: 'ÉTAT DE COMPTE POUR QUITTANCE – Débiteur : Robert Simard' },
  { id: 'fx3', received: 'Today 10:12', pages: 1, sender: 'Assurances Exemple', senderFax: '514-555-0177', docType: 'Insurance certificate',
    extracted: { client: 'I. Fortin', reference: 'Police HAB-88213', property: 'ch. du Lac' }, confidence: 0.64, status: 'review',
    suggestions: [{ fileId: '26-0423', score: 0.64, why: 'Name "I. Fortin" ≈ Isabelle Fortin; address "ch. du Lac" matches' }, { fileId: '26-0412', score: 0.18, why: 'Same insurer used on this file' }],
    snippet: 'ATTESTATION D’ASSURANCE – Assuré : I. Fortin – Créancier hypothécaire : Banque Exemple' },
  { id: 'fx4', received: 'Today 11:02', pages: 1, sender: 'Unknown sender', senderFax: '819-555-0108', docType: 'Handwritten note',
    extracted: { client: '—', reference: '—', property: '—' }, confidence: 0.12, status: 'review', suggestions: [],
    snippet: '(handwritten) « Merci de rappeler concernant le dossier de ma mère… »' },
]
