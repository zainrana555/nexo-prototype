import { useState } from 'react'
import { FileText, Mail, Signature, Plus, Lock, Users } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Modal, Tabs, Badge } from '../../ui'
import { ROLES, accessOf } from '../../data'
import { can } from '../../logic'

const FIELDS = ['{{client}}', '{{address}}', '{{file}}', '{{total}}', '{{notary}}', '{{link}}', '{{amount}}', '{{signature}}']
const RECIPIENTS = ['Client', 'Lender', 'Notary + paralegal', 'Seller’s notary', 'Insurer']

export default function Templates() {
  const { state } = useStore()
  const [group, setGroup] = useState('All')
  const [edit, setEdit] = useState(null)
  const editable = can(state, 'templates.manage')
  const myRole = accessOf(state.auth)
  const groups = ['All', 'Leads', 'Files', 'Contracts', 'Internal']
  const list = state.templates.filter((t) => group === 'All' || t.group === group)
  const blank = { id: null, group: 'Files', name: '', recipients: 'Client', access: ROLES, subject: { FR: '', EN: '' }, body: { FR: '', EN: '' } }

  return (
    <>
      <PageHeader title="Templates" sub="Bilingual emails and service contracts with dynamic {{fields}}. Replaces the Word documents."
        actions={<button className="btn btn-primary" disabled={!editable} onClick={() => setEdit(blank)}><Plus size={16} /> New template</button>} />
      {!editable && <p className="banner neutral small row" style={{ gap: 6 }}><Lock size={14} /> Your role can use templates but not edit them.</p>}
      <Tabs value={group} onChange={setGroup} tabs={groups.map((g) => ({ key: g, label: g, count: g === 'All' ? state.templates.length : state.templates.filter((t) => t.group === g).length }))} />
      <div className="tpl-grid">
        {list.map((t) => {
          const Icon = t.group === 'Contracts' ? Signature : Mail
          const restricted = (t.access ?? ROLES).length < ROLES.length
          const usable = (t.access ?? ROLES).includes(myRole)
          return (
            <button key={t.id} className={'tpl-card' + (usable ? '' : ' locked')} onClick={() => setEdit(t)}>
              <div className="row between"><span className="tpl-icon"><Icon size={18} /></span><span className="row" style={{ gap: 4 }}>{restricted && <Badge tone="warn">Restricted</Badge>}<Badge tone="blue">FR</Badge><Badge tone="blue">EN</Badge></span></div>
              <b>{t.name}</b>
              <span className="small muted">{t.subject.FR}</span>
              <span className="small row" style={{ gap: 4 }}><Users size={12} /> To: {t.recipients ?? 'Client'}</span>
              <span className="tpl-snippet">{(t.body.FR ?? '').slice(0, 90)}…</span>
            </button>
          )
        })}
      </div>
      {edit && <Editor tpl={edit} readOnly={!editable} onClose={() => setEdit(null)} />}
    </>
  )
}

function Editor({ tpl, onClose, readOnly }) {
  const { dispatch, notify } = useStore()
  const [lang, setLang] = useState('FR')
  const [t, setT] = useState({ access: ROLES, recipients: 'Client', ...tpl })
  const [testTo, setTestTo] = useState('nathalie@etude-demo.ca')
  const insert = (f) => setT({ ...t, body: { ...t.body, [lang]: t.body[lang] + ' ' + f } })
  const toggleRole = (r) => setT({ ...t, access: t.access.includes(r) ? t.access.filter((x) => x !== r) : [...t.access, r] })
  return (
    <Modal title={t.id ? t.name : 'New template'} onClose={onClose} wide>
      <fieldset disabled={readOnly} className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="grid-2">
          <label className="field"><span>Name</span><input className="input" value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} /></label>
          <label className="field"><span>Group</span><select className="select" value={t.group} onChange={(e) => setT({ ...t, group: e.target.value })}>{['Leads', 'Files', 'Contracts', 'Internal'].map((g) => <option key={g}>{g}</option>)}</select></label>
          <label className="field"><span>Recipients</span><select className="select" value={t.recipients} onChange={(e) => setT({ ...t, recipients: e.target.value })}>{RECIPIENTS.map((r) => <option key={r}>{r}</option>)}</select></label>
          <div className="field"><span>Who can use it</span><div className="row" style={{ gap: 10 }}>{ROLES.map((r) => <label key={r} className="check small" style={{ minHeight: 0 }}><input type="checkbox" checked={t.access.includes(r)} onChange={() => toggleRole(r)} />{r}</label>)}</div></div>
        </div>
        <div className="row between">
          <div className="seg light"><button type="button" className={lang === 'FR' ? 'on' : ''} onClick={() => setLang('FR')}>Français</button><button type="button" className={lang === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>English</button></div>
          <span className="small muted row" style={{ gap: 4 }}><FileText size={14} /> The property address is added to client email subjects automatically.</span>
        </div>
        <label className="field"><span>Subject</span><input className="input" value={t.subject[lang]} onChange={(e) => setT({ ...t, subject: { ...t.subject, [lang]: e.target.value } })} /></label>
        <label className="field"><span>Body</span><textarea className="input" rows={10} value={t.body[lang]} onChange={(e) => setT({ ...t, body: { ...t.body, [lang]: e.target.value } })} /></label>
        <div className="row"><span className="small muted">Insert field:</span>{FIELDS.map((f) => <button type="button" key={f} className="chip-btn" onClick={() => insert(f)}>{f}</button>)}</div>
      </fieldset>
      <div className="row between">
        <span className="row"><label><span className="sr-only">Test recipient</span><input className="input" style={{ minHeight: 34, width: 230 }} value={testTo} onChange={(e) => setTestTo(e.target.value)} /></label><button className="btn btn-sm" onClick={() => notify(`Test email sent to ${testTo} (demo)`)}>Send test</button></span>
        <span className="row">
          <button className="btn" onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</button>
          {!readOnly && <button className="btn btn-primary" disabled={!t.name.trim()} onClick={() => { dispatch(t.id ? { type: 'template/save', template: t } : { type: 'template/add', template: t }); notify(t.id ? 'Template saved' : 'Template created'); onClose() }}>{t.id ? 'Save template' : 'Create template'}</button>}
        </span>
      </div>
    </Modal>
  )
}
