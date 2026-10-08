// Acoca Notaires' own material, taken from the documents the firm sent (fee table, service contracts,
// checklists, file sheet, explanatory guides). Staff and client names elsewhere in the demo stay fictional.

export const FIRM = {
  name: 'Acoca Notaires inc.',
  short: 'Acoca Notaires',
  tagline: { fr: 'Notaires et conseillers juridiques', en: 'Notaries & legal advisors' },
  address: '700 Av. Sainte-Croix, Montréal (Saint-Laurent), Québec, H4L 3Y3',
  addressShort: '700 Av. Sainte-Croix, Saint-Laurent',
  phone: '514 748-6539',
  fax: '514 748-5495',
  // Shown on every client email, as in the firm's signature.
  fraud: {
    fr: 'Avis important : notre étude ne vous transmettra jamais ses informations bancaires par courriel pour un virement. En cas de doute, appelez-nous avant tout transfert.',
    en: 'Important notice: our office will never send banking information by email for a wire transfer. If in doubt, call us before sending any funds.',
  },
}

export const VIRTUAL_BANKS = ['EQB', 'Manuvie', 'Computershare', 'CHIP', 'Haventree']
export const PRIVATE_LENDERS = ['PADS', 'Credit Transit', 'Neighbourhood', 'Olympia', 'Capital Express', 'Secure Capital', 'C1', 'Fondclair', 'Belabri']

// Practice areas (lead "service").
export const SERVICES = ['Real estate', 'Wills & mandates', 'Successions', 'Homologation', 'Will search']

// File types. `lender`: the file waits for lender instructions. `twoMeetings`: mortgage signing, then sale.
export const FILE_TYPES = {
  Purchase: { service: 'Real estate', lender: true, twoMeetings: true, checklist: 'pretVente', contract: 'buyer', fr: 'Achat avec hypothèque' },
  'Cash purchase': { service: 'Real estate', lender: false, checklist: 'venteCash', contract: 'buyerCash', fr: 'Achat sans hypothèque' },
  Sale: { service: 'Real estate', lender: false, checklist: 'venteCash', contract: 'seller', fr: 'Vente' },
  Refinance: { service: 'Real estate', lender: true, checklist: 'refi', contract: 'refi', fr: 'Refinancement' },
  Discharge: { service: 'Real estate', lender: false, checklist: 'quittance', contract: 'discharge', fr: 'Quittance' },
  Succession: { service: 'Successions', lender: false, checklist: 'succession', contract: 'succession', fr: 'Succession' },
  'Wills & mandates': { service: 'Wills & mandates', lender: false, checklist: 'wills', contract: 'wills', fr: 'Testament et mandat' },
}
export const fileType = (t) => FILE_TYPES[t] ?? FILE_TYPES.Purchase

// ---- Fee table (Acoca_Notaires_Honoraires_Tableaux). "++" = plus taxes and disbursements.
const B = (id, category, property, transaction, amount, extra = {}) => ({ id, kind: 'base', category, property, transaction, label: `${property} · ${transaction}`, amount, taxable: true, ...extra })
export const INITIAL_FEE_ITEMS = [
  B('res-condo-pv', 'Residential', 'Condo', 'Purchase / Sale', 3500),
  B('res-condo-cash', 'Residential', 'Condo', 'Cash sale', 2000),
  B('res-condo-refi', 'Residential', 'Condo', 'Refinance', 2500),
  B('res-house-pv', 'Residential', 'House', 'Purchase / Sale', 2800),
  B('res-house-cash', 'Residential', 'House', 'Cash sale', 2000),
  B('res-house-refi', 'Residential', 'House', 'Refinance (conventional bank)', 2000),
  B('res-2m', 'Residential', 'House > $2,000,000', 'Purchase / Sale', 3500),
  B('res-3m', 'Residential', 'House > $3,000,000', 'Purchase / Sale', 4000),
  B('vb-pv', 'Virtual bank', 'Residential', 'Purchase / Sale', 3200, { note: VIRTUAL_BANKS.join(', ') }),
  B('vb-refi', 'Virtual bank', 'Residential', 'Refinance', 2850, { note: VIRTUAL_BANKS.join(', ') }),
  B('multi-6-pv', 'Multi-residential', '6 units or fewer', 'Purchase / Sale', 3300),
  B('multi-6-refi', 'Multi-residential', '6 units or fewer', 'Refinance', 2800),
  B('multi-7-pv', 'Multi-residential', 'More than 6 units', 'Purchase / Sale', 4500),
  B('multi-7-refi', 'Multi-residential', 'More than 6 units', 'Refinance', 3500),
  B('com-pv', 'Commercial', 'Commercial', 'Purchase / Sale', 5000),
  B('com-refi', 'Commercial', 'Commercial', 'Refinance', 3500),
  B('pl-hypo', 'Private lender', 'Mortgage', '1st or 2nd rank', 2000, { deposit: true, note: PRIVATE_LENDERS.join(', ') }),
  B('pl-pv', 'Private lender', 'Residential', 'Purchase / Sale with private lender', 3000, { deposit: true }),
  B('pl-nh', 'Private lender', 'Mortgage with discharge', 'Special price (Neighbourhood)', 2450, { deposit: true }),
  B('dis-quittance', 'Private lender', 'Discharge', 'Quittance', 850),
  B('dis-rdprm', 'Private lender', 'Movable radiation', 'RDPRM', 250),
  B('w-simple1', 'Wills', 'Simple will', '1 person', 650),
  B('w-simple2', 'Wills', 'Simple will', 'Couple', 1200),
  B('w-trust', 'Wills', 'Trust will', 'From', 1500),
  B('w-post', 'Wills', 'Post-admin will', 'From', 850),
  B('w-complex', 'Wills', 'Complex will', '$250/hour (approx.)', 2500),
  B('w-codicil', 'Wills', 'Codicil', 'Minimum', 400),
  B('m-simple1', 'Mandates', 'Simple protection mandate', '1 person', 650),
  B('m-simple2', 'Mandates', 'Simple protection mandate', 'Couple', 1150),
  B('m-poa', 'Mandates', 'General power of attorney', '—', 550),
  B('m-poa-mandate', 'Mandates', 'Power of attorney + protection mandate', '—', 850),
  B('pk-1', 'Packages', 'Will + simple mandate', '1 person', 1200),
  B('pk-2', 'Packages', 'Wills + simple mandates', 'Couple', 2300),
  B('s-heredity', 'Successions', 'Declaration of heredity', '—', 1500),
  B('s-transmission', 'Successions', 'Declaration of transmission', '—', 1500),
  B('s-renunciation', 'Successions', 'Renunciation', '—', 1000),
  B('s-search', 'Successions', 'Will search', '—', 450, { deposit: true }),
  B('s-homologation', 'Successions', 'Homologation of protection mandate', '—', 3500),
  { id: 'u-radiation', kind: 'unit', label: 'Additional radiation', unit: 'radiation', amount: 101, taxable: true },
  { id: 'u-party', kind: 'unit', label: 'Additional party', unit: 'party', amount: 0, taxable: true },
  { id: 'o-rush', kind: 'option', label: 'Rush fees', amount: 500, taxable: true },
  { id: 'o-resolution', kind: 'option', label: 'Resolution (corporation)', amount: 100, taxable: true },
  { id: 'o-title', kind: 'option', label: 'Title insurance', amount: 100, taxable: true },
  { id: 'o-copy', kind: 'option', label: 'Certified copy', amount: 125, taxable: true },
  { id: 'o-rad-res', kind: 'option', label: 'Radiation, residential ≥ $1,000,000', amount: 1000, taxable: true },
  { id: 'o-rad-com', kind: 'option', label: 'Radiation, commercial ≥ $1,000,000', amount: 1500, taxable: true },
  { id: 'o-remote', kind: 'option', label: 'Remote signing (Teams)', amount: 0, taxable: true },
]

// Pick the published price matching a file or lead.
export function matchBase(items, { type, propertyType = 'Condo', lenderType = 'Conventional', service } = {}) {
  const find = (id) => items.find((i) => i.id === id)?.id
  if (service === 'Wills & mandates') return find('pk-1')
  if (service === 'Successions' || type === 'Succession') return find('s-heredity')
  if (service === 'Homologation') return find('s-homologation')
  if (service === 'Will search') return find('s-search')
  if (type === 'Discharge') return find('dis-quittance')
  if (lenderType === 'Private lender') return find(type === 'Refinance' ? 'pl-hypo' : 'pl-pv')
  if (propertyType === 'Commercial') return find(type === 'Refinance' ? 'com-refi' : 'com-pv')
  if (propertyType?.startsWith('Multi')) return find(type === 'Refinance' ? (propertyType.includes('>') ? 'multi-7-refi' : 'multi-6-refi') : (propertyType.includes('>') ? 'multi-7-pv' : 'multi-6-pv'))
  if (lenderType === 'Virtual bank') return find(type === 'Refinance' ? 'vb-refi' : 'vb-pv')
  const house = propertyType === 'House'
  if (type === 'Refinance') return find(house ? 'res-house-refi' : 'res-condo-refi')
  if (type === 'Cash purchase') return find(house ? 'res-house-cash' : 'res-condo-cash')
  return find(house ? 'res-house-pv' : 'res-condo-pv')
}
export const PROPERTY_TYPES = ['Condo', 'House', 'Multi ≤ 6 units', 'Multi > 6 units', 'Commercial']
export const LENDER_TYPES = ['Conventional', 'Virtual bank', 'Private lender', 'No mortgage']

// ---- Disbursements per contract (from the service contracts). nt = non-taxable, t = taxable.
const nt = (fr, en, amount) => ({ fr, en, amount, taxable: false })
const tx = (fr, en, amount) => ({ fr, en, amount, taxable: true })
export const DISBURSEMENTS = {
  buyer: [
    nt('Publication de l’hypothèque au Registre foncier du Québec', 'Publication of the mortgage at the Quebec Land Registry', 181),
    nt('Publication de l’acte de vente au Registre foncier du Québec', 'Publication of the deed of sale at the Quebec Land Registry', 131),
    tx('Acceptation du dossier par l’institution financière via Telus Assyst Immobilier', 'File acceptance by the lender via Telus Assyst Real Estate', 61),
    tx('Publication de l’hypothèque en ligne (Pro-Cardex)', 'Online publication of the mortgage (Pro-Cardex)', 4.75),
    tx('Publication de la vente en ligne (Pro-Cardex)', 'Online publication of the sale (Pro-Cardex)', 4.75),
    tx('Notarius (2 × 4,50 $)', 'Notarius (2 × $4.50)', 9),
    tx('Consigno (3 × 2,25 $)', 'Consigno (3 × $2.25)', 6.75),
  ],
  buyerCash: [
    nt('Publication de l’acte de vente au Registre foncier du Québec', 'Publication of the deed of sale at the Quebec Land Registry', 131),
    tx('Publication de la vente en ligne (Pro-Cardex)', 'Online publication of the sale (Pro-Cardex)', 4.75),
    tx('Notarius', 'Notarius', 4.5),
    tx('Consigno (2 × 2,25 $)', 'Consigno (2 × $2.25)', 4.5),
  ],
  seller: [
    nt('Publication de la mainlevée au Registre foncier du Québec', 'Publication of the release at the Quebec Land Registry', 153),
    nt('Recherche sur les titres au Registre foncier du Québec', 'Title search at the Quebec Land Registry', 75),
    nt('Recherche au RDPRM', 'RDPRM search', 11),
    nt('Confirmation de paiement des taxes municipales', 'Municipal tax payment confirmation', 7.5),
    tx('Confirmation de paiement des taxes scolaires', 'School tax payment confirmation', 25),
    tx('Relevé hypothécaire détaillé via Telus Assyst Immobilier', 'Detailed mortgage statement via Telus Assyst Real Estate', 10),
    tx('Publication de la quittance en ligne (Pro-Cardex 4,75 $ + Notarius 2,25 $)', 'Online publication of the discharge (Pro-Cardex $4.75 + Notarius $2.25)', 7),
    tx('Timbres', 'Stamps', 5),
  ],
  refi: [
    nt('Publication de l’hypothèque au Registre foncier du Québec', 'Publication of the mortgage at the Quebec Land Registry', 174),
    nt('Publication de la quittance au Registre foncier du Québec', 'Publication of the discharge at the Quebec Land Registry', 143),
    nt('Obtention d’index aux immeubles', 'Index of immovables', 75),
    nt('Vérification au Bureau du surintendant des faillites', 'Bankruptcy search (Superintendent of Bankruptcy)', 8),
    nt('Obtention des taxes municipales', 'Municipal taxes', 7),
    nt('Recherche au RDPRM', 'RDPRM search', 10),
    tx('Relevé de taxes scolaires', 'School tax statement', 17.4),
    tx('Publication de l’hypothèque en ligne (Pro-Cardex 4,75 $ + Notarius 2,25 $)', 'Online publication of the mortgage (Pro-Cardex $4.75 + Notarius $2.25)', 7),
  ],
  discharge: [
    nt('Publication de la quittance au Registre foncier du Québec', 'Publication of the discharge at the Quebec Land Registry', 143),
    nt('Recherche au RDPRM', 'RDPRM search', 10),
    tx('Relevé hypothécaire détaillé via Telus Assyst Immobilier', 'Detailed mortgage statement via Telus Assyst', 10),
    tx('Publication en ligne (Pro-Cardex + Notarius)', 'Online publication (Pro-Cardex + Notarius)', 7),
  ],
  succession: [
    nt('Publication de la déclaration de transmission au Registre foncier', 'Publication of the declaration of transmission', 127),
    nt('Publication de la déclaration d’hérédité', 'Publication of the declaration of heredity', 127),
    nt('Publication de la renonciation in favorem', 'Publication of the renunciation in favorem', 127),
    nt('Obtention d’index aux immeubles', 'Index of immovables', 20),
    nt('Inscription au RDPRM', 'RDPRM registration', 43),
    tx('Recherche testamentaire à la Chambre des notaires', 'Will search at the Chambre des notaires', 15),
    tx('Recherche testamentaire au Barreau du Québec', 'Will search at the Barreau du Québec', 15),
    tx('Publication en ligne (Pro-Cardex 4,95 $ + Notarius 2,25 $)', 'Online publication (Pro-Cardex $4.95 + Notarius $2.25)', 7.2),
  ],
  wills: [
    nt('Inscription au registre des testaments et mandats', 'Registration in the wills and mandates registry', 30),
  ],
}

// ---- Service contract variants (the firm's 13 Word templates collapse into these).
export const CONTRACTS = {
  buyer: {
    name: 'Buyer(s) – purchase with mortgage', files: 'CS - Acheteur(s) · CS - Purchaser', payer: 'buyer',
    services: {
      fr: ['Réception des documents', 'Ouverture de dossier', 'Vérification de l’état civil des vendeurs et des acheteurs', 'Vérification minutieuse des titres pour assurer un bon et valable titre de propriété', 'Réception et vérification d’une note de couverture d’assurance', 'Obtention des fonds requis à la transaction', 'Vérification des documents requis pour les ajustements', 'Vérification des taxes municipales et scolaires', 'Préparation de l’acte d’hypothèque et de l’acte de vente', 'Préparation du mémoire des répartitions et d’un état de déboursés', '1re rencontre pour la signature de l’acte d’hypothèque', 'Réception et vérification de la police d’assurance habitation', 'Réception de la mise de fonds', 'Inscription de l’acte d’hypothèque au registre foncier', '2e rencontre pour la signature de l’acte de vente', 'Inscription de l’acte de vente au registre foncier', 'Copies conformes des actes', 'Rapport final pour l’institution financière', 'Copies, correspondance, appels'],
      en: ['Receipt of documents', 'File opening', 'Verification of the civil status of the sellers and buyers', 'Thorough title examination to ensure good and valid title', 'Receipt and verification of an insurance cover note', 'Obtaining the funds required for the transaction', 'Verification of documents required for adjustments', 'Verification of municipal and school taxes', 'Preparation of the mortgage deed and the deed of sale', 'Preparation of the statement of adjustments and disbursements', '1st meeting: signing of the mortgage deed', 'Receipt and verification of the home insurance policy', 'Receipt of the down payment', 'Registration of the mortgage deed at the Land Registry', '2nd meeting: signing of the deed of sale', 'Registration of the deed of sale at the Land Registry', 'Certified copies of the deeds', 'Final report to the financial institution', 'Copies, correspondence, calls'],
    },
    payment: { fr: 'et devra être remise en même temps que la mise de fonds.', en: 'and must be remitted together with the down payment.' },
  },
  buyerCash: {
    name: 'Buyer(s) – purchase without mortgage', files: 'CS - Acheteurs (sans hypo)', payer: 'buyer',
    services: {
      fr: ['Réception des documents', 'Ouverture de dossier', 'Vérification de l’état civil', 'Vérification minutieuse des titres', 'Vérification des taxes municipales et scolaires', 'Préparation de l’acte de vente', 'Préparation du mémoire des répartitions et d’un état de déboursés', 'Réception des fonds', 'Rencontre pour la signature de l’acte de vente', 'Inscription de l’acte de vente au registre foncier', 'Copies, correspondance, appels'],
      en: ['Receipt of documents', 'File opening', 'Civil status verification', 'Thorough title examination', 'Verification of municipal and school taxes', 'Preparation of the deed of sale', 'Preparation of adjustments and disbursements', 'Receipt of funds', 'Meeting to sign the deed of sale', 'Registration of the deed of sale', 'Copies, correspondence, calls'],
    },
    payment: { fr: 'et devra être remise en même temps que les fonds.', en: 'and must be remitted together with the funds.' },
  },
  seller: {
    name: 'Seller(s) – sale with discharge', files: 'CS - Vendeur(s) · CS - Vendor', payer: 'seller',
    services: {
      fr: ['Obtention d’une quittance ou mainlevée pour la radiation de l’hypothèque', 'Communication avec l’institution financière', 'Obtention d’un relevé hypothécaire détaillé', 'Rédaction et préparation de la quittance ou mainlevée', 'Transmission du chèque de remboursement et de la quittance', 'Publication de la quittance au Registre foncier du Québec', 'Obtention des documents pour la recherche de titres', 'Obtention des confirmations de paiement (taxes, frais de condo)', 'Vérification des documents requis pour les ajustements', 'Rendez-vous pour la signature de l’acte de vente', 'Émission du chèque', 'Copie de la quittance publiée', 'Copies, correspondance, appels'],
      en: ['Obtaining a discharge or release of the mortgage', 'Communication with the financial institution', 'Obtaining a detailed mortgage statement', 'Drafting the discharge or release', 'Sending the repayment cheque and the discharge', 'Publication of the discharge at the Quebec Land Registry', 'Obtaining documents for the title search', 'Obtaining payment confirmations (taxes, condo fees)', 'Verification of documents required for adjustments', 'Appointment to sign the deed of sale', 'Issuing the cheque', 'Copy of the published discharge', 'Copies, correspondence, calls'],
    },
    payment: { fr: 'et sera payée à même le produit de la vente (suite à la publication de l’acte de vente).', en: 'and will be paid from the proceeds of the sale (after publication of the deed of sale).' },
  },
  refi: {
    name: 'Refinance', files: 'CS - Refin(fr) · CS - Refin(ang) · LA - REFINANCING', payer: 'borrower',
    services: {
      fr: ['Réception des documents', 'Ouverture de dossier', 'Vérification des titres et des baux', 'Vérification du certificat de localisation', 'Préparation de l’acte d’hypothèque', 'Préparation de la documentation spécifique à la banque', 'Rencontre pour la signature de l’acte d’hypothèque', 'Vérification des taxes municipales et scolaires', 'Obtention du relevé de compte du créancier à rembourser', 'Préparation et publication de la quittance', 'Inscription de l’acte d’hypothèque au registre foncier', 'Réception de l’état des avances et état des déboursés', 'Rapport final pour l’institution financière', 'Copies, correspondance, appels'],
      en: ['Receipt of documents', 'File opening', 'Verification of titles and leases', 'Verification of the certificate of location', 'Preparation of the mortgage deed', 'Preparation of bank-specific documentation', 'Meeting to sign the mortgage deed', 'Verification of municipal and school taxes', 'Obtaining the statement from the creditor to be repaid', 'Preparation and publication of the discharge', 'Registration of the mortgage deed', 'Statement of advances and disbursements', 'Final report to the financial institution', 'Copies, correspondence, calls'],
    },
    payment: { fr: 'et sera payée à même le produit du financement.', en: 'and will be paid from the proceeds of the financing.' },
  },
  discharge: {
    name: 'Discharge only', files: 'CS - Contrat de service 1 seul emprunteur', payer: 'borrower',
    services: { fr: ['Communication avec le créancier', 'Relevé hypothécaire détaillé', 'Préparation de la quittance', 'Publication de la quittance', 'Copies, correspondance, appels'], en: ['Communication with the creditor', 'Detailed mortgage statement', 'Preparation of the discharge', 'Publication of the discharge', 'Copies, correspondence, calls'] },
    payment: { fr: 'et sera payée avant la publication.', en: 'and will be paid before publication.' },
  },
  succession: {
    name: 'Succession', files: 'CS - succession · CS - succession (ang)', payer: 'heir',
    services: {
      fr: ['Réception des documents', 'Ouverture de dossier', 'Recherche testamentaire Chambre des notaires du Québec', 'Recherche testamentaire Barreau du Québec', 'Désignation de liquidateur', 'Publication de la désignation au RDPRM', 'Déclaration d’hérédité', 'Renonciation in favorem', 'Déclaration de transmission', 'Copies, correspondance, appels'],
      en: ['Receipt of documents', 'File opening', 'Will search at the Chambre des notaires', 'Will search at the Barreau du Québec', 'Designation of liquidator', 'Publication of the designation at the RDPRM', 'Declaration of heredity', 'Renunciation in favorem', 'Declaration of transmission', 'Copies, correspondence, calls'],
    },
    payment: { fr: '.', en: '.' },
  },
  wills: {
    name: 'Wills & protection mandates', files: '(new)', payer: 'client',
    services: { fr: ['Rencontre initiale', 'Rédaction du testament et du mandat de protection', 'Rencontre de signature', 'Inscription aux registres'], en: ['Initial meeting', 'Drafting of the will and protection mandate', 'Signing meeting', 'Registration in the registries'] },
    payment: { fr: '. Les frais de consultation initiale de 250 $ sont crédités.', en: '. The $250 initial consultation fee is credited.' },
  },
}
export const CONTRACT_CLAUSES = {
  fr: [
    'Toute démarche additionnelle nécessitant un travail supplémentaire hors du cours normal (problèmes de titres, non-conformité à un règlement municipal, etc.) sera facturée en sus.',
    'Toute facturation d’honoraires est payable dans les trente (30) jours de son émission. Après ce délai, tout solde impayé portera intérêt au taux de 18 % l’an.',
    'Advenant le retrait du mandat avant son exécution, les honoraires et déboursés engagés à cette date demeurent payables.',
    'Frais supplémentaires possibles : procuration, déplacement, report de date, arrérages à payer (25 $ + taxes), envoi d’un chèque à un tiers (25 $ + taxes, messager 10 $), assurance-titres (75 $ + taxes + prime), transfert électronique vers un autre notaire (150 $ + taxes), retenue en fidéicommis (à partir de 250 $ + taxes).',
    'La notaire peut déléguer le mandat ou être assistée par un autre notaire, stagiaire ou employé de l’étude.',
    'En cas de signature électronique des actes, l’adresse courriel sera partagée avec toutes les parties signataires.',
  ],
  en: [
    'Any additional work outside the normal course of a file (title problems, municipal non-compliance, etc.) will be billed separately.',
    'All fees are payable within thirty (30) days. Any unpaid balance bears interest at 18% per year after that.',
    'If the mandate is withdrawn before completion, fees and disbursements incurred to that date remain payable.',
    'Possible extra fees: power of attorney, travel, postponement, arrears payment (25 $ + tax), cheque to a third party (25 $ + tax, courier 10 $), title insurance (75 $ + tax + premium), electronic transfer to another notary (150 $ + tax), trust holdback (from 250 $ + tax).',
    'The notary may delegate the mandate or be assisted by another notary, articling student or employee of the firm.',
    'If deeds are signed electronically, the email address will be shared with all signing parties.',
  ],
}

// ---- Checklists (CheckList pour Dossier.xlsx). dd = due-diligence item that gates the "title" stage.
// auto = ticked automatically from what Nexo already knows.
const C = (id, label, section, extra = {}) => ({ id, label, section, ...extra })
const PREP = 'Préparation'
const PUB = 'Actes et publication'
const SEND = 'Après signature – à transmettre'
const SCAN = 'Après signature – à numériser'
const common = [
  C('cs', 'Contrats de service transmis-signés', PREP, { auto: 'contract' }),
  C('minutes', 'Livre de minutes demandé-obtenu (si société)', PREP),
  C('ids', 'ID des parties · contrat de mariage · certificat · jugement de divorce', PREP, { auto: 'ids' }),
  C('fiche', 'Compléter fiches clients (+ Procardex)', PREP),
  C('titles', 'Recherche titres et REQ pertinents (société / syndicat)', PREP, { dd: true }),
  C('radiations', 'Radiation(s) inscrite(s) au tableau', PREP),
  C('taxMun', 'Taxes municipales', PREP, { dd: true }),
  C('taxSchool', 'Taxes scolaires', PREP, { dd: true }),
  C('condo', 'Infos condo demandées - obtenues', PREP),
  C('col', 'Certificat de localisation obtenu ou commandé (irrégularités, affidavit)', PREP, { dd: true }),
]
const tail = [
  C('rdprm', 'RDPRM – recherches complétées', PREP, { dd: true }),
  C('bankruptcy', 'Recherches de faillite (EQB)', PREP, { dd: true }),
  C('mandateLimit', 'Limitation de mandat', PREP),
  C('appts', 'Rendez-vous confirmés', PREP, { auto: 'booking' }),
  C('docsBefore', 'Documents de la transaction avant la rencontre', PREP),
  C('letters', 'Lettres préparées', PREP),
]
export const CHECKLISTS = {
  pretVente: { name: 'Liste de contrôle – PRÊT/VENTE', items: [
    ...common, C('promise', 'Promesse d’achat', PREP), C('rentRoll', 'Loyers – rent roll', PREP), C('hydro', 'Demande Hydro et Énergir', PREP),
    C('hypo', 'Hypothèque préparée', PUB), C('hypoPub', 'Publication de l’hypothèque', PUB), C('sale', 'Vente préparée', PUB), C('salePub', 'Publication de la vente', PUB),
    C('payout', 'Quittance – relevé demandé et obtenu', PUB), C('discharge', 'Quittance préparée', PUB), C('resolutions', 'Résolutions préparées', PUB),
    C('titleIns', 'Assurance titres', PUB), C('homeIns', 'Assurance habitation', PUB, { auto: 'insurance' }), C('rdprmForm', 'RDPRM – formulaire préparé (Pub - Rv)', PUB),
    C('adjust', 'Ajustements finalisés', PUB), C('invBuyer', 'Facture acquéreur', PUB), C('invSeller', 'Facture vendeur', PUB), C('invAgent', 'Facture agent immobilier', PUB), C('invBroker', 'Facture courtier hypothécaire', PUB),
    C('prelim', 'Rapport préliminaire préparé - transmis', PUB), C('funds', 'Fonds demandés au client et PROVENANCE', PUB, { auto: 'funds' }), C('rfForms', 'Formulaires Registre foncier', PUB), C('finalReport', 'Rapport final préparé - transmis', PUB),
    ...tail,
    C('repay', 'Remboursement au créancier', SEND), C('dischargeBank', 'Quittance à la banque (RBC/CIBC : retenue 250 $)', SEND), C('addrNotice', 'Avis d’adresse vendeur ou acquéreurs', SEND),
    C('scanHypo', 'Hypothèque', SCAN), C('scanSchl', 'SCHL en gris PDF/A', SCAN), C('scanSale', 'Vente', SCAN), C('scanDischarge', 'Quittance / ML en minute', SCAN),
  ] },
  venteCash: { name: 'Liste de contrôle – VENTE', items: [
    ...common, C('promise', 'Promesse d’achat', PREP), C('rentRoll', 'Loyers – rent roll', PREP), C('hydro', 'Demande Hydro et Énergir', PREP),
    C('sale', 'Vente préparée', PUB), C('salePub', 'Publication de la vente', PUB), C('payout', 'Quittance – relevé demandé et obtenu', PUB), C('discharge', 'Quittance préparée', PUB),
    C('titleIns', 'Assurance titres', PUB), C('homeIns', 'Assurance habitation', PUB, { auto: 'insurance' }), C('adjust', 'Ajustements finalisés', PUB),
    C('invBuyer', 'Facture acquéreur(s)', PUB), C('invSeller', 'Facture vendeur(s)', PUB), C('invAgent', 'Facture agent immobilier', PUB), C('funds', 'Fonds demandés au client et PROVENANCE', PUB, { auto: 'funds' }),
    ...tail,
    C('repay', 'Remboursement au créancier', SEND), C('dischargeBank', 'Quittance à la banque', SEND), C('addrNotice', 'Avis d’adresse', SEND),
    C('scanSale', 'Vente', SCAN), C('scanDischarge', 'Quittance / ML en minute', SCAN),
  ] },
  refi: { name: 'Liste de contrôle – Refinancement', items: [
    ...common,
    C('hypo', 'Hypothèque préparée', PUB), C('hypoPub', 'Publication de l’hypothèque', PUB), C('eqbApproval', 'Envoyer l’hypothèque pour approbation (EQB)', PUB), C('delegation', 'Obtenir résolution et délégation pour l’hypothèque', PUB),
    C('payout', 'Quittance – relevé demandé et obtenu', PUB), C('discharge', 'Quittance préparée', PUB), C('titleIns', 'Assurance titres', PUB), C('homeIns', 'Assurance habitation OU facture Risk Review', PUB, { auto: 'insurance' }),
    C('invBorrower', 'Facture emprunteur(s)', PUB), C('invBroker', 'Facture courtier hypothécaire', PUB), C('prelim', 'Rapport préliminaire préparé - transmis', PUB), C('eqbDocs', 'Documents spécifiques EQB', PUB), C('finalReport', 'Rapport final préparé - transmis', PUB),
    ...tail,
    C('repay', 'Remboursement au créancier', SEND), C('dischargeBank', 'Quittance à la banque (retenue 250 $)', SEND),
    C('scanHypo', 'Hypothèque', SCAN), C('scanSchl', 'SCHL en gris PDF/A', SCAN), C('scanDischarge', 'Quittance / ML en minute', SCAN),
  ] },
  quittance: { name: 'Liste de contrôle – QUITTANCE', items: [
    ...common, C('payout', 'Quittance – relevé demandé et obtenu', PUB), C('discharge', 'Quittance préparée', PUB), C('invBorrower', 'Facture emprunteur(s)', PUB), C('finalReport', 'Rapport final', PUB),
    ...tail, C('dischargeBank', 'Quittance à la banque / créancier', SEND), C('scanDischarge', 'Quittance / ML en minute', SCAN),
  ] },
  succession: { name: 'Liste de contrôle – SUCCESSION', items: [
    C('cs', 'Contrat de service transmis-signé', PREP, { auto: 'contract' }), C('death', 'Certificat de décès original (DEC)', PREP), C('ids', 'ID du liquidateur et des héritiers', PREP, { auto: 'ids' }),
    C('searchCnq', 'Recherche testamentaire – Chambre des notaires', PREP, { dd: true }), C('searchBarreau', 'Recherche testamentaire – Barreau du Québec', PREP, { dd: true }), C('index', 'Index aux immeubles', PREP, { dd: true }),
    C('liquidator', 'Désignation de liquidateur publiée au RDPRM', PUB), C('heredity', 'Déclaration d’hérédité', PUB), C('renunciation', 'Renonciation in favorem', PUB), C('transmission', 'Déclaration de transmission', PUB),
    C('appts', 'Rendez-vous confirmés', PREP, { auto: 'booking' }),
  ] },
  wills: { name: 'Liste de contrôle – TESTAMENT / MANDAT', items: [
    C('questionnaire', 'Questionnaire reçu', PREP), C('ids', 'Deux pièces d’identité + NAS + état civil', PREP, { auto: 'ids' }), C('consult', 'Rencontre initiale tenue (250 $ crédités)', PREP, { dd: true }),
    C('draft', 'Projet de testament / mandat préparé', PUB), C('appts', 'Rendez-vous de signature confirmé', PREP, { auto: 'booking' }), C('registry', 'Inscription aux registres', SEND),
  ] },
}
export const CHECKLIST_SECTIONS = [PREP, PUB, SEND, SCAN]
// The 24-step procedure sheet, shown as guidance.
export const PROCEDURE = [
  'Ouverture du dossier et fiche client (feuille de contrôle) + ProCardex', 'Contrat de services professionnels', 'Si une partie est une société : REQ et livre de minutes (ou certificat d’attestation, statuts, règlements d’emprunt)',
  'Vérifier le certificat de localisation à jour (limitation de mandat / affidavit) + numériser', 'Sortir tous les index et titres + numériser', 'Taxes municipales et scolaires + saisir dans ProCardex (ajustements, déboursés)',
  'Demander l’état de compte à la banque pour radiation', 'Demande Hydro-Québec', 'Infos condo au syndicat ou gestionnaire', 'RDPRM du vendeur', 'Acte d’hypothèque', 'Acte de vente', 'Quittance',
  'Ajustements et déboursés complétés', 'Résolution si une partie est une société', 'Factures acheteur et vendeur', 'Facture de commission de l’agent', 'Assurance de l’acquéreur',
  'Suivis : états de compte, taxes, infos condo, assurance', 'Limitation de mandat (avis d’adresse, assurance-titre, CL, etc.)', 'Avis d’adresse', 'Confirmer les rendez-vous et envoyer ajustements et déboursés', 'Copies signées', 'Lettres',
]

// ---- Document tracker (Fiche Dossier: "Suivi des documents demandés", Demandé / Reçu).
export const TRACKED_DOCS = [
  { id: 'promise', label: 'Promesse d’achat', from: 'Broker' }, { id: 'payout', label: 'État de compte à rembourser', from: 'Bank' },
  { id: 'fireIns', label: 'Assurance-incendie', from: 'Client' }, { id: 'prelim', label: 'Fonds / rapport préliminaire', from: 'Lender' },
  { id: 'clientFunds', label: 'Fonds du client (+ provenance)', from: 'Client' }, { id: 'commission', label: 'Facture de commission', from: 'Broker' },
  { id: 'gstQst', label: 'TPS-TVQ', from: 'Seller' }, { id: 'utilities', label: 'Gaz Métro & Hydro-Québec', from: 'Seller' },
  { id: 'condoInfo', label: 'Infos condo', from: 'Syndicate' }, { id: 'rents', label: 'Loyers', from: 'Seller' },
  { id: 'minuteBook', label: 'Livre de minutes', from: 'Corporation' }, { id: 'titleIns', label: 'Assurance-titres', from: 'FCT' },
]

// ---- Explanatory guides (attached to every new client email), condensed.
export const GUIDES = {
  buyer: {
    title: { fr: 'Guide de l’acheteur', en: 'Buyer’s guide' },
    sections: {
      fr: [
        ['Choix du notaire', 'Confirmez votre choix de notaire à votre courtier immobilier et à votre institution financière, pour que la promesse d’achat et les instructions hypothécaires nous soient transmises.'],
        ['Deux rendez-vous', '1) La signature de l’acte d’hypothèque, environ une semaine avant la date de clôture. 2) La signature de l’acte de vente, en présence du vendeur. Chaque rencontre dure environ une heure.'],
        ['Mise de fonds', 'Le montant exact vous est transmis quelques jours avant la signature de l’hypothèque. Les fonds sont versés par virement uniquement (aucun chèque), avant ou au premier rendez-vous. Une preuve de la provenance des fonds est exigée.'],
        ['Prévention de la fraude', 'Nos instructions bancaires sont protégées par mot de passe. Ne transférez aucuns fonds avant d’avoir obtenu et confirmé ce mot de passe directement avec un membre de notre étude.'],
        ['Cas particuliers', 'Fonds d’un tiers (parent, conjoint), REER / RAP, fonds de l’étranger, banque virtuelle (délais), mises de fonds inégales entre acheteurs : avisez-nous le plus tôt possible.'],
        ['Assurance habitation', 'Elle doit entrer en vigueur à la date de l’acte de vente. Envoyez-nous la police quelques jours avant.'],
        ['Pièces d’identité', 'Apportez vos pièces originales aux rendez-vous, même si elles ont été transmises électroniquement.'],
      ],
      en: [
        ['Choice of notary', 'Confirm your choice of notary to your broker and your lender so the promise to purchase and mortgage instructions reach us.'],
        ['Two appointments', '1) Signing of the mortgage deed, about one week before closing. 2) Signing of the deed of sale, with the seller. About one hour each.'],
        ['Down payment', 'The exact amount is sent a few days before the mortgage signing. Funds are sent by wire only (no cheques), before or at the first appointment. Proof of the source of funds is required.'],
        ['Fraud prevention', 'Our banking instructions are password-protected. Do not transfer any funds until you have obtained and confirmed the password directly with a member of our office.'],
        ['Special cases', 'Funds from a third party, RRSP / HBP, funds from abroad, virtual banks (delays), unequal contributions between buyers: tell us as early as possible.'],
        ['Home insurance', 'It must take effect on the date of the deed of sale. Send us the policy a few days before.'],
        ['Identification', 'Bring your original IDs to the appointments, even if you sent them electronically.'],
      ],
    },
  },
  seller: {
    title: { fr: 'Guide du vendeur', en: 'Seller’s guide' },
    sections: {
      fr: [
        ['Un rendez-vous', 'En général, un seul rendez-vous est requis pour signer l’acte de vente.'],
        ['Remboursement de votre hypothèque', 'Nous communiquons directement avec votre institution financière; l’hypothèque est remboursée à même le produit de la vente. Des pénalités peuvent s’appliquer.'],
        ['Produit de la vente', 'Il vous est remis après la publication de l’acte de vente au registre foncier, par chèque ou virement (avisez votre adjointe).'],
        ['Assurance', 'Gardez votre assurance habitation jusqu’à la signature et au transfert de possession.'],
        ['Clés et changement d’adresse', 'Attendez la confirmation du notaire avant de remettre les clés. Avisez Hydro-Québec, Énergir, vos institutions, l’ARC et Revenu Québec.'],
        ['Pièces d’identité', 'Apportez vos pièces originales au rendez-vous.'],
      ],
      en: [
        ['One appointment', 'Usually only one appointment is needed to sign the deed of sale.'],
        ['Mortgage repayment', 'We contact your lender directly; the mortgage is repaid from the sale proceeds. Penalties may apply.'],
        ['Sale proceeds', 'Released after the deed of sale is registered, by cheque or wire (tell your legal assistant).'],
        ['Insurance', 'Keep your home insurance until signing and transfer of possession.'],
        ['Keys and change of address', 'Wait for the notary’s confirmation before handing over the keys. Notify Hydro-Québec, Énergir, your institutions, CRA and Revenu Québec.'],
        ['Identification', 'Bring your original IDs to the appointment.'],
      ],
    },
  },
}

// ---- FCT residential title-insurance request (xxxFCT RESIDENTIEL), fields pre-filled from the file.
export const FCT = { to: 'Services de titres FCT – Division résidentielle', email: 'rtis.qc@firstcdn.com', fax: '514-744-8143' }
