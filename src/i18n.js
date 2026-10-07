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
  inbox: { fr: 'Boîte de réception', en: 'Inbox' },
  inboxEmpty: { fr: 'Sélectionnez un message', en: 'Select a message' },
  inboxHint: { fr: 'Démo : les courriels arrivent ici quand l’étude agit dans l’application.', en: 'Demo: emails arrive here as the office acts in the staff app.' },
  from: { fr: 'De', en: 'From' },
  to: { fr: 'À', en: 'To' },

  // Mandate
  mTitle: { fr: 'Votre soumission', en: 'Your quote' },
  mSub: { fr: 'Achat · {addr}', en: 'Purchase · {addr}' },
  mIncl: { fr: 'Honoraires, taxes et débours inclus', en: 'Fees, taxes and disbursements included' },
  mWhat: { fr: 'Ce qui est inclus', en: 'What’s included' },
  mWhatList: { fr: ['Vérification des titres (registre foncier)', 'Préparation et signature de l’acte de vente et de l’hypothèque', 'Coordination avec votre banque', 'Remise des documents finaux en ligne'], en: ['Title search (land registry)', 'Preparation and signing of the deed of sale and mortgage', 'Coordination with your bank', 'Online delivery of final documents'] },
  mDocs: { fr: 'Documents à prévoir', en: 'Documents you’ll need' },
  mDocsList: { fr: ['Deux pièces d’identité couleur avec photo (passeport, permis de conduire ou carte d’assurance maladie)', 'Votre adresse actuelle et votre état civil', 'Les coordonnées du vendeur', 'Votre assureur habitation (la banque doit y figurer comme créancier)'], en: ['Two colour photo IDs (passport, driver’s licence or health card)', 'Your current address and marital status', 'The seller’s contact details', 'Your home insurer (the bank must be listed as creditor)'] },
  mPay: { fr: 'Paiement par virement ou traite bancaire avant la signature. Aucune carte de crédit.', en: 'Payment by wire transfer or bank draft before signing. No credit cards.' },
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
  maritalOpts: { fr: ['Célibataire', 'Marié(e)', 'Union civile', 'Conjoint(e) de fait', 'Divorcé(e)', 'Veuf/veuve'], en: ['Single', 'Married', 'Civil union', 'Common-law', 'Divorced', 'Widowed'] },
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
  const sig = fr ? 'Nathalie Roy, parajuriste\nÉtude Dubois Notaires' : 'Nathalie Roy, paralegal\nÉtude Dubois Notaires'
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
    ack: {
      subject: fr ? 'Nous avons bien reçu votre demande' : 'We received your inquiry',
      body: fr ? `${hi}\n\nMerci d’avoir communiqué avec Étude Dubois Notaires. Une parajuriste vous fera parvenir une soumission personnalisée sous peu (habituellement en moins de 24 heures).\n\nVous préférez en parler? Réservez une courte consultation gratuite, par téléphone, Teams ou à l’étude.\n\n${sig}` : `${hi}\n\nThank you for contacting Étude Dubois Notaires. A paralegal will send you a personalized quote shortly (usually within 24 hours).\n\nPrefer to talk first? Book a short free consultation by phone, Teams or at the office.\n\n${sig}`,
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
      subject: fr ? 'Votre soumission – achat' : 'Your quote – purchase',
      body: fr ? `${hi}\n\nMerci de votre demande. Pour votre achat au ${ctx.addr}, nos honoraires sont de ${ctx.total}, taxes et débours inclus.\n\nDocuments à prévoir :\n• Deux pièces d’identité avec photo\n• Votre adresse actuelle et votre état civil\n• Les coordonnées du vendeur\n• Votre assureur habitation (la banque doit y figurer comme créancier)\n\nSi la soumission vous convient, acceptez-la en un clic : votre dossier sera ouvert immédiatement.\n\n${sig}` : `${hi}\n\nThank you for your inquiry. For your purchase at ${ctx.addr}, our fees are ${ctx.total}, taxes and disbursements included.\n\nDocuments you’ll need:\n• Two photo IDs\n• Your current address and marital status\n• The seller’s details\n• Your home insurer (the bank must be listed as creditor)\n\nIf the quote suits you, accept it in one click and your file opens immediately.\n\n${sig}`,
      cta: fr ? 'Voir et accepter la soumission' : 'View and accept the quote', to: '/client/mandate',
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
      body: fr ? `${hi}\n\nBonne nouvelle : nous avons reçu les instructions de votre banque. Votre dossier est prêt pour la signature.\n\nVoici ${ctx.slots?.length ?? 3} moments disponibles avec ${ctx.with ?? 'votre notaire'}. Cliquez sur celui qui vous convient (en personne ou par vidéo Teams) :\n\n${sig}` : `${hi}\n\nGood news: we’ve received your bank’s instructions. Your file is ready for signing.\n\nHere are ${ctx.slots?.length ?? 3} available times with ${ctx.with ?? 'your notary'}. Click the one that suits you (in person or by Teams video):\n\n${sig}`,
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
  return E[kind]
}
