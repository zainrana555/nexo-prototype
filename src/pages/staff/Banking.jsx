import { Link, Navigate } from 'react-router-dom'
import { Landmark, Lock } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Badge } from '../../ui'
import { can, isClosed, money, fmtDate } from '../../logic'

// Back-office banking: funds expected for each file. Reconciliation itself stays manual (Procardex / bank).
export default function Banking() {
  const { state, dispatch, notify } = useStore()
  if (!can(state, 'banking.view')) return <Navigate to="/app" replace />
  const rows = state.files.filter((f) => !isClosed(f) && f.type !== 'Sale' && f.contract.signed)
  return (
    <>
      <PageHeader title="Back-office banking" sub="Funds expected in trust for upcoming signings. Visible only to roles with the banking permission." />
      <p className="banner info small row" style={{ gap: 6 }}><Lock size={14} /> Trust deposits and discrepancies are still reconciled manually in Procardex and the bank portal. Nexo tracks the funds requests and confirmations.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>File</th><th>Client(s)</th><th>Signing</th><th>Fees</th><th>Funds request</th><th>Received</th><th /></tr></thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id} style={{ cursor: 'default' }}>
                <td className="mono small"><Link to={`/app/files/${f.id}`}>{f.id}</Link></td>
                <td><b>{f.clients.join(' & ')}</b></td>
                <td className="muted">{f.booking ? fmtDate(f.booking.date) : '—'}</td>
                <td className="mono">{money(f.contract.total)}</td>
                <td>{f.funds?.requested ? <Badge tone="ok">Sent</Badge> : <Badge>Not sent</Badge>}</td>
                <td>{f.funds?.received ? <Badge tone="ok">Received</Badge> : <Badge tone="warn">Waiting</Badge>}</td>
                <td><button className="btn btn-sm" onClick={() => { dispatch({ type: 'funds/received', id: f.id }); notify(f.funds?.received ? 'Marked not received' : 'Funds confirmed received') }}><Landmark size={14} /> {f.funds?.received ? 'Undo' : 'Confirm received'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
