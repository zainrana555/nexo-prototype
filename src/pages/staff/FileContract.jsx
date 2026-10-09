import { isCore } from '../../editions'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Printer, CircleCheck } from 'lucide-react'
import { useStore } from '../../store'
import { Modal } from '../../ui'
import { computeFees, defaultFeeSelection, money } from '../../logic'
import { CONTRACTS, CONTRACT_CLAUSES, DISBURSEMENTS, FIRM, fileType } from '../../firm'

const CATS = ['Residential', 'Virtual bank', 'Multi-residential', 'Commercial', 'Private lender', 'Wills', 'Mandates', 'Packages', 'Successions']

// Service contract built like the firm's Word templates: services, fee, itemized disbursements, taxes, total, clauses.
export default function FileContract({ file }) {
  const { state, dispatch, notify } = useStore()
  const items = state.feeItems
  const seller = file.parties.find((p) => p.answers?.mortgagesToDischarge)
  const [o, setO] = useState(() => file.contract.options?.sel?.disb ? file.contract.options : {
    lang: file.lang, variant: fileType(file.type).contract,
    sel: defaultFeeSelection(file, items, { remote: file.parties.some((p) => p.liveness === 'Passed'), corporate: file.clientType === 'Corporation', radiations: Math.max(0, (seller?.answers.mortgagesToDischarge.length ?? 0) - 1) }),
  })
  const [confirm, setConfirm] = useState(false)
  const fees = computeFees(o.sel, items)
  const fr = o.lang === 'FR'
  const L = fr ? 'fr' : 'en'
  const ct = CONTRACTS[o.variant]
  const locked = file.contract.sent
  const setSel = (sel) => setO({ ...o, sel })
  const setQty = (id, v) => setSel({ ...o.sel, qty: { ...o.sel.qty, [id]: Math.max(0, Number(v) || 0) } })
  const setVariant = (variant) => setO({ ...o, variant, sel: { ...o.sel, disb: (DISBURSEMENTS[variant] ?? []).map((d) => ({ ...d, on: true })) } })
  const m = (n) => money(n, L)
  const many = file.clients.length > 1 || file.parties.length > 1
  const date = new Date().getFullYear()

  return (
    <>
      {file.contract.signed && <p className="banner ok row" style={{ gap: 6 }}><CircleCheck size={16} /> Signed electronically by {file.contract.signedBy ?? file.clients.join(' & ')}.</p>}
      {file.contract.sent && !file.contract.signed && (
        <div className="banner info row between">
          <span>Out for e-signature since {file.contract.sentAt ?? 'today'}. Automatic reminder after 3 days.</span>
          {file.isDemo ? <Link to="/client">Open Émilie’s inbox to sign →</Link> : <button className="btn btn-sm" onClick={() => { dispatch({ type: 'contract/sign', id: file.id, signer: file.clients[0] }); notify('Simulated client signature') }}>Simulate signature</button>}
        </div>
      )}
      <div className="split">
        <section className="card stack side" style={{ flexBasis: 400 }}>
          <h2>Fees</h2>
          <fieldset disabled={locked} className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 8 }}>
            <label className="field"><span>Contract template</span>
              <select className="select" value={o.variant} onChange={(e) => setVariant(e.target.value)}>{Object.entries(CONTRACTS).map(([k, c]) => <option key={k} value={k}>{c.name}</option>)}</select>
            </label>
            <span className="small muted">Based on: {ct.files}</span>
            <label className="field"><span>Published price (fee table)</span>
              <select className="select" value={o.sel.base} onChange={(e) => setSel({ ...o.sel, base: e.target.value })}>
                {CATS.map((c) => <optgroup key={c} label={c}>{items.filter((i) => i.kind === 'base' && i.category === c).map((b) => <option key={b.id} value={b.id}>{b.label} · {money(b.amount)}{b.deposit ? ' · deposit' : ''}</option>)}</optgroup>)}
              </select>
            </label>
            {items.filter((x) => x.kind === 'unit' && x.amount > 0).map((x) => (
              <label key={x.id} className="row small" style={{ justifyContent: 'space-between' }}>{x.label} ({money(x.amount)} each)<input className="input" type="number" min="0" max="9" style={{ width: 70, minHeight: 32 }} value={o.sel.qty[x.id] ?? 0} onChange={(e) => setQty(x.id, e.target.value)} /></label>
            ))}
            {items.filter((x) => x.kind === 'option' && x.amount > 0).map((x) => (
              <label key={x.id} className="check small" style={{ minHeight: 26 }}><input type="checkbox" checked={(o.sel.qty[x.id] ?? 0) > 0} onChange={(e) => setQty(x.id, e.target.checked ? 1 : 0)} /> {x.label} · {money(x.amount)}</label>
            ))}
            <span className="small muted" style={{ marginTop: 4 }}>Disbursements (from the {ct.name.toLowerCase()} template)</span>
            {o.sel.disb.map((d, i) => (
              <label key={i} className="check small disb-line" style={{ minHeight: 26 }}>
                <input type="checkbox" checked={d.on} onChange={(e) => setSel({ ...o.sel, disb: o.sel.disb.map((x, j) => (j === i ? { ...x, on: e.target.checked } : x)) })} />
                <span className="grow">{d[L]}</span><span className="mono">{money(d.amount)}</span><span className={'tax-tag ' + (d.taxable ? '' : 'nt')}>{d.taxable ? 'T' : 'NT'}</span>
              </label>
            ))}
            <label className="field"><span>Language</span><select className="select" value={o.lang} onChange={(e) => setO({ ...o, lang: e.target.value })}><option value="FR">Français</option><option value="EN">English</option></select></label>
          </fieldset>
          <div className="stack" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 12, gap: 4 }}>
            <div className="kv small"><span>Fees</span><span className="mono">{money(fees.fees)}</span></div>
            <div className="kv small"><span>Taxable disbursements</span><span className="mono">{money(fees.disbTax)}</span></div>
            <div className="kv small"><span>Non-taxable disbursements</span><span className="mono">{money(fees.disbNonTax)}</span></div>
            <div className="kv small muted"><span>GST 5% + QST 9.975%</span><span className="mono">{money(fees.gst + fees.qst)}</span></div>
            <div className="kv total"><span>Total</span><span className="mono">{money(fees.total)}</span></div>
            {fees.deposit && <span className="badge warn" style={{ alignSelf: 'flex-start' }}>Private lender / will search: deposit required</span>}
          </div>
          {!locked && <button className="btn btn-primary" onClick={() => setConfirm(true)}><Send size={16} /> Send for e-signature</button>}
          <button className="btn" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
        </section>

        <section className="card main" style={{ padding: 0 }}>
          <div className="contract-paper cs">
            <div className="cs-head"><b>{FIRM.name.toUpperCase()}</b><span>{FIRM.tagline[L]}</span><span>{FIRM.address}</span><span>{fr ? 'Téléphone' : 'Phone'} : {FIRM.phone} / {fr ? 'Télécopieur' : 'Fax'} : {FIRM.fax}</span></div>
            <h3 style={{ textAlign: 'center', fontSize: 17, margin: '6px 0 0' }}>{fr ? 'CONTRAT DE SERVICES PROFESSIONNELS' : 'PROFESSIONAL SERVICES AGREEMENT'}</h3>
            <p style={{ textAlign: 'center', margin: 0 }}>{file.notary}, {fr ? 'notaire' : 'notary'}</p>
            <p><b>{o.variant === 'succession' ? 'SUCCESSION' : fr ? 'PROPRIÉTÉ' : 'PROPERTY'} :</b> <span className="fill">{o.variant === 'succession' ? file.clients[0] : `${file.addr}, ${file.city}`}</span></p>
            <p>{fr ? (many ? 'Nous, soussignés, ' : 'Je, soussigné(e), ') : (many ? 'We, the undersigned, ' : 'I, the undersigned, ')}<span className="fill">{file.clients.join(fr ? ' et ' : ' and ')}</span>{fr ? `, ${many ? 'retenons' : 'retiens'} les services professionnels de ${file.notary}, notaire, et lui ${many ? 'confions' : 'confie'} le mandat de préparer toute la documentation nécessaire, soit :` : `, retain the professional services of ${file.notary}, notary, and entrust them with preparing all necessary documentation, namely:`}</p>
            <ul className="cs-list">{ct.services[L].map((x) => <li key={x}>{x};</li>)}</ul>
            <p>{fr ? 'À cette fin, ' : 'To that end, '}{fr ? (many ? 'nous nous engageons' : 'je m’engage') : (many ? 'we agree' : 'I agree')} {fr ? 'à lui payer ses honoraires, soit la somme de ' : 'to pay the fees in the amount of '}<span className="fill">{m(fees.fees)}</span>{fr ? ', laquelle exclut les taxes applicables (TPS et TVQ), les déboursés non taxables et les déboursés taxables, soit :' : ', excluding applicable taxes (GST and QST), non-taxable and taxable disbursements, namely:'}</p>
            <p style={{ margin: 0 }}><b>1.1 {fr ? 'Déboursés non taxables' : 'Non-taxable disbursements'} ({m(fees.disbNonTax)})</b></p>
            <ul className="cs-list">{fees.disb.filter((d) => !d.taxable).map((d, i) => <li key={i}>{d[L]} ({m(d.amount)});</li>)}</ul>
            <p style={{ margin: 0 }}><b>1.2 {fr ? 'Déboursés taxables' : 'Taxable disbursements'} ({m(fees.disbTax)} + {fr ? 'taxes' : 'taxes'})</b></p>
            <ul className="cs-list">{fees.disb.filter((d) => d.taxable).map((d, i) => <li key={i}>{d[L]} ({m(d.amount)});</li>)}</ul>
            <p>{fr ? 'Taxes applicables sur les honoraires et déboursés taxables : TPS ' : 'Applicable taxes on fees and taxable disbursements: GST '}<span className="fill">{m(fees.gst)}</span>{fr ? ' · TVQ ' : ' · QST '}<span className="fill">{m(fees.qst)}</span>.</p>
            <p><b>{fr ? 'Donc, la note d’honoraires totalisera la somme de ' : 'The total statement of fees will therefore be '}<span className="fill">{m(fees.total)}</span> {ct.payment[L]}</b></p>
            <ol className="cs-clauses">{CONTRACT_CLAUSES[L].map((c) => <li key={c}>{c}</li>)}</ol>
            <p>{fr ? `Reconnu et accepté ce ______ jour de __________ ${date}.` : `Acknowledged and accepted this ______ day of __________ ${date}.`}</p>
            <div className="grid-2" style={{ gap: 28, marginTop: 12 }}>
              {[...file.clients, `${file.notary}, ${fr ? 'notaire' : 'notary'}`].map((n) => (
                <div key={n} className="sig-line">
                  {file.contract.signed && !n.includes(file.notary) ? <span className="sig">{file.contract.signedBy ?? n}</span> : <span className="sig placeholder">&nbsp;</span>}
                  <span className="small">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {confirm && (
        <Modal title="Send for e-signature" onClose={() => setConfirm(false)}>
          <p>Send the {o.lang} “{ct.name}” contract (<b>{money(fees.total)}</b>) for signature to:</p>
          {file.parties.map((p) => <div key={p.name} className="kv card" style={{ padding: 12 }}><span>{p.name}</span><span className="muted">{p.email}</span></div>)}
          <p className="small muted">{isCore(state) ? 'Signed directly in Nexo with the built-in e-signature (name, date, time and IP recorded).' : 'Today the firm uses Adobe Sign; any e-signature provider can be connected.'}</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setConfirm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { dispatch({ type: 'contract/send', id: file.id, total: fees.total, totalLabel: money(fees.total), lang: o.lang, options: o }); setConfirm(false); notify('Contract sent for e-signature') }}><Send size={16} /> Send</button>
          </div>
        </Modal>
      )}
    </>
  )
}
