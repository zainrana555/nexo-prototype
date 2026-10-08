// Seed data for the Nexo demo. All names, addresses and amounts are fictional sample data.

// `role` is the job title; `access` is the permission role (Settings → Roles & permissions).
export const STAFF = [
  { name: 'Nathalie Roy', role: 'Paralegal', access: 'Paralegal', email: 'nathalie@etude-demo.ca' },
  { name: 'Me Anne Dubois', role: 'Notary', access: 'Owner', email: 'anne@etude-demo.ca' },
  { name: 'Me Paul Lefebvre', role: 'Notary', access: 'Super admin', email: 'paul@etude-demo.ca' },
  { name: 'Me Sophie Gagné', role: 'Notary', access: 'Notary', email: 'sophie@etude-demo.ca' },
  { name: 'Me Marc Tremblay', role: 'Notary', access: 'Notary', email: 'marc@etude-demo.ca' },
  { name: 'Me Julie Bélanger', role: 'Notary', access: 'Notary', email: 'julie@etude-demo.ca' },
  { name: 'Me Éric Lavoie', role: 'Notary', access: 'Notary', email: 'eric@etude-demo.ca' },
  { name: 'Me Nadia Lapointe', role: 'Notary', access: 'Notary', email: 'nadia@etude-demo.ca' },
  { name: 'Karine Ouellet', role: 'Paralegal', access: 'Paralegal', email: 'karine@etude-demo.ca' },
  { name: 'Sarah Pelletier', role: 'Reception', access: 'Reception', email: 'sarah@etude-demo.ca' },
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

// Fee table: published prices (dropdown), per-unit items, options and disbursements. Demo values.
export const INITIAL_FEE_ITEMS = [
  { id: 'base-p-std', kind: 'base', type: 'Purchase', label: 'Purchase with mortgage', amount: 1100, taxable: true },
  { id: 'base-p-cash', kind: 'base', type: 'Purchase', label: 'Purchase without mortgage', amount: 900, taxable: true },
  { id: 'base-p-priv', kind: 'base', type: 'Purchase', label: 'Purchase with private lender', amount: 1400, taxable: true, deposit: true },
  { id: 'base-s-std', kind: 'base', type: 'Sale', label: 'Sale (discharge and adjustments)', amount: 650, taxable: true },
  { id: 'base-r-std', kind: 'base', type: 'Refinance', label: 'Refinance', amount: 900, taxable: true },
  { id: 'base-r-priv', kind: 'base', type: 'Refinance', label: 'Refinance with private lender', amount: 1200, taxable: true, deposit: true },
  { id: 'u-party', kind: 'unit', label: 'Additional party', unit: 'party', amount: 125, taxable: true },
  { id: 'u-discharge', kind: 'unit', label: 'Existing mortgage to discharge', unit: 'mortgage', amount: 300, taxable: true },
  { id: 'o-remote', kind: 'option', label: 'Remote signing (Teams)', amount: 150, taxable: true },
  { id: 'o-rush', kind: 'option', label: 'Rush file (under 5 business days)', amount: 250, taxable: true },
  { id: 'o-corp', kind: 'option', label: 'Corporate client (resolution and verifications)', amount: 200, taxable: true },
  { id: 'd-registry', kind: 'disbursement', label: 'Land registry publication fees', amount: 146, taxable: false },
  { id: 'd-search', kind: 'disbursement', label: 'Searches (index, bankruptcy, certificates)', amount: 79, taxable: true },
  { id: 'd-consigno', kind: 'disbursement', label: 'Consigno signature fees', amount: 8, taxable: true },
]
export const INITIAL_FEE_RULES = [
  { id: 'r1', on: true, when: 'Client is a corporation', then: 'Add "Corporate client"' },
  { id: 'r2', on: true, when: 'Seller declares existing mortgages', then: 'Set "Existing mortgage to discharge" quantity' },
  { id: 'r3', on: true, when: 'Remote signing chosen in questionnaire', then: 'Add "Remote signing (Teams)"' },
  { id: 'r4', on: true, when: 'Private lender', then: 'Require deposit before signing' },
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
    title: { deeds10: false, chain30: false, cadastre: false, index: false, bankruptcy: false, municipalTax: false, schoolTax: false },
    funds: { requested: false, received: false },
    clientType: 'Individual',
    booking: null,
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
  if (upTo > 4) file.title = { deeds10: true, chain30: true, cadastre: true, index: true, bankruptcy: true, municipalTax: true, schoolTax: true }
  if (upTo > 5) file.funds = { requested: true, received: upTo > 6 }
  if (upTo > 5) file.booking = file.booking ?? { mode: 'In person', date: addDays(-3), time: '10:30' }
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
    id: '26-0412', clients: ['Lucas Bergeron', 'Chloé Bergeron'], type: 'Purchase', addr: '4520 av. des Érables', city: 'Montréal',
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
    id: '26-0421', clients: ['Kevin Morin', 'Julie Morin'], type: 'Purchase', addr: '35 rue des Pins', city: 'Brossard', lender: 'Banque Exemple',
    parties: [
      party('Kevin Morin', 'Buyer', [idDoc('Passport', '2030-09-09'), idDoc("Driver's licence", '2027-12-12')], { marital: 'Common-law' }),
      party('Julie Morin', 'Buyer', [idDoc('Passport', '2031-02-02'), idDoc("Driver's licence", '2028-07-07')], { marital: 'Common-law' }),
    ],
    log: log(['2 days ago', 'Service contract signed by all parties']),
  }, 3),
  makeFile({
    id: '26-0423', clients: ['Isabelle Fortin'], type: 'Purchase', addr: '980 ch. du Lac', city: 'Laval', closingDate: addDays(2),
    booking: { mode: 'In person', date: addDays(2), time: '10:30' },
    parties: [party('Isabelle Fortin', 'Buyer', [idDoc('Passport', '2033-01-01'), idDoc("Driver's licence", '2029-01-01')], { marital: 'Single' })],
    log: log(['Yesterday', 'Client booked signing (in person)']),
  }, 6),
  makeFile({
    id: '26-0426', clients: ['Daniel Roy'], type: 'Refinance', addr: '15 rue King', city: 'Sherbrooke', closingDate: addDays(-2),
    parties: [party('Daniel Roy', 'Borrower', [idDoc('Passport', '2030-05-05'), idDoc("Driver's licence", '2027-05-05')])],
    log: log(['Yesterday', 'Final documents published to client portal', 'Nathalie Roy']),
  }, 8),
  makeFile({
    id: '26-0429', clients: ['Mélanie Pelletier'], type: 'Sale', addr: '210 rue Principale', city: 'Gatineau', closingDate: addDays(-6),
    parties: [party('Mélanie Pelletier', 'Seller', [idDoc('Passport', '2031-11-11'), idDoc("Driver's licence", '2028-11-11')], { marital: 'Single' })],
    log: log(['3 days ago', 'File closed and archived', 'Nathalie Roy']),
  }, 9),
]

// The demo lead is the one the guided journey follows.
export const INITIAL_LEADS = [
  {
    id: DEMO_LEAD, isDemo: true, name: 'Émilie Gagnon', email: 'emilie.gagnon@exemple.ca', phone: '514-555-0142', source: 'Email',
    type: 'Purchase', property: '1450 rue Sherbrooke E., app. 302, Montréal', closingDate: addDays(35), lang: 'FR', status: 'New', received: 'Today 08:41',
    message: 'Bonjour, nous avons une promesse d’achat acceptée pour un condo à Montréal. Quels sont vos honoraires et vos délais? La signature est prévue dans environ 5 semaines. Merci! — Émilie',
    log: [{ t: 'Today 08:41', e: 'Inquiry received by email', who: 'System' }, { t: 'Today 08:41', e: 'Automation: acknowledgement sent by email + SMS', who: 'System' }],
  },
  {
    id: 'L-1045', name: 'Thomas Nguyen', email: 't.nguyen@exemple.ca', phone: '514-555-0166', source: 'AI phone agent', type: 'Purchase',
    property: 'Condo, Rosemont, Montréal', closingDate: addDays(45), lang: 'FR', status: 'New', received: 'Today 09:12', callMinutes: 4.2,
    message: 'Résumé de l’appel (agent IA) : premier achat d’un condo à Rosemont, offre acceptée, signature prévue vers le début décembre. Demande une estimation des honoraires et si la signature à distance est possible. Préfère le français. Rappeler en après-midi.',
    transcript: [
      ['Agent IA', 'Étude Dubois Notaires, bonjour! Je suis l’assistante virtuelle. Comment puis-je vous aider?'],
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
    id: 'L-1043', name: 'Olivier Martin', email: 'o.martin@exemple.ca', phone: '438-555-0177', source: 'Website form', type: 'Sale',
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
  { id: 't1', group: 'Leads', name: 'Mini-mandate · Buyer', subject: { FR: 'Votre soumission – achat – {{adresse}}', EN: 'Your quote – purchase – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nMerci de votre demande. Pour votre achat, nos honoraires sont de {{total}} (taxes et débours inclus).\n\nDocuments requis :\n• Deux pièces d’identité avec photo\n• Votre adresse actuelle et votre état civil\n• Les coordonnées du vendeur\n\nPour accepter et ouvrir votre dossier : {{lien}}\n\n{{signature}}', EN: 'Hello {{client}},\n\nThank you for your inquiry. For your purchase, our fees are {{total}} (taxes and disbursements included).\n\nRequired documents:\n• Two photo IDs\n• Your current address and marital status\n• The seller’s details\n\nTo accept and open your file: {{link}}\n\n{{signature}}' } },
  { id: 't2', group: 'Leads', name: 'Mini-mandate · Seller', subject: { FR: 'Votre soumission – vente – {{adresse}}', EN: 'Your quote – sale – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nPour votre vente, nos honoraires sont de {{total}}…', EN: 'Hello {{client}},\n\nFor your sale, our fees are {{total}}…' } },
  { id: 't3', group: 'Leads', name: 'Mini-mandate · Refinance', subject: { FR: 'Votre soumission – refinancement – {{adresse}}', EN: 'Your quote – refinance – {{address}}' }, body: { FR: 'Bonjour {{client}},\n\nPour votre refinancement, nos honoraires sont de {{total}}…', EN: 'Hello {{client}},\n\nFor your refinance, our fees are {{total}}…' } },
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
