// Seed data for the Nexo demo. All names, addresses and amounts are fictional sample data.

export const STAFF = [
  { name: 'Nathalie Roy', role: 'Paralegal', email: 'nathalie@etude-demo.ca' },
  { name: 'Me Anne Dubois', role: 'Notary', email: 'anne@etude-demo.ca', admin: true },
  { name: 'Me Paul Lefebvre', role: 'Notary', email: 'paul@etude-demo.ca', admin: true },
  { name: 'Me Sophie Gagné', role: 'Notary', email: 'sophie@etude-demo.ca' },
  { name: 'Me Marc Tremblay', role: 'Notary', email: 'marc@etude-demo.ca' },
  { name: 'Me Julie Bélanger', role: 'Notary', email: 'julie@etude-demo.ca' },
  { name: 'Me Éric Lavoie', role: 'Notary', email: 'eric@etude-demo.ca' },
  { name: 'Me Nadia Lapointe', role: 'Notary', email: 'nadia@etude-demo.ca' },
  { name: 'Karine Ouellet', role: 'Paralegal', email: 'karine@etude-demo.ca' },
  { name: 'Sarah Pelletier', role: 'Paralegal', email: 'sarah@etude-demo.ca' },
]
// Only these notaries can assign notaries and paralegals to files.
export const canAssign = (user) => !!STAFF.find((s) => s.name === user?.name)?.admin

// Demo rates: replace with the firm's fee reference table (Settings → Fee table).
export const INITIAL_RATES = {
  Purchase: 1100,
  Sale: 650,
  Refinance: 900,
  perExtraParty: 125,
  remoteSigning: 150,
  rush: 250,
  discharge: 300,
  disbursements: 225,
}
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
    title: { deeds10: false, chain30: false, cadastre: false },
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
  if (upTo > 2) file.contract = { sent: true, signed: true, total: 1612.4, lang: 'FR' }
  if (upTo > 3) file.bankReceived = true
  if (upTo > 4) file.title = { deeds10: true, chain30: true, cadastre: true }
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
    contract: { sent: true, signed: false, total: 912.3, lang: 'FR' },
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
    log: [{ t: 'Today 08:41', e: 'Inquiry received by email', who: 'System' }, { t: 'Today 08:41', e: 'Automation: acknowledgement email sent', who: 'System' }],
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

export const INITIAL_RULES = [
  { id: 1, name: 'Acknowledge new inquiry', when: 'New lead received', then: 'Send acknowledgement email', on: true, runs: 42 },
  { id: 2, name: 'Mini-mandate follow-up', when: 'Mini-mandate not accepted after 2 days', then: 'Send follow-up email (max 2)', on: true, runs: 17 },
  { id: 3, name: 'Open file on acceptance', when: 'Client accepts mini-mandate', then: 'Create file + send questionnaire link', on: true, runs: 23 },
  { id: 4, name: 'Questionnaire reminder', when: 'Questionnaire incomplete after 48h', then: 'Email client reminder (max 3)', on: true, runs: 31 },
  { id: 5, name: 'Escalate to paralegal', when: '3rd reminder unanswered after 2 days', then: 'Create task + flag file', on: true, runs: 6 },
  { id: 6, name: 'ID problem', when: 'ID expired or 2nd ID missing', then: 'Ask client to re-upload + notify staff', on: true, runs: 9 },
  { id: 7, name: 'Contract signature chase', when: 'Service contract unsigned after 3 days', then: 'Resend e-signature link', on: true, runs: 11 },
  { id: 8, name: 'Unlock booking', when: 'Bank instructions received AND contract signed', then: 'Email client the booking link', on: true, runs: 19 },
  { id: 9, name: 'Post-closing delivery', when: 'Final documents published', then: 'Email client secure portal link', on: true, runs: 15 },
  { id: 10, name: 'Appointment reminder', when: 'Appointment in 24 hours', then: 'Email + SMS reminder to client (with Teams link)', on: true, runs: 27 },
  { id: 11, name: 'Outlook changes', when: 'Appointment moved or deleted in Outlook', then: 'Update the file + notify the client', on: true, runs: 4 },
]

export const RULE_TRIGGERS = ['Appointment in 24 hours', 'Appointment moved or deleted in Outlook', 'New lead received', 'Mini-mandate not accepted after 2 days', 'Client accepts mini-mandate', 'Questionnaire incomplete after 48h', 'ID expired or 2nd ID missing', 'Service contract unsigned after 3 days', 'Bank instructions received AND contract signed', 'Closing date in 7 days', 'Final documents published']
export const RULE_ACTIONS = ['Email + SMS reminder to client (with Teams link)', 'Update the file + notify the client', 'Send acknowledgement email', 'Send follow-up email (max 2)', 'Create file + send questionnaire link', 'Email client reminder (max 3)', 'Create task + flag file', 'Resend e-signature link', 'Email client the booking link', 'Notify assigned notary', 'Email client secure portal link']

export const INITIAL_TEMPLATES = [
  { id: 't1', group: 'Leads', name: 'Mini-mandate · Buyer', subject: { FR: 'Votre soumission – achat', EN: 'Your quote – purchase' }, body: { FR: 'Bonjour {{client}},\n\nMerci de votre demande. Pour votre achat, nos honoraires sont de {{total}} (taxes et débours inclus).\n\nDocuments requis :\n• Deux pièces d’identité avec photo\n• Votre adresse actuelle et votre état civil\n• Les coordonnées du vendeur\n\nPour accepter et ouvrir votre dossier : {{lien}}\n\n{{signature}}', EN: 'Hello {{client}},\n\nThank you for your inquiry. For your purchase, our fees are {{total}} (taxes and disbursements included).\n\nRequired documents:\n• Two photo IDs\n• Your current address and marital status\n• The seller’s details\n\nTo accept and open your file: {{link}}\n\n{{signature}}' } },
  { id: 't2', group: 'Leads', name: 'Mini-mandate · Seller', subject: { FR: 'Votre soumission – vente', EN: 'Your quote – sale' }, body: { FR: 'Bonjour {{client}},\n\nPour votre vente, nos honoraires sont de {{total}}…', EN: 'Hello {{client}},\n\nFor your sale, our fees are {{total}}…' } },
  { id: 't3', group: 'Leads', name: 'Mini-mandate · Refinance', subject: { FR: 'Votre soumission – refinancement', EN: 'Your quote – refinance' }, body: { FR: 'Bonjour {{client}},\n\nPour votre refinancement, nos honoraires sont de {{total}}…', EN: 'Hello {{client}},\n\nFor your refinance, our fees are {{total}}…' } },
  { id: 't4', group: 'Files', name: 'Questionnaire invitation', subject: { FR: 'Ouvrez votre dossier en ligne', EN: 'Open your file online' }, body: { FR: 'Bonjour {{client}},\n\nVotre dossier {{dossier}} est ouvert. Remplissez le questionnaire sécurisé : {{lien}}', EN: 'Hello {{client}},\n\nYour file {{file}} is open. Complete the secure questionnaire: {{link}}' } },
  { id: 't5', group: 'Files', name: 'Reminder · Missing documents', subject: { FR: 'Rappel : documents manquants', EN: 'Reminder: missing documents' }, body: { FR: 'Bonjour {{client}},\n\nIl nous manque encore : {{manquants}}.', EN: 'Hello {{client}},\n\nWe are still missing: {{missing}}.' } },
  { id: 't6', group: 'Files', name: 'Service contract for signature', subject: { FR: 'Votre convention de services à signer', EN: 'Your service contract to sign' }, body: { FR: 'Bonjour {{client}},\n\nVeuillez signer votre convention : {{lien}}', EN: 'Hello {{client}},\n\nPlease sign your service contract: {{link}}' } },
  { id: 't7', group: 'Files', name: 'Booking link', subject: { FR: 'Réservez votre signature', EN: 'Book your signing' }, body: { FR: 'Bonjour {{client}},\n\nChoisissez votre rendez-vous : {{lien}}', EN: 'Hello {{client}},\n\nPick your appointment: {{link}}' } },
  { id: 't8', group: 'Files', name: 'Documents ready', subject: { FR: 'Vos documents sont prêts', EN: 'Your documents are ready' }, body: { FR: 'Bonjour {{client}},\n\nVos documents finaux sont disponibles : {{lien}}', EN: 'Hello {{client}},\n\nYour final documents are available: {{link}}' } },
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
  { key: 'consigno', name: 'Consigno (Notarius)', status: 'Manual', desc: 'Final deeds are signed in Consigno; Nexo tracks completion.' },
  { key: 'procardex', name: 'Procardex', status: 'Manual', desc: 'No API: Nexo prepares a copy-ready summary for entry.' },
  { key: 'registry', name: 'Registre foncier du Québec', status: 'Manual', desc: 'Title search checklist; API availability under review.' },
  { key: 'lender', name: 'Telus Lender Assist / AvisImmo', status: 'Manual', desc: 'Lender instructions recorded in Nexo when received.' },
]
