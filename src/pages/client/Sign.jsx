import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { money } from '../../logic'
import { DEMO_FILE } from '../../data'
import { NotYet } from './Mandate'

export default function Sign() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const fr = L === 'fr'
  const file = state.files.find((f) => f.id === DEMO_FILE)
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)

  if (!file || !file.contract.sent) return <NotYet L={L} />
  if (file.contract.signed) {
    return (
      <div className="body" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="big-check" aria-hidden="true">✓</div>
        <h1>{t(L, 'signed')}</h1>
        <p className="muted">{t(L, 'signedSub')}</p>
        <button className="btn btn-primary btn-block" onClick={() => nav('/client/file')}>{t(L, 'toFile')}</button>
      </div>
    )
  }
  const party = file.parties[0].name

  return (
    <>
      <div className="body">
        <div>
          <h1>{t(L, 'signTitle')}</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{t(L, 'signSub')}</p>
        </div>
        <div className="doc-preview">
          <b style={{ textAlign: 'center', display: 'block' }}>{fr ? 'CONVENTION DE SERVICES PROFESSIONNELS' : 'PROFESSIONAL SERVICES AGREEMENT'}</b>
          <p>{fr ? 'Entre Acoca Notaires inc. et ' : 'Between Acoca Notaires inc. and '}<b>{party}</b>{fr ? ', pour l’achat de l’immeuble situé au ' : ', for the purchase of the property at '}{file.addr}, {file.city}.</p>
          <p>{fr ? 'Le notaire s’engage à effectuer la vérification des titres, préparer et recevoir l’acte de vente et l’acte d’hypothèque, et remettre les documents finaux.' : 'The notary will perform the title search, prepare and execute the deed of sale and mortgage, and deliver the final documents.'}</p>
          <p>{fr ? 'Honoraires payables par virement ou traite bancaire avant la signature.' : 'Fees payable by wire transfer or bank draft before signing.'}</p>
          <div className="ghost-line" style={{ width: '90%' }} /><div className="ghost-line" style={{ width: '75%' }} />
        </div>
        <div className="kv" style={{ fontSize: 16 }}><span>{t(L, 'signTotal')}</span><b className="mono">{money(file.contract.total, L)}</b></div>
        <label className="field"><span>{t(L, 'signType')}</span><input className="input sig-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={party} /></label>
        <label className="check small" style={{ alignItems: 'flex-start' }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />{t(L, 'signAgree')}</label>
      </div>
      <footer>
        <button className="btn btn-primary btn-block" disabled={!agree || name.trim().length < 3} onClick={() => { dispatch({ type: 'contract/sign', id: DEMO_FILE, signer: name.trim() }); notify(fr ? 'Convention signée' : 'Contract signed') }}>{t(L, 'signBtn')}</button>
      </footer>
    </>
  )
}
