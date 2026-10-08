import { fmtDate } from './logic'
import { OFFICE_ADDRESS } from './availability'

// Client-facing copy, French first (Quebec), English second.
const S = {
  notaries: { fr: 'Notaires', en: 'Notaries' },
  secure: { fr: 'Connexion sécurisée · données hébergées au Canada', en: 'Secure connection · data hosted in Canada' },
  back: { fr: 'Retour', en: 'Back' },
  continue: { fr: 'Enregistrer et continuer', en: 'Save & continue' },
  step: { fr: 'Étape {n} de {total}', en: 'Step {n} of {total}' },
  toFile: { fr: 'Voir mon dossier', en: 'View my file' },
  notYet: { fr: 'Cette étape n’est pas encore disponible.', en: 'This step isn’t available yet.' },
  notYetSub: { fr: 'Vous recevrez un courriel dès qu’elle le sera.', en: 'You’ll get an email as soon as it is.' },

  // Inbox
  inbox: { fr: 'Mes messages', en: 'My messages' },
  inboxEmpty: { fr: 'Sélectionnez un message', en: 'Select a message' },
  inboxHint: { fr: 'Les messages de l’étude arrivent ici, dans votre espace sécurisé. Votre courriel personnel reçoit seulement un avis « nouveau message » avec un lien de connexion.', en: 'Messages from the office arrive here, in your secure space. Your personal email only gets a “new message” notice with a sign-in link.' },
  from: { fr: 'De', en: 'From' },
  to: { fr: 'À', en: 'To' },

  // Mandate
  mTitle: { fr: 'Votre soumission', en: 'Your quote' },
  mSub: { fr: 'Achat · {addr}', en: 'Purchase · {addr}' },
  mIncl: { fr: 'Honoraires, taxes et débours inclus', en: 'Fees, taxes and disbursements included' },
  mWhat: { fr: 'Ce qui est inclus', en: 'What’s included' },
  mWhatList: { fr: ['Vérification des titres (registre foncier)', 'Préparation et signature de l’acte de vente et de l’hypothèque', 'Coordination avec votre banque', 'Remise des documents finaux en ligne'], en: ['Title search (land registry)', 'Preparation and signing of the deed of sale and mortgage', 'Coordination with your bank', 'Online delivery of final documents'] },
  mDocs: { fr: 'Documents à prévoir', en: 'Documents you’ll need' },
  mDocsList: { fr: ['Deux pièces d’identité valides (photo, en couleurs, recto verso) et une copie du passeport canadien de chaque acheteur', 'Votre adresse complète', 'Votre état civil et ses documents (jugement de divorce, contrat et certificat de mariage, ou certificat de décès)', 'Les coordonnées du vendeur', 'Sans courtier : la promesse d’achat, le certificat de localisation et les coordonnées du syndicat', 'Une assurance habitation en vigueur à la date de l’acte de vente'], en: ['Two valid IDs (photo, colour, front and back) and a copy of each purchaser’s Canadian passport', 'Your full address', 'Your civil status and its documents (divorce judgment, marriage contract and certificate, or death certificate)', 'The seller’s contact details', 'Without a broker: the promise to purchase, the certificate of location and the syndicate contacts', 'Home insurance effective on the date of the deed of sale'] },
  mPay: { fr: 'Les honoraires sont payés à la signature, à même les déboursés. Un dépôt est requis seulement pour un prêt privé. Aucune carte de crédit.', en: 'Fees are paid at closing, from the disbursements. A deposit is required only for private-lending files. No credit cards.' },
  mAccept: { fr: 'Accepter et ouvrir mon dossier', en: 'Accept and open my file' },
  mQuestion: { fr: 'J’ai une question', en: 'I have a question' },
  mAccepted: { fr: 'Soumission acceptée. Votre dossier {id} est ouvert!', en: 'Quote accepted. Your file {id} is open!' },
  mNext: { fr: 'Prochaine étape : remplir le questionnaire (10 minutes).', en: 'Next step: complete the questionnaire (10 minutes).' },
  startQ: { fr: 'Commencer le questionnaire', en: 'Start the questionnaire' },

  // Intake
  s0Title: { fr: 'Vos coordonnées', en: 'Your details' },
  fullName: { fr: 'Nom complet (comme sur vos pièces d’identité)', en: 'Full legal name (as on your ID)' },
  email: { fr: 'Courriel', en: 'Email' },
  phone: { fr: 'Téléphone', en: 'Phone' },
  address: { fr: 'Adresse actuelle', en: 'Current address' },
  dob: { fr: 'Date de naissance', en: 'Date of birth' },
  s1Title: { fr: 'Situation familiale', en: 'Family situation' },
  marital: { fr: 'État civil', en: 'Marital status' },
  maritalOpts: { fr: ['Célibataire', 'Marié(e) – société d’acquêts (sans contrat)', 'Marié(e) – séparation de biens', 'Marié(e) – autre contrat de mariage', 'Union civile', 'Conjoint(e) de fait', 'Séparé(e)', 'Divorcé(e)', 'Veuf / veuve'], en: ['Single', 'Married – partnership of acquests (no contract)', 'Married – separation of property', 'Married – other marriage contract', 'Civil union', 'Common-law', 'Separated', 'Divorced', 'Widowed'] },
  regime: { fr: 'Régime matrimonial', en: 'Matrimonial regime' },
  regimeOpts: { fr: ['Société d’acquêts', 'Séparation de biens', 'Communauté de biens', 'Je ne sais pas'], en: ['Partnership of acquests', 'Separation of property', 'Community of property', 'I don’t know'] },
  coParty: { fr: 'Achetez-vous avec une autre personne?', en: 'Are you buying with someone else?' },
  yes: { fr: 'Oui', en: 'Yes' },
  no: { fr: 'Non', en: 'No' },
  s2Title: { fr: 'La transaction', en: 'The transaction' },
  propAddr: { fr: 'Adresse de la propriété', en: 'Property address' },
  closingDate: { fr: 'Date de signature souhaitée', en: 'Preferred signing date' },
  lender: { fr: 'Institution financière', en: 'Lender / bank' },
  sellerName: { fr: 'Nom du ou des vendeurs', en: 'Seller name(s)' },
  offer: { fr: 'Promesse d’achat acceptée (PDF)', en: 'Accepted offer to purchase (PDF)' },
  insTitle: { fr: 'Assurance habitation', en: 'Home insurance' },
  insurer: { fr: 'Assureur', en: 'Insurance company' },
  policy: { fr: 'Numéro de police (si connu)', en: 'Policy number (if known)' },
  insBank: { fr: 'J’ai demandé à mon assureur d’inscrire ma banque comme créancier hypothécaire.', en: 'I asked my insurer to list my bank as mortgage creditor (loss payee).' },
  insProof: { fr: 'Preuve d’assurance (facultatif pour l’instant)', en: 'Proof of insurance (optional for now)' },
  insWhy: { fr: 'Votre banque exige une assurance habitation qui la désigne comme créancier avant la signature.', en: 'Your bank requires home insurance naming it as creditor before signing.' },
  s3Title: { fr: 'Vos pièces d’identité', en: 'Your identity documents' },
  s3Sub: { fr: 'Deux pièces d’identité gouvernementales valides avec photo sont requises.', en: 'Two valid government-issued photo IDs are required.' },
  idType: { fr: 'Type de pièce', en: 'Document type' },
  idTypes: { fr: ['Passeport', 'Permis de conduire', 'Carte d’assurance maladie (facultatif)'], en: ['Passport', "Driver's licence", 'Health insurance card (optional)'] },
  expiry: { fr: 'Date d’expiration', en: 'Expiry date' },
  photo: { fr: 'Photo ou numérisation', en: 'Photo or scan' },
  addId: { fr: '+ Ajouter une pièce d’identité', en: '+ Add an ID document' },
  saveId: { fr: 'Ajouter', en: 'Add' },
  cancel: { fr: 'Annuler', en: 'Cancel' },
  validTo: { fr: '✓ Lu automatiquement · valide jusqu’au {d}', en: '✓ Read automatically · valid to {d}' },
  expiredOn: { fr: '⚠ Expirée depuis le {d}. Veuillez fournir une pièce valide.', en: '⚠ Expired on {d}. Please upload a valid ID.' },
  remove: { fr: 'Retirer', en: 'Remove' },
  needTwo: { fr: 'Encore {n} pièce(s) valide(s) requise(s).', en: '{n} more valid ID(s) needed.' },
  haveTwo: { fr: '✓ Deux pièces valides reçues.', en: '✓ Two valid IDs received.' },
  ramq: { fr: 'La carte d’assurance maladie n’est jamais exigée; vous pouvez la fournir si vous le souhaitez.', en: 'Your health card is never required; you may provide it if you wish.' },
  s4Title: { fr: 'Comment signerez-vous?', en: 'How will you sign?' },
  inPerson: { fr: 'En personne à l’étude', en: 'In person at the office' },
  inPersonSub: { fr: 'Apportez vos pièces originales au rendez-vous.', en: 'Bring your original IDs to the appointment.' },
  remote: { fr: 'À distance (vidéo Teams)', en: 'Remotely (Teams video)' },
  remoteSub: { fr: 'Une courte vérification faciale est requise.', en: 'A short face check is required.' },
  faceTitle: { fr: 'Vérification faciale', en: 'Face check' },
  faceSub: { fr: 'Une vidéo égoportrait d’environ 30 secondes, comparée à votre pièce d’identité.', en: 'A ~30 second selfie video, compared with your ID.' },
  faceConsent: { fr: 'J’accepte l’utilisation de mes données biométriques uniquement pour vérifier mon identité.', en: 'I consent to my biometric data being used only to verify my identity.' },
  faceStart: { fr: 'Commencer la vérification', en: 'Start face check' },
  faceRunning: { fr: 'Comparaison avec votre pièce d’identité…', en: 'Comparing with your ID…' },
  facePassed: { fr: '✓ Vérification réussie', en: '✓ Face check passed' },
  s5Title: { fr: 'Vérification et envoi', en: 'Review & submit' },
  consent: { fr: 'J’accepte que l’étude recueille et conserve ces renseignements pour mon dossier, conformément à sa politique de confidentialité (Loi 25).', en: 'I agree that the office collects and keeps this information for my file, under its privacy policy (Law 25).' },
  submit: { fr: 'Envoyer à l’étude', en: 'Send to the office' },
  doneTitle: { fr: 'Merci, c’est envoyé!', en: 'Thank you, all sent!' },
  doneSub: { fr: 'Votre parajuriste vérifie vos pièces d’identité. Vous recevrez ensuite votre convention de services à signer.', en: 'Your paralegal is reviewing your IDs. You’ll then receive your service contract to sign.' },
  alreadyDone: { fr: 'Votre questionnaire est déjà complété.', en: 'Your questionnaire is already complete.' },

  // Sign
  signTitle: { fr: 'Convention de services', en: 'Service contract' },
  signSub: { fr: 'Lisez et signez électroniquement.', en: 'Review and sign electronically.' },
  signTotal: { fr: 'Total des honoraires', en: 'Total fees' },
  signType: { fr: 'Tapez votre nom complet pour signer', en: 'Type your full name to sign' },
  signAgree: { fr: 'J’ai lu la convention et je l’accepte. Ma signature électronique a la même valeur qu’une signature manuscrite.', en: 'I have read and accept the agreement. My electronic signature has the same value as a handwritten one.' },
  signBtn: { fr: 'Signer électroniquement', en: 'Sign electronically' },
  signed: { fr: 'Convention signée. Merci!', en: 'Contract signed. Thank you!' },
  signedSub: { fr: 'Dès que votre banque aura transmis ses instructions, vous pourrez choisir votre rendez-vous de signature.', en: 'As soon as your bank sends its instructions, you’ll be able to book your signing appointment.' },

  // Booking
  bookTitle: { fr: 'Rendez-vous de signature', en: 'Book your signing' },
  bookSub: { fr: 'Dossier {id} · environ 60 min · avec {notary}', en: 'File {id} · about 60 min · with {notary}' },
  locked: { fr: 'La prise de rendez-vous s’ouvrira quand l’étude aura reçu les instructions de votre banque et votre convention signée.', en: 'Booking opens once the office has your bank’s instructions and your signed contract.' },
  unlocked: { fr: '✓ Les instructions de votre banque sont reçues. Choisissez votre rendez-vous.', en: '✓ Your bank’s instructions are in. Pick your appointment.' },
  teams: { fr: 'Vidéo Teams', en: 'Teams video' },
  inPersonShort: { fr: 'En personne', en: 'In person' },
  pickTime: { fr: 'Choisissez une heure', en: 'Pick a time' },
  liveCal: { fr: 'Disponibilités en direct du calendrier du notaire.', en: 'Live availability from the notary’s calendar.' },
  confirm: { fr: 'Confirmer', en: 'Confirm' },
  bookedTitle: { fr: 'C’est réservé!', en: 'You’re booked!' },
  bookedSub: { fr: 'Une invitation a été envoyée à votre courriel. Apportez vos pièces d’identité originales.', en: 'An invitation has been sent to your email. Bring your original IDs.' },
  addCal: { fr: 'Ajouter à mon calendrier', en: 'Add to my calendar' },

  // Portal
  portalTitle: { fr: 'Vos documents de clôture', en: 'Your closing documents' },
  portalLogin: { fr: 'Pour votre sécurité, entrez votre courriel. Nous vous enverrons un code à usage unique.', en: 'For your security, enter your email and we’ll send you a one-time code.' },
  sendCode: { fr: 'Recevoir un code', en: 'Send me a code' },
  code: { fr: 'Code à 6 chiffres', en: '6-digit code' },
  codeHint: { fr: 'Démo : n’importe quels 6 chiffres.', en: 'Demo: any 6 digits work.' },
  verify: { fr: 'Vérifier', en: 'Verify' },
  portalSub: { fr: 'Dossier {id} · Téléchargez et conservez ces fichiers.', en: 'File {id} · Download and keep these files.' },
  portalNone: { fr: 'Vos documents seront disponibles ici après la signature.', en: 'Your documents will be available here after signing.' },
  expires: { fr: 'Ce lien expire dans 30 jours. Besoin d’une copie plus tard? Contactez l’étude.', en: 'This link expires in 30 days. Need a copy later? Contact the office.' },
  downloadAll: { fr: 'Tout télécharger (.zip)', en: 'Download all (.zip)' },
  download: { fr: 'Télécharger', en: 'Download' },

  // My file
  myFile: { fr: 'Mon dossier', en: 'My file' },
  myFileSub: { fr: 'Suivez chaque étape de votre transaction.', en: 'Follow every step of your transaction.' },
  noFile: { fr: 'Aucun dossier ouvert pour l’instant. Acceptez la soumission reçue par courriel pour commencer.', en: 'No file open yet. Accept the quote you received by email to get started.' },
  tracker: {
    fr: ['Soumission acceptée', 'Questionnaire et pièces d’identité', 'Identité vérifiée', 'Convention signée', 'Instructions de la banque', 'Rendez-vous réservé', 'Signature chez le notaire', 'Documents disponibles'],
    en: ['Quote accepted', 'Questionnaire & IDs', 'Identity verified', 'Contract signed', 'Bank instructions', 'Appointment booked', 'Signing with the notary', 'Documents available'],
  },
  doNow: { fr: 'À faire', en: 'Do it now' },
  inProgress: { fr: 'En cours', en: 'In progress' },

  // Appointments (shared)
  modeInPerson: { fr: 'En personne', en: 'In person' },
  modeTeams: { fr: 'Vidéo Teams', en: 'Teams video' },
  modePhone: { fr: 'Téléphone', en: 'Phone' },
  withWhom: { fr: 'Avec', en: 'With' },
  otherNotary: { fr: 'Voir les disponibilités d’un autre notaire', en: 'See another notary’s availability' },
  attendees: { fr: 'Participants', en: 'Attendees' },
  addAttendee: { fr: 'Inviter une autre personne (courriel)', en: 'Invite another person (email)' },
  add: { fr: 'Ajouter', en: 'Add' },
  joinTeams: { fr: 'Rejoindre la réunion Teams', en: 'Join Teams meeting' },
  addToCal: { fr: 'Ajouter à mon calendrier (.ics)', en: 'Add to my calendar (.ics)' },
  reschedule: { fr: 'Changer l’heure', en: 'Reschedule' },
  cancelAppt: { fr: 'Annuler le rendez-vous', en: 'Cancel appointment' },
  cancelConfirm: { fr: 'Annuler ce rendez-vous? Vous pourrez en choisir un autre.', en: 'Cancel this appointment? You can pick a new one afterwards.' },
  keep: { fr: 'Garder', en: 'Keep it' },
  yesCancel: { fr: 'Oui, annuler', en: 'Yes, cancel' },
  newTime: { fr: 'Choisissez la nouvelle heure', en: 'Pick the new time' },
  confirmNew: { fr: 'Confirmer la nouvelle heure', en: 'Confirm new time' },
  remindNote: { fr: 'Rappel automatique par courriel et texto 24 h avant.', en: 'Automatic email + text reminder 24 h before.' },
  outlookNote: { fr: 'Une invitation de calendrier a été envoyée à tous les participants.', en: 'A calendar invitation was sent to all attendees.' },
  noSlots: { fr: 'Aucune disponibilité cette journée.', en: 'No availability this day.' },
  minutes: { fr: 'min', en: 'min' },

  // Consultation
  cTitle: { fr: 'Réserver une consultation', en: 'Book a consultation' },
  cSub: { fr: 'Posez vos questions avant de vous engager. Gratuit et sans obligation.', en: 'Ask your questions before committing. Free, no obligation.' },
  cWho: { fr: 'Avec qui?', en: 'With whom?' },
  cParalegal: { fr: 'Une parajuriste · 15 min', en: 'A paralegal · 15 min' },
  cParalegalSub: { fr: 'Prix, délais, documents à prévoir', en: 'Pricing, timelines, documents needed' },
  cNotary: { fr: 'Un notaire · 30 min', en: 'A notary · 30 min' },
  cNotarySub: { fr: 'Questions juridiques sur votre situation', en: 'Legal questions about your situation' },
  cHow: { fr: 'Comment?', en: 'How?' },
  cTopic: { fr: 'Sujet (facultatif)', en: 'Topic (optional)' },
  cBook: { fr: 'Réserver', en: 'Book' },
  cBooked: { fr: 'Consultation réservée!', en: 'Consultation booked!' },
  cFirstFree: { fr: 'Première personne disponible', en: 'First available' },

  // Questionnaire variants
  qAs: { fr: 'Vous êtes', en: 'You are' },
  qRole: { fr: 'Votre rôle', en: 'Your role' },
  roleBuyer: { fr: 'Acheteur', en: 'Buyer' },
  roleSeller: { fr: 'Vendeur', en: 'Seller' },
  roleBorrower: { fr: 'Emprunteur (refinancement)', en: 'Borrower (refinance)' },
  typeIndividual: { fr: 'Un particulier', en: 'An individual' },
  typeCorporation: { fr: 'Une société', en: 'A corporation' },
  coTitle: { fr: 'La société', en: 'The corporation' },
  coName: { fr: 'Nom de la société', en: 'Corporation name' },
  coNeq: { fr: 'NEQ (numéro d’entreprise du Québec)', en: 'NEQ (Quebec enterprise number)' },
  coOfficer: { fr: 'Signataire autorisé', en: 'Authorized signing officer' },
  coOfficerTitle: { fr: 'Titre du signataire', en: 'Signing officer’s title' },
  coArticles: { fr: 'Statuts constitutifs / état du registre (PDF)', en: 'Articles / enterprise register extract (PDF)' },
  coResolution: { fr: 'Résolution autorisant la transaction et le signataire', en: 'Resolution authorizing the transaction and the signing officer' },
  coIdsNote: { fr: 'Les pièces d’identité demandées plus loin sont celles du signataire.', en: 'The IDs requested later are the signing officer’s.' },
  spouse: { fr: 'Nom du conjoint', en: 'Spouse’s name' },
  existingMortgages: { fr: 'Hypothèques existantes à rembourser', en: 'Existing mortgages to pay off' },
  emNote: { fr: 'Nous commanderons les états de compte pour quittance.', en: 'We’ll order the payout statements.' },
  emLender: { fr: 'Institution', en: 'Lender' },
  emAccount: { fr: 'Numéro de compte / prêt', en: 'Account / loan number' },
  emAdd: { fr: '+ Ajouter une hypothèque', en: '+ Add a mortgage' },
  rented: { fr: 'La propriété est-elle louée?', en: 'Is the property rented?' },
  leases: { fr: 'Baux en vigueur', en: 'Current leases' },
  rentRoll: { fr: 'Liste des loyers (rent roll)', en: 'Rent roll' },
  utilities: { fr: 'Soldes des comptes (Hydro-Québec, etc.)', en: 'Account balances (Hydro-Québec, etc.)' },
  capture: { fr: 'Capturer l’écran de mon compte', en: 'Capture my account screen' },
  captureHelp: { fr: 'Ouvrez votre compte en ligne dans un autre onglet, puis capturez-le ici. Ou téléversez une capture.', en: 'Open your online account in another tab, then capture it here. Or upload a screenshot.' },
  captured: { fr: '✓ Capture ajoutée', en: '✓ Capture added' },
  currentLender: { fr: 'Prêteur actuel', en: 'Current lender' },
  newLender: { fr: 'Nouveau prêteur', en: 'New lender' },
  idFront: { fr: 'Recto (couleur)', en: 'Front (colour)' },
  idBack: { fr: 'Verso (couleur)', en: 'Back (colour)' },
  previewAs: { fr: 'Démo : afficher le questionnaire pour', en: 'Demo: show questionnaire as' },

  // Two meetings
  meetMortgage: { fr: 'Signature de l’acte d’hypothèque', en: 'Mortgage deed signing' },
  meetMortgageHint: { fr: 'Environ une semaine avant la vente', en: 'About one week before the sale' },
  meetSale: { fr: 'Signature de l’acte de vente', en: 'Deed of sale signing' },
  meetSaleHint: { fr: 'En présence du vendeur, à la date de clôture', en: 'With the seller, on the closing date' },
  bookTwo: { fr: 'Vos deux rendez-vous', en: 'Your two appointments' },
  bothBooked: { fr: 'Vos deux rendez-vous sont réservés!', en: 'Both appointments are booked!' },
  notBooked: { fr: 'À réserver', en: 'To book' },
  bringOriginals: { fr: 'Apportez vos pièces d’identité originales.', en: 'Bring your original IDs.' },

  // Questionnaire additions (from the firm’s mini-mandate)
  passportCopy: { fr: 'Copie du passeport canadien (pour chaque acheteur)', en: 'Copy of Canadian passport (for each purchaser)' },
  civilDocs: { fr: 'Documents d’état civil', en: 'Civil status documents' },
  civilDocsHint: { fr: 'Jugement de divorce, contrat et certificat de mariage, ou certificat de décès, selon le cas. Les conjoints de fait jamais mariés sont considérés célibataires.', en: 'Divorce judgment, marriage contract and certificate, or death certificate, as applicable. Common-law partners never married are considered single.' },
  hasBroker: { fr: 'Êtes-vous représenté par un courtier immobilier?', en: 'Are you represented by a real estate broker?' },
  brokerYes: { fr: 'Votre courtier nous transmettra les documents de la transaction.', en: 'Your broker will send us the transaction documents.' },
  colCert: { fr: 'Certificat de localisation', en: 'Certificate of location' },
  syndicate: { fr: 'Coordonnées du syndicat / de la gestion (copropriété)', en: 'Syndicate / management contacts (condo)' },
  sellerContacts: { fr: 'Coordonnées du vendeur (nous lui transmettrons ses frais)', en: 'Seller’s contacts (we will send them their fees)' },
  sellerEmail: { fr: 'Courriel du vendeur', en: 'Seller’s email' },
  fundsTitle: { fr: 'Votre mise de fonds', en: 'Your down payment' },
  fundsOrigin: { fr: 'Provenance des fonds', en: 'Source of funds' },
  fundsOpts: { fr: ['Épargne', 'Vente d’une propriété', 'Don d’un proche', 'REER / RAP', 'Autre'], en: ['Savings', 'Sale of a property', 'Gift from a relative', 'RRSP / HBP', 'Other'] },
  thirdParty: { fr: 'Une partie des fonds provient d’un tiers (parent, conjoint…)', en: 'Part of the funds comes from a third party (parent, spouse…)' },
  abroad: { fr: 'Des fonds proviennent de l’extérieur du Canada', en: 'Some funds come from outside Canada' },
  unequal: { fr: 'Les acheteurs contribuent des montants inégaux (protection à prévoir dans l’acte)', en: 'Buyers contribute unequal amounts (protection to include in the deed)' },
  propKind: { fr: 'Type de propriété vendue', en: 'Type of property sold' },
  propKinds: { fr: ['Condo non loué', 'Condo loué', 'Immeuble à logements', 'Maison / immeuble'], en: ['Condo, not rented', 'Condo, rented', 'Apartment building', 'House / building'] },
  newAddress: { fr: 'Votre nouvelle adresse après la vente', en: 'Your new address after the sale' },
  titles: { fr: 'Titres originaux (si vous les avez)', en: 'Original titles (if you have them)' },

  // Guides, FAQ, fraud
  guide: { fr: 'Guide explicatif', en: 'Explanatory guide' },
  guideOpen: { fr: 'Lire le guide', en: 'Read the guide' },
  faq: { fr: 'Questions fréquentes', en: 'Frequently asked questions' },
  fraud: { fr: 'Avis important : notre étude ne vous transmettra jamais ses informations bancaires par courriel. En cas de doute, appelez-nous au 514 748-6539 avant tout transfert.', en: 'Important: our office will never send banking information by email. If in doubt, call us at 514 748-6539 before sending any funds.' },
  fundsDeclare: { fr: 'Déclarer la provenance des fonds', en: 'Declare the source of funds' },
  fundsDeclared: { fr: '✓ Provenance des fonds déclarée', en: '✓ Source of funds declared' },
  approx: { fr: 'Honoraires approximatifs', en: 'Approximate fees' },
  plusPlus: { fr: '+ taxes et frais (détaillés dans le contrat de service)', en: '+ taxes and disbursements (detailed in the services agreement)' },
  payBuyer: { fr: 'Les honoraires sont remis avec la mise de fonds, par virement uniquement.', en: 'Fees are remitted with the down payment, by wire only.' },
  paySeller: { fr: 'Les honoraires sont payés à même le produit de la vente.', en: 'Fees are paid from the sale proceeds.' },

  // Client account
  suTitle: { fr: 'Créer votre espace client', en: 'Create your client space' },
  suSub: { fr: 'Merci pour votre demande sur acoca.ca. Créez votre espace sécurisé : c’est ici que vous recevrez notre soumission, que vous signerez et que vous suivrez votre dossier.', en: 'Thank you for your request on acoca.ca. Create your secure space: this is where you will receive our quote, sign and follow your file.' },
  liTitle: { fr: 'Connexion à votre espace client', en: 'Sign in to your client space' },
  liSub: { fr: 'Acoca Notaires · accès sécurisé à vos messages et à votre dossier.', en: 'Acoca Notaires · secure access to your messages and file.' },
  liNoAccount: { fr: 'Pas encore de compte?', en: 'No account yet?' },
  liHaveAccount: { fr: 'Déjà un compte?', en: 'Already have an account?' },
  liSignIn: { fr: 'Se connecter', en: 'Sign in' },
  liUnknown: { fr: 'Aucun compte pour ce courriel. Créez votre espace client.', en: 'No account for this email. Create your client space.' },
  logout: { fr: 'Se déconnecter', en: 'Sign out' },
  toMessages: { fr: 'Voir mes messages', en: 'View my messages' },
  backMessages: { fr: 'Retour à mes messages', en: 'Back to my messages' },
  suCode: { fr: 'Entrez le code reçu par courriel', en: 'Enter the code sent by email' },
  suPassword: { fr: 'Choisissez un mot de passe', en: 'Choose a password' },
  suPassword2: { fr: 'Confirmez le mot de passe', en: 'Confirm the password' },
  su2fa: { fr: 'Vérification en deux étapes par texto', en: 'Two-step verification by text message' },
  suPhone: { fr: 'Cellulaire', en: 'Mobile phone' },
  suDone: { fr: 'Votre espace client est créé', en: 'Your client space is ready' },
  suOr: { fr: 'ou', en: 'or' },
  suGoogle: { fr: 'Continuer avec Google', en: 'Continue with Google' },
  suMicrosoft: { fr: 'Continuer avec Microsoft', en: 'Continue with Microsoft' },
  suHave: { fr: 'Déjà un compte? Se connecter', en: 'Already have an account? Sign in' },
  suCreate: { fr: 'Créer mon compte', en: 'Create my account' },
  suNext: { fr: 'Suivant', en: 'Next' },
  pwRules: { fr: '10 caractères minimum, avec un chiffre', en: 'At least 10 characters, including a number' },
}

export function t(lang, key, vars) {
  const e = S[key]
  if (!e) return key
  let s = e[lang] ?? e.en
  if (vars && typeof s === 'string') for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k])
  return s
}

// Emails Émilie receives, generated from what the office does in the staff app.
export function emailContent(kind, lang, ctx) {
  const fr = lang === 'fr'
  const hi = fr ? `Bonjour ${ctx.first},` : `Hello ${ctx.first},`
  const sig = fr ? 'Nathalie Roy, parajuriste\nAcoca Notaires inc. · 700 Av. Sainte-Croix, Saint-Laurent · 514 748-6539' : 'Nathalie Roy, paralegal\nAcoca Notaires inc. · 700 Av. Sainte-Croix, Saint-Laurent · 514 748-6539'
  // Appointment details, for emails that carry an appointment in ctx.
  const apptWhen = ctx.date ? `${fmtDate(ctx.date, lang)} · ${ctx.time}` : ''
  const apptName = ctx.kind === 'consultation' ? (fr ? 'consultation' : 'consultation') : (fr ? 'rendez-vous de signature' : 'signing appointment')
  const apptLink = ctx.kind === 'consultation' ? '/client/consult' : '/client/booking'
  const modeLabel = { 'In person': t(lang, 'modeInPerson'), 'Teams video': t(lang, 'modeTeams'), Phone: t(lang, 'modePhone') }[ctx.mode] ?? ctx.mode
  const where = ctx.mode === 'In person' ? OFFICE_ADDRESS : ctx.mode === 'Phone' ? (fr ? 'Nous vous appellerons au numéro au dossier' : 'We will call you at the number on file') : (fr ? 'Lien Teams ci-dessous' : 'Teams link below')
  const apptBlock = ctx.date ? [
    `📅 ${apptWhen} (${ctx.duration} min)`,
    `👤 ${fr ? 'Avec' : 'With'} ${ctx.with}`,
    `📍 ${modeLabel} · ${where}`,
    ctx.teams ? `🔗 ${ctx.teams}` : null,
  ].filter(Boolean).join('\n') : ''
  const E = {
    custom: { subject: ctx.subject ?? '', body: ctx.body ?? '' },
    funds: {
      subject: fr ? 'Fonds requis pour la signature' : 'Funds required for signing',
      body: fr ? `${hi}\n\nVotre signature approche. Le montant total à remettre à notre étude est de ${ctx.amount ?? ''} (facture, état des ajustements et état des déboursés joints).\n\n• Par virement bancaire uniquement (aucun chèque), avant ou au premier rendez-vous\n• Une preuve de la provenance des fonds est exigée (déclarez-la dans votre espace client)\n• Nos instructions bancaires vous seront envoyées dans un document protégé par mot de passe. Le mot de passe vous sera donné par téléphone seulement : ne transférez aucuns fonds avant de l’avoir confirmé avec nous.\n• Fonds d’un tiers, REER/RAP ou fonds de l’étranger : avisez-nous dès maintenant.\n\n${sig}` : `${hi}\n\nYour signing is coming up. The total amount to remit to our office is ${ctx.amount ?? ''} (invoice, statement of adjustments and disbursements attached).\n\n• By bank wire only (no cheques), before or at the first appointment\n• Proof of the source of funds is required (declare it in your client space)\n• Our banking instructions will be sent in a password-protected document. The password is given by phone only: do not transfer any funds before confirming it with us.\n• Third-party funds, RRSP/HBP or funds from abroad: tell us now.\n\n${sig}`,
      cta: fr ? 'Déclarer la provenance des fonds' : 'Declare the source of funds', to: '/client/file',
    },
    ack: {
      subject: fr ? 'Nous avons bien reçu votre demande' : 'We received your inquiry',
      body: fr ? `${hi}\n\nMerci d’avoir communiqué avec Acoca Notaires. Une parajuriste vous fera parvenir une soumission personnalisée sous peu (habituellement en moins de 24 heures).\n\nVous préférez en parler? Réservez une courte consultation gratuite, par téléphone, Teams ou à l’étude.\n\n${sig}` : `${hi}\n\nThank you for contacting Acoca Notaires. A paralegal will send you a personalized quote shortly (usually within 24 hours).\n\nPrefer to talk first? Book a short free consultation by phone, Teams or at the office.\n\n${sig}`,
      cta: fr ? 'Réserver une consultation (facultatif)' : 'Book a consultation (optional)', to: '/client/consult',
    },
    consultLink: {
      subject: fr ? 'Réservez votre consultation' : 'Book your consultation',
      body: fr ? `${hi}\n\nComme convenu, voici le lien pour choisir le moment de votre consultation. Vous verrez nos disponibilités en temps réel.\n\n${sig}` : `${hi}\n\nAs discussed, here is the link to pick a time for your consultation. You’ll see our availability in real time.\n\n${sig}`,
      cta: fr ? 'Choisir un moment' : 'Pick a time', to: '/client/consult',
    },
    consultBooked: {
      subject: fr ? `Consultation confirmée – ${apptWhen}` : `Consultation confirmed – ${apptWhen}`,
      body: fr ? `${hi}\n\nVotre consultation est confirmée.\n\n${apptBlock}\n\nUn rappel vous sera envoyé 24 h avant.\n\n${sig}` : `${hi}\n\nYour consultation is confirmed.\n\n${apptBlock}\n\nWe’ll send you a reminder 24 h before.\n\n${sig}`,
      cta: fr ? 'Gérer mon rendez-vous' : 'Manage my appointment', to: '/client/consult', teams: ctx.teams, ics: true,
    },
    mandate: {
      subject: fr ? 'Votre achat – soumission' : 'Your purchase – quote',
      body: fr ? `${hi}\n\nFélicitations pour votre nouvel achat! Vous trouverez ci-joint notre guide explicatif destiné à l’acheteur.\n\nNos honoraires pour ce dossier sont approximativement de ${ctx.total} + taxes et frais. Confirmez votre acceptation avec le bouton ci-dessous : une parajuriste procédera ensuite à la recherche des titres et vous transmettra un contrat de service détaillant l’ensemble des frais.\n\nVeuillez informer votre institution financière de faire parvenir les instructions hypothécaires au nom du notaire à être désigné. Les rendez-vous sont fixés uniquement après la signature du contrat de service et la réception des instructions bancaires.\n\nÀ prévoir : deux pièces d’identité (couleur, recto verso) et une copie de votre passeport canadien, votre adresse, votre état civil et ses documents, les coordonnées du vendeur. Sans courtier : la promesse d’achat, le certificat de localisation et les coordonnées du syndicat.\n\nUne assurance habitation prenant effet à la date de l’acte de vente devra être obtenue.\n\n${sig}` : `${hi}\n\nCongratulations on your purchase! Our explanatory guide for buyers is attached.\n\nOur fees for this file are approximately ${ctx.total} + taxes and disbursements. Confirm your acceptance with the button below: a paralegal will then do the title search and send you a services agreement detailing all fees.\n\nPlease ask your lender to send the mortgage instructions in the name of the notary to be designated. Appointments are scheduled only after the services agreement is signed and the mortgage instructions are received.\n\nYou’ll need: two IDs (colour, front and back) and a copy of your Canadian passport, your address, your civil status and its documents, the seller’s contacts. Without a broker: the promise to purchase, the certificate of location and the syndicate contacts.\n\nHome insurance effective on the date of the deed of sale must be obtained.\n\n${sig}`,
      cta: fr ? 'Voir et accepter la soumission' : 'View and accept the quote', to: '/client/mandate', attach: { label: fr ? 'Guide explicatif – Acheteur.pdf' : 'Explanatory guide – Purchaser.pdf', to: '/client/guide?role=buyer' },
    },
    questionnaire: {
      subject: fr ? `Votre dossier ${ctx.file} est ouvert` : `Your file ${ctx.file} is open`,
      body: fr ? `${hi}\n\nMerci de nous faire confiance! Votre dossier ${ctx.file} est ouvert.\n\nProchaine étape : remplissez le questionnaire sécurisé et téléversez deux pièces d’identité. Cela prend environ 10 minutes.\n\n${sig}` : `${hi}\n\nThank you for choosing us! Your file ${ctx.file} is open.\n\nNext step: complete the secure questionnaire and upload two IDs. It takes about 10 minutes.\n\n${sig}`,
      cta: fr ? 'Remplir le questionnaire' : 'Complete the questionnaire', to: '/client/intake',
    },
    reminder: {
      subject: fr ? 'Rappel : votre dossier attend une action' : 'Reminder: your file needs your attention',
      body: fr ? `${hi}\n\nPetit rappel : il nous manque encore des renseignements pour avancer dans votre dossier ${ctx.file}.\n\n${sig}` : `${hi}\n\nA quick reminder: we still need some information to move your file ${ctx.file} forward.\n\n${sig}`,
      cta: fr ? 'Voir mon dossier' : 'View my file', to: '/client/file',
    },
    contract: {
      subject: fr ? 'Votre convention de services à signer' : 'Your service contract to sign',
      body: fr ? `${hi}\n\nVos pièces d’identité sont vérifiées. Voici votre convention de services professionnels (${ctx.total}). Vous pouvez la signer électroniquement en moins d’une minute.\n\n${sig}` : `${hi}\n\nYour IDs are verified. Here is your professional services agreement (${ctx.total}). You can sign it electronically in under a minute.\n\n${sig}`,
      cta: fr ? 'Lire et signer' : 'Review and sign', to: '/client/sign',
    },
    booking: {
      subject: fr ? 'Réservez votre rendez-vous de signature' : 'Book your signing appointment',
      body: fr ? `${hi}\n\nBonne nouvelle : nous avons reçu les instructions de votre banque. Votre dossier est prêt pour la signature.\n\n${ctx.two ? 'Votre achat comporte deux rendez-vous : la signature de l’acte d’hypothèque (environ une semaine avant), puis l’acte de vente avec le vendeur. ' : ''}Voici ${ctx.slots?.length ?? 3} moments disponibles avec ${ctx.with ?? 'votre notaire'}${ctx.two ? ' pour le premier rendez-vous' : ''}. Cliquez sur celui qui vous convient (en personne ou par vidéo Teams) :\n\n${sig}` : `${hi}\n\nGood news: we’ve received your bank’s instructions. Your file is ready for signing.\n\n${ctx.two ? 'Your purchase has two appointments: the mortgage deed signing (about a week before), then the deed of sale with the seller. ' : ''}Here are ${ctx.slots?.length ?? 3} available times with ${ctx.with ?? 'your notary'}${ctx.two ? ' for the first appointment' : ''}. Click the one that suits you (in person or by Teams video):\n\n${sig}`,
      cta: fr ? 'Voir d’autres disponibilités' : 'See other times', to: '/client/booking', slots: ctx.slots,
    },
    booked: {
      subject: fr ? `Signature confirmée – ${apptWhen}` : `Signing confirmed – ${apptWhen}`,
      body: fr ? `${hi}\n\nVotre rendez-vous de signature est confirmé.\n\n${apptBlock}\n\nÀ prévoir : vos pièces d’identité originales et la traite bancaire ou la preuve de virement. Un rappel vous sera envoyé 24 h avant.\n\n${sig}` : `${hi}\n\nYour signing appointment is confirmed.\n\n${apptBlock}\n\nPlease have your original IDs and the bank draft or proof of wire transfer. We’ll send you a reminder 24 h before.\n\n${sig}`,
      cta: fr ? 'Gérer mon rendez-vous' : 'Manage my appointment', to: '/client/booking', teams: ctx.teams, ics: true,
    },
    rescheduled: {
      subject: fr ? `Rendez-vous modifié – ${apptWhen}` : `Appointment changed – ${apptWhen}`,
      body: fr ? `${hi}\n\nVotre ${apptName} a été déplacé(e). Voici la nouvelle heure :\n\n${apptBlock}\n\nL’invitation de calendrier a été mise à jour.\n\n${sig}` : `${hi}\n\nYour ${apptName} has been moved. Here is the new time:\n\n${apptBlock}\n\nYour calendar invitation has been updated.\n\n${sig}`,
      cta: fr ? 'Gérer mon rendez-vous' : 'Manage my appointment', to: apptLink, teams: ctx.teams, ics: true,
    },
    cancelled: {
      subject: fr ? `Rendez-vous annulé – ${apptWhen}` : `Appointment cancelled – ${apptWhen}`,
      body: fr ? `${hi}\n\nVotre ${apptName} du ${apptWhen} est annulé(e). Vous pouvez choisir un nouveau moment en tout temps.\n\n${sig}` : `${hi}\n\nYour ${apptName} on ${apptWhen} has been cancelled. You can pick a new time whenever you like.\n\n${sig}`,
      cta: fr ? 'Choisir un nouveau moment' : 'Pick a new time', to: apptLink,
    },
    apptReminder: {
      subject: fr ? `Rappel : ${apptName} ${apptWhen}` : `Reminder: ${apptName} ${apptWhen}`,
      body: fr ? `${hi}\n\nPetit rappel de votre ${apptName} :\n\n${apptBlock}\n\n${ctx.kind === 'signing' ? 'N’oubliez pas vos pièces d’identité originales et la preuve de paiement.\n\n' : ''}Un empêchement? Vous pouvez changer l’heure en un clic.\n\n${sig}` : `${hi}\n\nA quick reminder of your ${apptName}:\n\n${apptBlock}\n\n${ctx.kind === 'signing' ? 'Please bring your original IDs and proof of payment.\n\n' : ''}Can’t make it? You can reschedule in one click.\n\n${sig}`,
      cta: fr ? 'Gérer mon rendez-vous' : 'Manage my appointment', to: apptLink, teams: ctx.teams, ics: true,
    },
    documents: {
      subject: fr ? 'Vos documents sont prêts' : 'Your documents are ready',
      body: fr ? `${hi}\n\nFélicitations pour votre nouvelle propriété! Vos documents finaux (acte de vente, hypothèque, état des ajustements) sont disponibles dans votre espace sécurisé pendant 30 jours.\n\n${sig}` : `${hi}\n\nCongratulations on your new home! Your final documents (deed of sale, mortgage, statement of adjustments) are available in your secure space for 30 days.\n\n${sig}`,
      cta: fr ? 'Télécharger mes documents' : 'Download my documents', to: '/client/portal',
    },
  }
  const out = E[kind]
  // The property address always appears in the subject line (firm convention).
  const addr = ctx.addr?.split(',')[0]
  if (out && addr && kind !== 'custom' && !out.subject.includes(addr)) return { ...out, subject: `${out.subject} – ${addr}` }
  return out
}
