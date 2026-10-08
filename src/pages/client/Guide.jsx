import { useSearchParams } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { GUIDES } from '../../firm'

const FAQ = {
  buyer: {
    fr: [
      ['Quand vais-je connaître le montant de ma mise de fonds?', 'Quelques jours avant la signature de l’acte d’hypothèque, ou au plus tard le jour même. Nos instructions bancaires vous seront transmises au même moment.'],
      ['Et si une partie de ma mise de fonds vient d’un tiers?', 'Avisez-nous le plus tôt possible : nous vous indiquerons les démarches et documents requis.'],
      ['Puis-je payer par chèque?', 'Non. Sauf instruction contraire, les fonds sont transférés par virement selon nos instructions.'],
      ['Quand dois-je obtenir mon assurance habitation?', 'Elle doit entrer en vigueur à la date de l’acte de vente; envoyez-nous la police quelques jours avant.'],
      ['Dois-je apporter mes pièces d’identité?', 'Oui, les originaux, même si vous les avez déjà transmises électroniquement.'],
    ],
    en: [
      ['When will I know my down payment amount?', 'A few days before the mortgage signing, or at the latest that day. Our banking instructions are sent at the same time.'],
      ['What if part of my down payment comes from a third party?', 'Tell us as early as possible; we will explain the steps and documents needed.'],
      ['Can I pay by cheque?', 'No. Unless instructed otherwise, funds are sent by wire according to our instructions.'],
      ['When do I need home insurance?', 'It must take effect on the date of the deed of sale; send us the policy a few days before.'],
      ['Do I need to bring my IDs?', 'Yes, the originals, even if you already sent them electronically.'],
    ],
  },
  seller: {
    fr: [
      ['Quand vais-je recevoir le produit de la vente?', 'Après la publication de l’acte de vente au registre foncier, sans inscription défavorable.'],
      ['Puis-je recevoir le produit par virement?', 'Oui, avisez votre adjointe le plus tôt possible et fournissez vos coordonnées bancaires.'],
      ['Qui rembourse mon hypothèque?', 'Notre étude communique avec votre institution et rembourse le prêt à même le produit de la vente.'],
      ['Quand remettre les clés?', 'Habituellement à la date de la transaction, après la confirmation du notaire.'],
    ],
    en: [
      ['When will I receive the sale proceeds?', 'After the deed of sale is registered at the land registry with no adverse entry.'],
      ['Can I receive the proceeds by wire?', 'Yes, tell your legal assistant as soon as possible and provide your banking details.'],
      ['Who repays my mortgage?', 'Our office contacts your lender and repays the loan from the sale proceeds.'],
      ['When do I hand over the keys?', 'Usually on the transaction date, after the notary confirms.'],
    ],
  },
}

export default function Guide() {
  const { state } = useStore()
  const L = state.lang
  const [params, setParams] = useSearchParams()
  const role = params.get('role') === 'seller' ? 'seller' : 'buyer'
  const g = GUIDES[role]
  return (
    <div className="body">
      <div className="seg light" role="group" aria-label="Guide">
        <button className={role === 'buyer' ? 'on' : ''} onClick={() => setParams({ role: 'buyer' })}>{GUIDES.buyer.title[L]}</button>
        <button className={role === 'seller' ? 'on' : ''} onClick={() => setParams({ role: 'seller' })}>{GUIDES.seller.title[L]}</button>
      </div>
      <h1>{g.title[L]}</h1>
      <p className="small muted">{L === 'fr' ? 'À titre informatif seulement · Acoca Notaires' : 'For information only · Acoca Notaires'}</p>
      <div className="stack" style={{ gap: 10 }}>
        {g.sections[L].map(([h, body]) => (
          <section key={h} className={'guide-sec' + (/fraude|Fraud/.test(h) ? ' alert' : '')}>
            <b>{/fraude|Fraud/.test(h) && <ShieldAlert size={14} style={{ verticalAlign: -2, marginRight: 4 }} />}{h}</b>
            <p>{body}</p>
          </section>
        ))}
      </div>
      <h2 style={{ marginTop: 6 }}>{t(L, 'faq')}</h2>
      <div className="stack" style={{ gap: 6 }}>
        {FAQ[role][L].map(([q, a]) => <details key={q} className="faq"><summary>{q}</summary><p>{a}</p></details>)}
      </div>
      <p className="fraud-note">{t(L, 'fraud')}</p>
    </div>
  )
}
