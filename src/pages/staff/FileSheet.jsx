import { Send, Check } from 'lucide-react'
import { useStore } from '../../store'
import { Badge } from '../../ui'
import { TRACKED_DOCS, PROPERTY_TYPES, LENDER_TYPES } from '../../firm'
import { validIds, money } from '../../logic'

// The firm's "Fiche Dossier IMMOBILIER", as a live form on the file.
export default function FileSheet({ file }) {
  const { dispatch, notify } = useStore()
  const sh = file.sheet ?? {}
  const set = (key) => (e) => dispatch({ type: 'sheet/set', id: file.id, key, value: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const tr = file.tracker ?? {}
  const realEstate = !['Succession', 'Wills & mandates'].includes(file.type)

  return (
    <div className="stack-lg">
      <section className="card stack">
        <div className="row between">
          <h2>Fiche dossier · {file.id}</h2>
          <div className="seg light">{['En ligne', 'En personne'].map((v) => <button key={v} className={(sh.mode ?? 'En ligne') === v ? 'on' : ''} onClick={() => dispatch({ type: 'sheet/set', id: file.id, key: 'mode', value: v })}>{v}</button>)}</div>
        </div>
        <div className="grid-4">
          <In sh={sh} set={set} k="opened" label="Ouverture du dossier" type="date" />
          <In sh={sh} set={set} k="occupation" label="Date d’occupation" type="date" />
          <In sh={sh} set={set} k="handover" label="Remise à la collaboratrice" type="date" />
          <In sh={sh} set={set} k="timeline" label="Échéancier" type="date" />
          <In sh={sh} set={set} k="mortgageDate" label="Date d’hypothèque" type="date" />
          <In sh={sh} set={set} k="saleDate" label="Date de vente" type="date" />
          <In sh={sh} set={set} k="adjustDate" label="Date d’ajustements" type="date" />
        </div>
      </section>

      {realEstate && (
        <div className="split">
          <section className="card stack main">
            <h2>Immeuble</h2>
            <div className="grid-2">
              <label className="field"><span>Type de propriété</span><select className="select" value={file.propertyType ?? 'Condo'} onChange={(e) => dispatch({ type: 'file/set', id: file.id, key: 'propertyType', value: e.target.value, label: 'Property type' })}>{PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}</select></label>
              <label className="field"><span>Type de prêteur</span><select className="select" value={file.lenderType ?? 'Conventional'} onChange={(e) => dispatch({ type: 'file/set', id: file.id, key: 'lenderType', value: e.target.value, label: 'Lender type' })}>{LENDER_TYPES.map((p) => <option key={p}>{p}</option>)}</select></label>
              <In sh={sh} set={set} k="designation" label="Désignation (lot / cadastre)" ph="Lot 1 234 567, cadastre du Québec" />
              <In sh={sh} set={set} k="price" label="Prix de vente ($)" />
              <In sh={sh} set={set} k="mortgageAmount" label="Montant d’hypothèque ($)" ph={file.mortgage ? String(file.mortgage) : ''} />
              <In sh={sh} set={set} k="condoFees" label="Frais de condo ($/mois)" />
            </div>
            <h3 className="small muted">CERTIFICAT DE LOCALISATION</h3>
            <div className="grid-4">
              <In sh={sh} set={set} k="colFrom" label="Commandé de" />
              <In sh={sh} set={set} k="surveyor" label="Arpenteur" />
              <In sh={sh} set={set} k="colDate" label="Date" type="date" />
              <In sh={sh} set={set} k="colMinute" label="Minute" />
            </div>
            <div className="grid-2">
              <YN sh={sh} set={set} k="affidavit" label="Affidavit requis" />
              <YN sh={sh} set={set} k="titleIns" label="Assurance-titre" />
              <YN sh={sh} set={set} k="mandateLimit" label="Limitation de mandat" />
              <YN sh={sh} set={set} k="preventive" label="Clause préventive" />
              <YN sh={sh} set={set} k="addrNotice" label="Avis d’adresse" />
            </div>
          </section>
          <aside className="side stack-lg">
            <section className="card stack" style={{ gap: 8 }}>
              <h2>Taxes</h2>
              {[['mun', 'Municipales'], ['sch', 'Scolaires']].map(([k, l]) => (
                <div key={k} className="stack" style={{ gap: 4 }}>
                  <b className="small">{l}</b>
                  <div className="grid-2" style={{ gap: 8 }}>
                    <In sh={sh} set={set} k={`tax_${k}`} label="Montant ($)" />
                    <In sh={sh} set={set} k={`tax_${k}_arrears`} label="Arrérages ($)" />
                  </div>
                  <label className="check small"><input type="checkbox" checked={!!sh[`tax_${k}_paid`]} onChange={set(`tax_${k}_paid`)} /> Payées</label>
                </div>
              ))}
            </section>
            <section className="card stack" style={{ gap: 8 }}>
              <h2>Banque</h2>
              <YN sh={sh} set={set} k="bmoScotia" label="Téléchargement BMO / Scotia" />
              <YN sh={sh} set={set} k="rbcHold" label="Retenue 250 $ à rajouter (RBC / CIBC)" />
            </section>
          </aside>
        </div>
      )}

      <section className="card stack">
        <h2>Parties</h2>
        <div className="table-wrap" style={{ boxShadow: 'none' }}>
          <table>
            <thead><tr><th>Nom / Cie</th><th>Rôle</th><th>DDN</th><th>Contrat de service</th><th>ID (2)</th><th>Passeport canadien</th><th>État civil · documents</th></tr></thead>
            <tbody>
              {file.parties.map((p) => {
                const ids = validIds(p)
                return (
                  <tr key={p.name} style={{ cursor: 'default' }}>
                    <td><b>{p.name}</b>{p.corporate && <> <Badge tone="purple">Cie</Badge></>}</td>
                    <td>{p.role}</td>
                    <td><input className="input" style={{ minHeight: 32, width: 130 }} type="date" value={sh[`dob_${p.name}`] ?? ''} onChange={set(`dob_${p.name}`)} aria-label={`Date of birth of ${p.name}`} /></td>
                    <td><span className="mono small">{file.contract.total ? money(file.contract.total) : '—'}</span> <DR d={file.contract.sent} r={file.contract.signed} /></td>
                    <td><DR d={p.questionnaire > 0 || p.ids.length > 0} r={ids.filter((i) => i.review === 'approved').length >= 2} /></td>
                    <td><DR d={p.questionnaire > 0} r={!!p.passport || ids.some((i) => i.type === 'Passport')} /></td>
                    <td>{p.marital ?? '—'} {p.civilDocs?.length ? <span className="small ok">· {p.civilDocs.length} doc(s)</span> : null}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted">D = demandé (requested), R = reçu (received). Filled automatically from the questionnaire, ID review and contract.</p>
      </section>

      <div className="split">
        <section className="card stack main">
          <h2>Suivi des documents demandés</h2>
          <div className="table-wrap" style={{ boxShadow: 'none' }}>
            <table>
              <thead><tr><th>Document</th><th>De</th><th>Demandé</th><th>Reçu</th><th /></tr></thead>
              <tbody>
                {TRACKED_DOCS.map((d) => {
                  const t = tr[d.id] ?? {}
                  return (
                    <tr key={d.id} style={{ cursor: 'default' }}>
                      <td>{d.label}</td><td className="muted small">{d.from}</td>
                      <td>{t.req ? <span className="small">{t.req}</span> : <button className="btn btn-sm" onClick={() => { dispatch({ type: 'tracker/set', id: file.id, doc: d.id, field: 'req', label: d.label }); notify(`${d.label} requested from ${d.from.toLowerCase()} · automatic reminder in 3 days`) }}><Send size={13} /> Request</button>}</td>
                      <td>{t.rec ? <Badge tone="ok">{t.rec}</Badge> : t.req ? <button className="btn btn-sm" onClick={() => { dispatch({ type: 'tracker/set', id: file.id, doc: d.id, field: 'rec', label: d.label }); notify(`${d.label} received`) }}><Check size={13} /> Received</button> : <span className="muted small">—</span>}</td>
                      <td>{t.req && !t.rec && <span className="small warn">Reminder auto in 3 days</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="side card stack" style={{ gap: 8 }}>
          <h2>Contacts</h2>
          <In sh={sh} set={set} k="agentSeller" label="Agent vendeur" />
          <In sh={sh} set={set} k="agentBuyer" label="Agent acheteur" />
          <In sh={sh} set={set} k="syndicate" label="Syndicat / gestion" />
          <In sh={sh} set={set} k="lenderRep" label="Représentant bancaire" />
          <In sh={sh} set={set} k="mortgageBroker" label="Courtier hypothécaire" />
          <label className="field"><span>Notes</span><textarea className="input" rows={3} value={sh.notes ?? ''} onChange={set('notes')} /></label>
        </aside>
      </div>
    </div>
  )
}

function In({ sh, set, k, label, type = 'text', ph }) {
  return <label className="field"><span>{label}</span><input className="input" type={type} placeholder={ph} value={sh[k] ?? ''} onChange={set(k)} /></label>
}
function YN({ sh, set, k, label }) {
  return (
    <div className="yn"><span>{label}</span><div className="seg light">{['Oui', 'Non'].map((v) => <button key={v} className={sh[k] === v ? 'on' : ''} onClick={() => set(k)({ target: { value: v } })}>{v}</button>)}</div></div>
  )
}
function DR({ d, r }) {
  return <span className="dr" aria-label={`Requested ${d ? 'yes' : 'no'}, received ${r ? 'yes' : 'no'}`}><span className={d ? 'on' : ''}>D</span><span className={r ? 'on' : ''}>R</span></span>
}
