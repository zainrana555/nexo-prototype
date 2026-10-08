import { Sparkles } from 'lucide-react'
import { useStore } from '../../store'
import { Badge, Progress } from '../../ui'
import { CHECKLIST_SECTIONS, PROCEDURE } from '../../firm'
import { accessOf } from '../../data'
import { checklistFor, autoDone, ddItems } from '../../logic'

const SENT_TO = ['Acquéreur', 'Vendeur', 'Agent', 'Syndicat', 'Créancier']

// The firm's own checklist (CheckList pour Dossier.xlsx): requested · paralegal ✓ · notary ✓ · notes.
export default function FileChecklist({ file }) {
  const { state, dispatch } = useStore()
  const cl = checklistFor(file)
  const me = accessOf(state.auth)
  const notary = ['Owner', 'Super admin', 'Notary'].includes(me)
  const row = (id) => file.checklist?.[id] ?? {}
  const isDone = (it, col) => row(it.id)[col] || (col === 'para' && it.auto && autoDone(file, it.auto))
  const total = cl.items.length
  const paraDone = cl.items.filter((it) => isDone(it, 'para')).length
  const notaryDone = cl.items.filter((it) => isDone(it, 'notary')).length
  const dd = ddItems(file)
  const ddDone = dd.filter((it) => row(it.id).para).length
  const corp = file.clientType === 'Corporation' || file.parties.some((p) => p.corporate)
  const toggle = (it, col) => dispatch({ type: 'check/toggle', id: file.id, item: it.id, col, label: it.label })

  return (
    <div className="stack-lg">
      <section className="card stack">
        <div className="row between">
          <div><h2>{cl.name}</h2><span className="small muted">Dossier {file.id} · {file.addr}{corp ? ' · client is a corporation (REQ, minute book and resolution items apply)' : ''}</span></div>
          <div className="row" style={{ gap: 18 }}>
            <span className="small">Paralegal <b>{paraDone}/{total}</b></span>
            <span className="small">Notary <b>{notaryDone}/{total}</b></span>
            <Badge tone={ddDone === dd.length ? 'ok' : 'warn'}>Due diligence {ddDone}/{dd.length}</Badge>
          </div>
        </div>
        <Progress value={Math.round((paraDone / total) * 100)} />
        {!notary && <p className="small muted">Notary column: only notaries can tick it (you are {me}).</p>}
      </section>

      {CHECKLIST_SECTIONS.map((sec) => {
        const items = cl.items.filter((it) => it.section === sec)
        if (!items.length) return null
        return (
          <section key={sec} className="card" style={{ padding: 0 }}>
            <div className="table-wrap" style={{ border: 0, boxShadow: 'none' }}>
              <table className="check-table">
                <thead><tr><th>{sec}</th><th className="c">Demandé</th><th className="c">Adjointe</th><th className="c">Notaire</th><th>Notes</th></tr></thead>
                <tbody>
                  {items.map((it) => {
                    const auto = it.auto && autoDone(file, it.auto)
                    const r = row(it.id)
                    return (
                      <tr key={it.id} className={(isDone(it, 'para') ? 'done ' : '') + (it.dd ? 'dd' : '')} style={{ cursor: 'default' }}>
                        <td>
                          {it.label}
                          {it.dd && <Badge tone="navy">Due diligence</Badge>}
                          {auto && <span className="auto-tag"><Sparkles size={11} /> auto</span>}
                        </td>
                        <td className="c"><input type="checkbox" aria-label={`Requested: ${it.label}`} checked={!!r.req} onChange={() => toggle(it, 'req')} /></td>
                        <td className="c"><input type="checkbox" aria-label={`Paralegal: ${it.label}`} checked={!!isDone(it, 'para')} onChange={() => toggle(it, 'para')} /></td>
                        <td className="c"><input type="checkbox" aria-label={`Notary: ${it.label}`} disabled={!notary} checked={!!r.notary} onChange={() => toggle(it, 'notary')} /></td>
                        <td><input className="note-input" aria-label={`Note: ${it.label}`} placeholder="—" value={r.note ?? ''} onChange={(e) => dispatch({ type: 'check/note', id: file.id, item: it.id, note: e.target.value })} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      <div className="split">
        <section className="card stack main">
          <h2>Lettres (L) ou courriels (C) transmis</h2>
          <div className="row" style={{ gap: 16 }}>
            {SENT_TO.map((p) => <label key={p} className="check small"><input type="checkbox" checked={!!row('sent-' + p).para} onChange={() => dispatch({ type: 'check/toggle', id: file.id, item: 'sent-' + p, col: 'para', label: `Lettre/courriel à ${p}` })} /> {p}</label>)}
          </div>
        </section>
        <details className="side card procedure">
          <summary>Étapes à suivre pour dossier complet (24)</summary>
          <ol>{PROCEDURE.map((p) => <li key={p}>{p}</li>)}</ol>
        </details>
      </div>
    </div>
  )
}
