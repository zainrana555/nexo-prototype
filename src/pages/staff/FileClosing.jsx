import { useState } from 'react'
import { Lock, Upload, Send, FileText, Copy, Download, Check, ExternalLink, ShieldCheck, Printer } from 'lucide-react'
import { useStore } from '../../store'
import { Badge, Modal } from '../../ui'
import { stepDone, stageInfo, fmtDate, money } from '../../logic'
import { FIRM, FCT, fileType } from '../../firm'
import { has } from '../../editions'
import { LockedNote } from '../../Locked'

export default function FileClosing({ file }) {
  const { state, dispatch, notify } = useStore()
  const [fct, setFct] = useState(false)
  const booked = stepDone(file, 'booking')
  const canSign = booked && stepDone(file, 'title')
  const canClose = stageInfo(file).key === 'procardex'
  const two = fileType(file.type).twoMeetings
  const summary = [
    `Dossier: ${file.id}`, `Type: ${file.type}`, `Client(s): ${file.clients.join(', ')}`, `Immeuble: ${file.addr}, ${file.city}`,
    `Prêteur: ${file.lender}${file.mortgage ? ` · ${money(file.mortgage)}` : ''}`,
    two ? `Hypothèque: ${file.mortgageBooking ? `${file.mortgageBooking.date} ${file.mortgageBooking.time}` : '—'} · Vente: ${file.booking ? `${file.booking.date} ${file.booking.time}` : '—'}` : `Signature: ${file.booking ? `${file.booking.date} ${file.booking.time}` : '—'}`,
    `Honoraires: ${money(file.contract.total)}`, `Notaire: ${file.notary} · Parajuriste: ${file.paralegal}`,
  ].join('\n')
  const copy = async () => { try { await navigator.clipboard.writeText(summary) } catch { /* blocked */ } notify('Procardex summary copied') }
  const exportCsv = () => {
    const rows = [['Dossier', 'Type', 'Clients', 'Adresse', 'Ville', 'Preteur', 'Hypotheque', 'RDV hypotheque', 'RDV vente', 'Honoraires', 'Notaire', 'Parajuriste'],
      [file.id, file.type, file.clients.join(' / '), file.addr, file.city, file.lender, file.mortgage ?? '', file.mortgageBooking ? `${file.mortgageBooking.date} ${file.mortgageBooking.time}` : '', file.booking ? `${file.booking.date} ${file.booking.time}` : '', file.contract.total?.toFixed(2) ?? '', file.notary, file.paralegal]]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = `procardex-${file.id}.csv`; a.click()
    notify('Procardex export downloaded')
  }

  return (
    <div className="grid-2">
      <section className="card stack">
        <div className="row between"><h2>1 · Signing</h2>{stepDone(file, 'closing') ? <Badge tone="ok">Signed</Badge> : <Badge tone="warn">To do</Badge>}</div>
        {two && <div className="kv"><span className="muted">Mortgage signing</span><span>{file.mortgageBooking ? `${fmtDate(file.mortgageBooking.date)} · ${file.mortgageBooking.time}` : 'Not booked'}</span></div>}
        <div className="kv"><span className="muted">{two ? 'Sale signing' : 'Signing'}</span><span>{file.booking ? `${fmtDate(file.booking.date)} · ${file.booking.time} · ${file.booking.mode}` : 'Not booked'}</span></div>
        <label className="check"><input type="checkbox" disabled={!canSign} checked={file.closing.consigno} onChange={() => dispatch({ type: 'closing/toggle', id: file.id, key: 'consigno', label: 'Deeds signed in Consigno' })} /> Deeds signed in Consigno</label>
        <label className="check"><input type="checkbox" disabled={!canSign} checked={file.closing.lenderReport} onChange={() => dispatch({ type: 'closing/toggle', id: file.id, key: 'lenderReport', label: 'Final report sent to lender' })} /> Final report sent to lender (Telus Assyst)</label>
        <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => notify('Opening Consigno: signed in through the secure tunnel (demo)')}><ExternalLink size={14} /> Open in Consigno</button>
        {!canSign && <p className="small muted row" style={{ gap: 6 }}><Lock size={13} /> Available once the due-diligence items are ticked in the checklist and all appointments are booked.</p>}
      </section>

      <section className="card stack">
        <div className="row between"><h2>2 · Title insurance (FCT)</h2>{file.fctSent ? <Badge tone="ok">Requested</Badge> : <Badge>Optional</Badge>}</div>
        <p className="small muted">FCT residential request, pre-filled from the file sheet and the parties. Review, then send or print.</p>
        {has(state, 'fct') ? <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => setFct(true)}><ShieldCheck size={15} /> Prepare FCT request</button> : <LockedNote feature="fct" compact />}
      </section>

      <section className="card stack">
        <div className="row between"><h2>3 · Final documents</h2>{file.docsPublished ? <Badge tone="ok">Published</Badge> : <Badge tone="warn">To do</Badge>}</div>
        {file.finalDocs.length === 0 ? (
          <button className="dropzone" disabled={!file.closing.consigno} onClick={() => { dispatch({ type: 'docs/upload', id: file.id }); notify('4 documents uploaded') }}>
            <Upload size={20} /><b>Upload executed deeds &amp; statements</b><span className="small muted">{file.closing.consigno ? 'Click to add the final PDFs' : 'Available after signing in Consigno'}</span>
          </button>
        ) : file.finalDocs.map((d) => <div key={d.name} className="kv"><span className="row" style={{ gap: 6 }}><FileText size={15} />{d.name}</span><span className="small muted">{d.size}</span></div>)}
        {file.finalDocs.length > 0 && !file.docsPublished && (
          <button className="btn btn-primary" onClick={() => { dispatch({ type: 'docs/publish', id: file.id }); notify('Published · client emailed a secure link') }}><Send size={16} /> Publish to client portal</button>
        )}
        {file.docsPublished && <p className="small muted">Client notified · {file.portalViewed ? '✓ downloaded by client' : 'not yet downloaded'} · links expire after 30 days (replaces JurisZone)</p>}
      </section>

      <section className="card stack">
        <div className="row between"><h2>4 · Procardex &amp; archive</h2>{file.procardex ? <Badge tone="ok">Closed</Badge> : <Badge tone="warn">To do</Badge>}</div>
        <p className="small muted">Procardex has no API. Copy this summary or export the CSV, then enter it in Procardex.</p>
        <pre className="summary">{summary}</pre>
        <div className="row">
          <button className="btn" onClick={copy}><Copy size={16} /> Copy summary</button>
          <button className="btn" onClick={exportCsv}><Download size={16} /> Export for Procardex (.csv)</button>
          <button className="btn btn-primary" disabled={!canClose} onClick={() => { dispatch({ type: 'procardex/done', id: file.id }); notify('File closed and archived') }}><Check size={16} /> Entered in Procardex · close file</button>
        </div>
      </section>

      {fct && <FctModal file={file} onClose={() => setFct(false)} onSend={() => { dispatch({ type: 'fct/send', id: file.id }); notify(`Title insurance request emailed to ${FCT.email} (demo)`); setFct(false) }} />}
    </div>
  )
}

function FctModal({ file, onClose, onSend }) {
  const sh = file.sheet ?? {}
  const yn = (v) => (v ? 'Oui' : 'Non')
  const rows = [
    ['Notaire / étude', `${file.notary} · ${FIRM.name}`], ['Adresse de l’étude', FIRM.address], ['Téléphone / télécopieur', `${FIRM.phone} / ${FIRM.fax}`],
    ['Acheteur / emprunteur', file.clients.join(', ')],
    ['Transaction', file.type === 'Refinance' ? 'Financement hypothécaire' : 'Achat – propriété existante'], ['Prix d’achat publié', sh.price ? `${sh.price} $` : '—'],
    ['Résidence unifamiliale', yn(file.propertyType === 'House')], ['Copropriété divise', yn(file.propertyType === 'Condo')],
    ['Unités (si multifamiliale)', file.propertyType?.startsWith('Multi') ? file.propertyType : '—'], ['Date prévue de la transaction', file.booking?.date ?? file.closingDate ?? '—'],
    ['Désignation cadastrale', sh.designation || '—'], ['Adresse de la propriété', `${file.addr}, ${file.city}`],
    ['Prêteur', file.lender], ['Montant publié de l’hypothèque', sh.mortgageAmount || (file.mortgage ? String(file.mortgage) : '—')], ['Rang', '1er'],
    ['Certificat de localisation', sh.colDate ? `Oui (${sh.colDate})` : 'À confirmer'], ['Taxes foncières', sh.tax_mun_paid && sh.tax_sch_paid ? 'Payées et à jour' : 'À vérifier'],
    ['Agent d’immeuble intermédiaire', sh.agentSeller || sh.agentBuyer ? `Oui (${[sh.agentSeller, sh.agentBuyer].filter(Boolean).join(', ')})` : 'Non'],
    ['Polices requises', 'Police prêteur et propriétaire · Français'],
  ]
  return (
    <Modal title="FCT – Demande d’assurance titres résidentielle" onClose={onClose} wide>
      <p className="small muted">To: {FCT.to} · {FCT.email} · fax {FCT.fax}. Fields come from the file; empty ones are highlighted.</p>
      <div className="fct-grid">{rows.map(([k, v]) => <div key={k} className={'fct-row' + (v === '—' || v === 'À confirmer' || v === 'À vérifier' ? ' missing' : '')}><span>{k}</span><b>{v}</b></div>)}</div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => window.print()}><Printer size={15} /> Print / PDF</button>
        <button className="btn btn-primary" onClick={onSend}><Send size={15} /> Send to FCT</button>
      </div>
    </Modal>
  )
}
