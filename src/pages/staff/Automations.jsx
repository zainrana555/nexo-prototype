import { useState } from 'react'
import { Zap, Plus } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Modal, Switch } from '../../ui'
import { RULE_TRIGGERS, RULE_ACTIONS } from '../../data'

export default function Automations() {
  const { state, dispatch, notify } = useStore()
  const [adding, setAdding] = useState(false)
  const runs = state.files.flatMap((f) => f.log.filter((l) => l.e.startsWith('Automation')).map((l) => ({ ...l, file: f.id })))
    .concat(state.leads.flatMap((l) => l.log.filter((x) => x.e.startsWith('Automation')).map((x) => ({ ...x, file: l.id }))))
    .slice(0, 8)

  return (
    <>
      <PageHeader title="Automations" sub="Reminders, escalations and gated steps run on their own. No more manual follow-up tracking." actions={<button className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={16} /> New rule</button>} />
      <div className="split">
        <div className="main stack">
          {state.rules.map((r) => (
            <div key={r.id} className={'card rule' + (r.on ? '' : ' off')}>
              <span className="rule-icon"><Zap size={16} /></span>
              <div className="grow stack" style={{ gap: 6 }}>
                <b>{r.name}</b>
                <div className="row"><span className="when">WHEN {r.when}</span><span className="muted">→</span><span className="then">THEN {r.then}</span></div>
              </div>
              <span className="small muted hide-sm">{r.runs} runs / 30 days</span>
              <Switch checked={r.on} label={`${r.name} enabled`} onChange={() => { dispatch({ type: 'rule/toggle', id: r.id }); notify(`${r.name} ${r.on ? 'paused' : 'enabled'}`) }} />
            </div>
          ))}
        </div>
        <aside className="side card stack">
          <h2>Recent runs</h2>
          {runs.length === 0 && <p className="muted small">No runs yet.</p>}
          {runs.map((r, i) => <div key={i}><span className="small muted">{r.t} · {r.file}</span><div className="small">{r.e.replace('Automation: ', '')}</div></div>)}
        </aside>
      </div>
      {adding && <NewRule onClose={() => setAdding(false)} onSave={(rule) => { dispatch({ type: 'rule/add', rule }); setAdding(false); notify('Rule created') }} />}
    </>
  )
}

function NewRule({ onClose, onSave }) {
  const [r, setR] = useState({ name: '', when: RULE_TRIGGERS[7], then: RULE_ACTIONS[7] })
  const set = (k) => (e) => setR({ ...r, [k]: e.target.value })
  return (
    <Modal title="New automation rule" onClose={onClose}>
      <label className="field"><span>Name</span><input className="input" value={r.name} onChange={set('name')} placeholder="e.g. Closing reminder" /></label>
      <label className="field"><span>When</span><select className="select" value={r.when} onChange={set('when')}>{RULE_TRIGGERS.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="field"><span>Then</span><select className="select" value={r.then} onChange={set('then')}>{RULE_ACTIONS.map((x) => <option key={x}>{x}</option>)}</select></label>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave({ ...r, name: r.name || 'Untitled rule' })}>Save rule</button></div>
    </Modal>
  )
}
