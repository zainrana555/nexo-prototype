import { useState } from 'react'
import { FileText, Mail, FileSignature } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Modal, Tabs, Badge } from '../../ui'

const FIELDS = ['{{client}}', '{{total}}', '{{link}}', '{{file}}', '{{signature}}', '{{missing}}']

export default function Templates() {
  const { state } = useStore()
  const [group, setGroup] = useState('All')
  const [edit, setEdit] = useState(null)
  const groups = ['All', 'Leads', 'Files', 'Contracts']
  const list = state.templates.filter((t) => group === 'All' || t.group === group)

  return (
    <>
      <PageHeader title="Templates" sub="Bilingual emails and service contracts. Replaces the Word documents." />
      <Tabs value={group} onChange={setGroup} tabs={groups.map((g) => ({ key: g, label: g, count: g === 'All' ? state.templates.length : state.templates.filter((t) => t.group === g).length }))} />
      <div className="tpl-grid">
        {list.map((t) => {
          const Icon = t.group === 'Contracts' ? FileSignature : Mail
          return (
            <button key={t.id} className="tpl-card" onClick={() => setEdit(t)}>
              <div className="row between"><span className="tpl-icon"><Icon size={18} /></span><span className="row" style={{ gap: 4 }}><Badge tone="blue">FR</Badge><Badge tone="blue">EN</Badge></span></div>
              <b>{t.name}</b>
              <span className="small muted">{t.subject.FR}</span>
              <span className="tpl-snippet">{t.body.FR.slice(0, 90)}…</span>
            </button>
          )
        })}
      </div>
      {edit && <Editor tpl={edit} onClose={() => setEdit(null)} />}
    </>
  )
}

function Editor({ tpl, onClose }) {
  const { dispatch, notify } = useStore()
  const [lang, setLang] = useState('FR')
  const [t, setT] = useState(tpl)
  const insert = (f) => setT({ ...t, body: { ...t.body, [lang]: t.body[lang] + ' ' + f } })
  return (
    <Modal title={t.name} onClose={onClose} wide>
      <div className="row between">
        <div className="seg light"><button className={lang === 'FR' ? 'on' : ''} onClick={() => setLang('FR')}>Français</button><button className={lang === 'EN' ? 'on' : ''} onClick={() => setLang('EN')}>English</button></div>
        <span className="small muted row" style={{ gap: 4 }}><FileText size={14} /> {t.group}</span>
      </div>
      <label className="field"><span>Subject</span><input className="input" value={t.subject[lang]} onChange={(e) => setT({ ...t, subject: { ...t.subject, [lang]: e.target.value } })} /></label>
      <label className="field"><span>Body</span><textarea className="input" rows={12} value={t.body[lang]} onChange={(e) => setT({ ...t, body: { ...t.body, [lang]: e.target.value } })} /></label>
      <div className="row"><span className="small muted">Insert field:</span>{FIELDS.map((f) => <button key={f} className="chip-btn" onClick={() => insert(f)}>{f}</button>)}</div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => notify('Test email sent to you (demo)')}>Send test</button>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { dispatch({ type: 'template/save', template: t }); notify('Template saved'); onClose() }}>Save template</button>
      </div>
    </Modal>
  )
}
