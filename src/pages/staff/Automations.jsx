import { useState } from 'react'
import { Zap, Plus, Mail, MessageSquare, Clock, GitBranch, Bell, TriangleAlert, Settings2, ArrowUp, ArrowDown, Trash2, GraduationCap, Lock } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Modal, Switch } from '../../ui'
import { RULE_TRIGGERS, STEP_KINDS } from '../../data'
import { can } from '../../logic'

const ICON = { email: Mail, sms: MessageSquare, wait: Clock, condition: GitBranch, notify: Bell, escalate: TriangleAlert, action: Settings2 }
const stepText = (st) => ({
  email: `Email: ${st.template ?? 'template'}`, sms: `Text: “${(st.text ?? '').slice(0, 38)}${(st.text ?? '').length > 38 ? '…' : ''}”`, wait: `Wait ${st.days} day${st.days === 1 ? '' : 's'}`,
  condition: `If ${st.label ?? 'condition'} → yes: stop · no: continue`, notify: `Notify ${st.who}`, escalate: `Escalate to ${st.who}`, action: st.label,
}[st.kind])

export default function Automations() {
  const { state, dispatch, notify } = useStore()
  const [edit, setEdit] = useState(null)
  const [guide, setGuide] = useState(false)
  const editable = can(state, 'automations.manage')
  const runs = state.files.flatMap((f) => f.log.filter((l) => l.e.startsWith('Automation')).map((l) => ({ ...l, ref: f.id })))
    .concat(state.leads.flatMap((l) => l.log.filter((x) => x.e.startsWith('Automation')).map((x) => ({ ...x, ref: l.id })))).slice(0, 8)

  return (
    <>
      <PageHeader title="Automations" sub="Sequences run on their own: emails, text messages, waits, checks, retries and escalations."
        actions={<>
          <button className="btn" disabled={!editable} onClick={() => setGuide(true)}><GraduationCap size={16} /> Guided setup</button>
          <button className="btn btn-primary" disabled={!editable} onClick={() => setEdit({ id: null, name: '', trigger: RULE_TRIGGERS[9], steps: [{ kind: 'email', template: 'Appointment reminder' }], maxRetries: 2, stopOnReply: true, on: true })}><Plus size={16} /> New automation</button>
        </>} />
      {!editable && <p className="banner neutral small row" style={{ gap: 6 }}><Lock size={14} /> Your role can view automations but not edit them.</p>}
      <div className="split">
        <div className="main stack">
          {state.rules.map((r) => (
            <div key={r.id} className={'card rule' + (r.on ? '' : ' off')}>
              <span className="rule-icon"><Zap size={16} /></span>
              <button className="grow stack rule-body" style={{ gap: 6 }} onClick={() => editable && setEdit(r)} disabled={!editable}>
                <b>{r.name}</b>
                <div className="seq">
                  <span className="when">WHEN {r.trigger}</span>
                  {r.steps.map((st, i) => { const I = ICON[st.kind]; return <span key={i} className={'seq-step ' + st.kind}><I size={12} /> {stepText(st)}</span> })}
                </div>
                <span className="small muted">Max {r.maxRetries} attempt{r.maxRetries === 1 ? '' : 's'}{r.stopOnReply ? ' · stops when the client responds' : ''} · {r.runs} runs / 30 days</span>
              </button>
              <Switch checked={r.on} label={`${r.name} enabled`} onChange={() => { dispatch({ type: 'rule/toggle', id: r.id }); notify(`${r.name} ${r.on ? 'paused' : 'enabled'}`) }} />
            </div>
          ))}
        </div>
        <aside className="side card stack">
          <h2>Recent runs</h2>
          {runs.length === 0 && <p className="muted small">No runs yet.</p>}
          {runs.map((r, i) => <div key={i}><span className="small muted">{r.t} · {r.ref}</span><div className="small">{r.e.replace('Automation: ', '')}</div></div>)}
        </aside>
      </div>
      {edit && <SequenceEditor rule={edit} onClose={() => setEdit(null)} onSave={(rule) => { dispatch({ type: 'rule/save', rule }); setEdit(null); notify('Automation saved') }} />}
      {guide && <GuidedSetup onClose={() => setGuide(false)} onCreate={(rule) => { dispatch({ type: 'rule/save', rule }); setGuide(false); notify(`“${rule.name}” created and switched on`) }} />}
    </>
  )
}

function SequenceEditor({ rule, onClose, onSave }) {
  const { state } = useStore()
  const [r, setR] = useState(rule)
  const tplNames = state.templates.map((t) => t.name)
  const setStep = (i, patch) => setR({ ...r, steps: r.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
  const move = (i, d) => { const s = [...r.steps]; const [x] = s.splice(i, 1); s.splice(i + d, 0, x); setR({ ...r, steps: s }) }
  const defaults = { email: { template: tplNames[0] }, sms: { text: 'Rappel de l’étude.' }, wait: { days: 2 }, condition: { label: 'Client responded?' }, notify: { who: 'Assigned paralegal' }, escalate: { who: 'Assigned notary' }, action: { label: 'Flag file' } }
  const add = (kind) => setR({ ...r, steps: [...r.steps, { kind, ...defaults[kind] }] })
  return (
    <Modal title={rule.id ? 'Edit automation' : 'New automation'} onClose={onClose} wide>
      <div className="grid-2">
        <label className="field"><span>Name</span><input className="input" value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} placeholder="e.g. Closing reminder" /></label>
        <label className="field"><span>When (trigger)</span><select className="select" value={r.trigger} onChange={(e) => setR({ ...r, trigger: e.target.value })}>{RULE_TRIGGERS.map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <span className="small muted">Steps run top to bottom</span>
        {r.steps.map((st, i) => {
          const I = ICON[st.kind]
          return (
            <div key={i} className="step-edit">
              <span className={'seq-step ' + st.kind} style={{ minWidth: 120 }}><I size={13} /> {STEP_KINDS.find((k) => k.kind === st.kind)?.label}</span>
              <div className="grow">
                {st.kind === 'email' && <select className="select" value={st.template} onChange={(e) => setStep(i, { template: e.target.value })} aria-label="Template">{tplNames.map((n) => <option key={n}>{n}</option>)}</select>}
                {st.kind === 'sms' && <input className="input" value={st.text} onChange={(e) => setStep(i, { text: e.target.value })} aria-label="Text message" />}
                {st.kind === 'wait' && <span className="row"><input className="input" type="number" min="1" max="30" style={{ width: 90 }} value={st.days} onChange={(e) => setStep(i, { days: +e.target.value })} aria-label="Days" /> days</span>}
                {st.kind === 'condition' && <span className="row"><input className="input grow" value={st.label} onChange={(e) => setStep(i, { label: e.target.value })} aria-label="Condition" /><span className="small muted">yes → stop · no → next step</span></span>}
                {(st.kind === 'notify' || st.kind === 'escalate') && <select className="select" value={st.who} onChange={(e) => setStep(i, { who: e.target.value })} aria-label="Who">{['Assigned paralegal', 'Assigned notary', 'Reception', 'Office manager', 'Paralegal'].map((w) => <option key={w}>{w}</option>)}</select>}
                {st.kind === 'action' && <input className="input" value={st.label} onChange={(e) => setStep(i, { label: e.target.value })} aria-label="Action" />}
              </div>
              <button className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={15} /></button>
              <button className="icon-btn" aria-label="Move down" disabled={i === r.steps.length - 1} onClick={() => move(i, 1)}><ArrowDown size={15} /></button>
              <button className="icon-btn" aria-label="Remove step" onClick={() => setR({ ...r, steps: r.steps.filter((_, j) => j !== i) })}><Trash2 size={15} /></button>
            </div>
          )
        })}
        <div className="row">{STEP_KINDS.map((k) => { const I = ICON[k.kind]; return <button key={k.kind} className="btn btn-sm" onClick={() => add(k.kind)}><I size={13} /> {k.label}</button> })}</div>
      </div>
      <div className="row" style={{ gap: 20 }}>
        <label className="row small">Maximum attempts <input className="input" type="number" min="1" max="10" style={{ width: 80 }} value={r.maxRetries} onChange={(e) => setR({ ...r, maxRetries: +e.target.value })} /></label>
        <label className="check small"><input type="checkbox" checked={r.stopOnReply} onChange={(e) => setR({ ...r, stopOnReply: e.target.checked })} /> Stop as soon as the client responds</label>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!r.steps.length} onClick={() => onSave({ ...r, name: r.name || 'Untitled automation' })}>Save automation</button></div>
    </Modal>
  )
}

const RECIPES = [
  { name: 'Closing reminder', trigger: 'Closing date in 7 days', why: 'Remind clients what to bring and to send funds.', steps: [{ kind: 'email', template: 'Funds request' }, { kind: 'wait', days: 3 }, { kind: 'condition', label: 'Funds received?' }, { kind: 'sms', text: 'Rappel : fonds et pièces d’identité pour votre signature.' }, { kind: 'notify', who: 'Assigned paralegal' }] },
  { name: 'Missing second ID', trigger: 'ID expired or 2nd ID missing', why: 'Chase the client automatically until both IDs are valid.', steps: [{ kind: 'email', template: 'Reminder · Missing documents' }, { kind: 'wait', days: 2 }, { kind: 'condition', label: 'Valid ID received?' }, { kind: 'sms', text: 'Il nous manque une pièce d’identité valide.' }, { kind: 'escalate', who: 'Assigned paralegal' }] },
  { name: 'New lead welcome', trigger: 'New lead received', why: 'Instant reply by email and text so no inquiry waits.', steps: [{ kind: 'email', template: 'Mini-mandate · Buyer' }, { kind: 'sms', text: 'Merci! Votre soumission est dans vos courriels.' }, { kind: 'notify', who: 'Reception' }] },
]

function GuidedSetup({ onClose, onCreate }) {
  const [step, setStep] = useState(0)
  const [recipe, setRecipe] = useState(RECIPES[0])
  const [retries, setRetries] = useState(2)
  return (
    <Modal title={`Guided setup · step ${step + 1} of 3`} onClose={onClose} wide>
      {step === 0 && (
        <>
          <p className="small muted">Pick what you want to automate. You can change every step afterwards.</p>
          <div className="stack">{RECIPES.map((rc) => <button key={rc.name} className={'choice' + (recipe === rc ? ' on' : '')} onClick={() => setRecipe(rc)}><span className="grow"><b style={{ display: 'block' }}>{rc.name}</b><span className="small muted">When: {rc.trigger} · {rc.why}</span></span></button>)}</div>
        </>
      )}
      {step === 1 && (
        <>
          <p className="small muted">Here is the sequence Nexo will run. Each step waits for the previous one.</p>
          <div className="seq vertical">{recipe.steps.map((st, i) => { const I = ICON[st.kind]; return <span key={i} className={'seq-step ' + st.kind}><I size={13} /> {i + 1}. {stepText(st)}</span> })}</div>
          <label className="row small">Maximum attempts before escalating <input className="input" type="number" min="1" max="10" style={{ width: 80 }} value={retries} onChange={(e) => setRetries(+e.target.value)} /></label>
        </>
      )}
      {step === 2 && (
        <div className="stack">
          <p className="banner ok">Ready: “{recipe.name}” will run whenever <b>{recipe.trigger.toLowerCase()}</b>, up to {retries} attempts, and stop as soon as the client responds.</p>
          <p className="small muted">Tip: open it later from the list to add steps, change templates or timings.</p>
        </div>
      )}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 2 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          : <button className="btn btn-primary" onClick={() => onCreate({ id: null, name: recipe.name, trigger: recipe.trigger, steps: recipe.steps, maxRetries: retries, stopOnReply: true, on: true })}>Create &amp; switch on</button>}
      </div>
    </Modal>
  )
}
