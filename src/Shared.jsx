import { useMemo, useState } from 'react'
import { Mail, MessageSquare, ZoomIn, ZoomOut, Check, X, RotateCcw } from 'lucide-react'
import { useStore } from './store'
import { Modal, Badge } from './ui'
import { accessOf } from './data'
import { isExpired } from './logic'

// Email / text composer used from leads and files. Templates are filtered by the user's role.
export function Composer({ onClose, to, lang = 'FR', fields, leadId, fileId }) {
  const { state, dispatch, notify } = useStore()
  const myRole = accessOf(state.auth)
  const usable = state.templates.filter((tp) => tp.group !== 'Contracts' && tp.group !== 'Internal' && (tp.access ?? []).includes(myRole))
  const [channel, setChannel] = useState('email')
  const [L, setL] = useState(lang)
  const [tplId, setTplId] = useState('')
  const fill = (txt) => Object.entries(fields).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v ?? ''), txt ?? '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const pick = (id, lang2 = L) => {
    setTplId(id)
    const tp = state.templates.find((x) => x.id === id)
    if (tp) { setSubject(fill(tp.subject[lang2])); setBody(fill(tp.body[lang2])) }
  }
  const sms = channel === 'sms'
  return (
    <Modal title={sms ? 'Send a text message' : 'Send an email'} onClose={onClose} wide>
      <div className="row between">
        <div className="seg light">
          <button className={!sms ? 'on' : ''} onClick={() => setChannel('email')}><Mail size={14} /> Email</button>
          {state.edition !== 'core' && <button className={sms ? 'on' : ''} onClick={() => setChannel('sms')}><MessageSquare size={14} /> Text</button>}
        </div>
        <div className="seg light"><button className={L === 'FR' ? 'on' : ''} onClick={() => { setL('FR'); tplId && pick(tplId, 'FR') }}>FR</button><button className={L === 'EN' ? 'on' : ''} onClick={() => { setL('EN'); tplId && pick(tplId, 'EN') }}>EN</button></div>
      </div>
      <div className="kv"><span className="muted">To</span><span>{to}</span></div>
      <label className="field"><span>Template ({usable.length} available for your role: {myRole})</span>
        <select className="select" value={tplId} onChange={(e) => pick(e.target.value)}>
          <option value="">— Blank message —</option>
          {['Leads', 'Files'].map((g) => <optgroup key={g} label={g}>{usable.filter((x) => x.group === g).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</optgroup>)}
        </select>
      </label>
      {!sms && <label className="field"><span>Subject</span><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></label>}
      <label className="field"><span>{sms ? 'Message' : 'Body'}</span><textarea className="input" rows={sms ? 4 : 11} value={sms ? body.slice(0, 320) : body} onChange={(e) => setBody(e.target.value)} /></label>
      {sms && <span className="small muted">{Math.min(body.length, 320)}/320 characters</span>}
      <p className="small muted">Fields like {'{{client}}'} and {'{{address}}'} were filled in automatically. Sent from Nexo through the firm’s mailbox; no need to open Outlook.</p>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!body.trim()} onClick={() => { dispatch({ type: 'comm/send', leadId, fileId, channel, subject: sms ? body.slice(0, 40) : subject || '(no subject)', body }); notify(sms ? 'Text message sent' : 'Email sent'); onClose() }}>Send</button>
      </div>
    </Modal>
  )
}

export const composerFields = (o) => ({
  client: o.first, adresse: o.address, address: o.address, dossier: o.file, file: o.file, total: o.total, notary: o.notary,
  lien: '[lien sécurisé]', link: '[secure link]', signature: o.signature ?? 'Acoca Notaires', montant: o.total, amount: o.total,
})

// Full-screen ID viewer: front/back, zoom, automatic-reading results, approve/reject.
export function IdViewer({ doc, party, onClose, onDecide }) {
  const [side, setSide] = useState('front')
  const [zoom, setZoom] = useState(1)
  const expired = isExpired(doc.exp)
  const number = useMemo(() => (doc.type === 'Passport' ? 'AB' : doc.type === "Driver's licence" ? 'G' : 'GAGE') + String(Math.abs([...party.name].reduce((n, c) => n * 31 + c.charCodeAt(0), 7)) % 1e7).padStart(7, '0'), [doc.type, party.name])
  return (
    <div className="viewer-backdrop" role="dialog" aria-modal="true" aria-label={`${doc.type} – ${party.name}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="viewer">
        <div className="row between viewer-bar">
          <b>{doc.type} · {party.name}</b>
          <div className="row">
            <div className="seg"><button className={side === 'front' ? 'on' : ''} onClick={() => setSide('front')}>Front</button><button className={side === 'back' ? 'on' : ''} onClick={() => setSide('back')}>Back</button></div>
            <button className="icon-btn light" aria-label="Zoom out" onClick={() => setZoom(Math.max(0.6, zoom - 0.2))}><ZoomOut size={18} /></button>
            <button className="icon-btn light" aria-label="Zoom in" onClick={() => setZoom(Math.min(2, zoom + 0.2))}><ZoomIn size={18} /></button>
            <button className="icon-btn light" aria-label="Reset zoom" onClick={() => setZoom(1)}><RotateCcw size={16} /></button>
            <button className="icon-btn light" aria-label="Close" onClick={onClose}><X size={20} /></button>
          </div>
        </div>
        <div className="viewer-stage">
          <div className={'id-mock ' + side} style={{ transform: `scale(${zoom})` }}>
            {side === 'front' ? (
              <>
                <div className="idm-head">{doc.type === 'Passport' ? 'CANADA · PASSPORT / PASSEPORT' : doc.type === "Driver's licence" ? 'QUÉBEC · PERMIS DE CONDUIRE' : 'RAMQ · CARTE D’ASSURANCE MALADIE'}</div>
                <div className="idm-body">
                  <div className="idm-photo" />
                  <div className="idm-lines">
                    <span>NOM / NAME</span><b>{party.name.toUpperCase()}</b>
                    <span>NO</span><b>{number}</b>
                    <span>EXPIRATION</span><b className={expired ? 'bad' : ''}>{doc.exp}</b>
                  </div>
                </div>
                {doc.type === 'Passport' && <div className="idm-mrz">{`P<CAN${party.name.toUpperCase().replace(/\s+/g, '<')}<<<<<<<<<<`}</div>}
              </>
            ) : (
              <div className="idm-back"><div className="idm-barcode" /><span>Security features · hologram · UV ink</span></div>
            )}
          </div>
        </div>
        <div className="viewer-foot">
          <div className="row" style={{ gap: 18 }}>
            <span className="small"><span className="ok">✓</span> Document type recognised</span>
            <span className="small"><span className="ok">✓</span> Name matches the file</span>
            <span className={'small ' + (expired ? 'warn' : '')}>{expired ? '⚠ Expired' : <><span className="ok">✓</span> Not expired</>} ({doc.exp})</span>
            <span className="small"><span className="ok">✓</span> Front and back provided</span>
            <Badge>{expired ? 'expired' : doc.review}</Badge>
          </div>
          {onDecide && !expired && doc.review === 'pending' && (
            <div className="row">
              <button className="btn" onClick={() => { onDecide('rejected'); onClose() }}><X size={15} /> Reject</button>
              <button className="btn btn-primary" onClick={() => { onDecide('approved'); onClose() }}><Check size={15} /> Approve</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
