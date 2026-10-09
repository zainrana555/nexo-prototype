// Two demo editions: the full scope, and the Core package. Features outside the package are shown locked.
export const EDITIONS = {
  full: { label: 'Full features', short: 'Full features demo', sub: 'Every feature, including Microsoft 365, Outlook and Teams' },
  core: { label: 'Core', short: 'Core demo', sub: 'The Core package; other features are shown locked' },
}

// Feature key → what the Core package uses instead.
export const LOCKED = {
  fax: { title: 'Fax inbox with automatic matching', instead: 'Faxes keep arriving in eFaxgate as today.' },
  automations: { title: 'Automation builder', instead: 'Fixed email reminders are included: questionnaire not completed, contract unsigned after 3 days, missing documents, appointment the day before.' },
  banking: { title: 'Back-office banking view', instead: 'Funds and trust tracking stay in the current accounting tools.' },
  outlook: { title: 'Outlook calendar sync and Teams meetings', instead: 'Core has its own shared Nexo calendar that everyone at the firm can see; appointments are in person.' },
  integrations: { title: 'Third-party integrations', instead: 'Core works on its own: built-in e-signature, Nexo calendar, email notifications. Microsoft 365, Outlook, Teams, Adobe Sign, eFaxgate and text messages are in the full version.' },
  idReading: { title: 'Automatic ID reading', instead: 'Staff check each ID’s expiry date and name by hand, then approve or reject it.' },
  aiReading: { title: 'Automatic reading of requests', instead: 'Staff fill in the service, property and lender type when they open the lead.' },
  consult: { title: 'Consultation booking', instead: 'Consultations are booked by phone or email as today.' },
  customRoles: { title: 'Custom roles', instead: 'The five standard roles are included (Owner, Super admin, Notary, Paralegal, Reception).' },
  firmSignup: { title: 'Workspace for other firms', instead: 'Nexo is set up for Acoca Notaires only.' },
  remoteId: { title: 'Remote ID verification with face match', instead: 'IDs are verified by staff and confirmed in person at the signing.' },
  fundsWorkflow: { title: 'Funds workflow (password-protected instructions, source of funds)', instead: 'A funds request email with the firm’s fraud warning is included; banking instructions are sent as today.' },
  fct: { title: 'FCT title insurance request', instead: 'Title insurance is ordered on the FCT site as today.' },
  estateFiles: { title: 'Discharge, succession and wills & mandates files', instead: 'Core covers purchase, cash purchase, sale and refinance files.' },
}
export const CORE_EXCLUDED_TYPES = ['Discharge', 'Succession', 'Wills & mandates']

export const isCore = (state) => state.edition === 'core'
export const has = (state, key) => !isCore(state) || !LOCKED[key]
