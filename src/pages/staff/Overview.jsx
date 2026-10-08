import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Inbox, FolderOpen, Clock, CalendarDays, TriangleAlert } from 'lucide-react'
import { useStore } from '../../store'
import { PageHeader, Badge } from '../../ui'
import { stageInfo, isClosed, fmtDate, money } from '../../logic'
import { LEAD_COLUMNS } from '../../data'

export default function Overview() {
  const { state } = useStore()
  const nav = useNavigate()
  const first = state.auth.name.replace(/^Me /, '').split(' ')[0]
  const active = state.files.filter((f) => !isClosed(f))
  const [scope, setScope] = useState('mine')
  const me = state.auth.name
  const mine = (f) => f.notary === me || f.paralegal === me
  const tasks = active.map((f) => ({ f, s: stageInfo(f) })).filter(({ f, s }) => s.owner === 'Staff' && (scope === 'all' || mine(f)))
  const waitingClient = active.filter((f) => stageInfo(f).owner === 'Client').length
  const signings = [
    ...state.files.flatMap((f) => [[f.mortgageBooking, 'Mortgage signing'], [f.booking, f.mortgageBooking ? 'Sale signing' : 'Signing']].filter(([b]) => b && b.date >= new Date().toISOString().slice(0, 10)).map(([b, l]) => ({ title: `${l} – ${f.clients.join(' & ')}`, date: b.date, time: b.time, mode: b.mode, to: `/app/files/${f.id}` }))),
    ...state.events.map((e) => ({ title: e.title, date: e.date, time: e.time, mode: e.mode, to: e.fileId ? `/app/files/${e.fileId}` : '/app/calendar' })),
  ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5)
  const activity = state.files.flatMap((f) => f.log.slice(0, 2).map((l) => ({ ...l, f })))
    .concat(state.leads.flatMap((l) => l.log.slice(0, 1).map((x) => ({ ...x, lead: l }))))
    .sort((a, b) => (b.t.startsWith('Today') ? 1 : 0) - (a.t.startsWith('Today') ? 1 : 0) || b.t.localeCompare(a.t)).slice(0, 7)
  const pipelineValue = state.leads.filter((l) => ['Mini-mandate sent', 'Follow-up'].includes(l.status)).reduce((n, l) => n + (l.quote || 0), 0)

  const kpis = [
    { label: 'New leads', n: state.leads.filter((l) => l.status === 'New').length, icon: Inbox, to: '/app/leads' },
    { label: 'Active files', n: active.length, icon: FolderOpen, to: '/app/files' },
    { label: 'Waiting on clients', n: waitingClient, icon: Clock, to: '/app/files?filter=client' },
    { label: 'Escalated', n: active.filter((f) => f.escalated).length, icon: TriangleAlert, to: '/app/files?filter=escalated', warn: true },
  ]

  return (
    <>
      <PageHeader title={`Good morning, ${first}`} sub={new Date().toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      <div className="grid-4">
        {kpis.map((k) => (
          <button key={k.label} className={'kpi' + (k.warn && k.n ? ' warn' : '')} onClick={() => nav(k.to)}>
            <span className="kpi-icon"><k.icon size={18} /></span>
            <span className="small muted">{k.label}</span>
            <span className="kpi-n">{k.n}</span>
          </button>
        ))}
      </div>

      <div className="split">
        <section className="card main">
          <div className="card-head"><h2>{scope === 'mine' ? 'My tasks' : 'Team tasks'}</h2><span className="row small muted">{tasks.length} need action <span className="seg light"><button className={scope === 'mine' ? 'on' : ''} onClick={() => setScope('mine')}>Mine</button><button className={scope === 'all' ? 'on' : ''} onClick={() => setScope('all')}>Everyone</button></span></span></div>
          {tasks.length === 0 && <p className="muted">All caught up.</p>}
          {tasks.map(({ f, s }) => (
            <Link key={f.id} to={`/app/files/${f.id}?tab=${s.tab}`} className="task">
              <span className="mono small muted">{f.id}</span>
              <span className="grow"><b>{s.next}</b><span className="small muted"> · {f.clients.join(' & ')}</span></span>
              <Badge tone="navy">{s.label}</Badge>
              <ArrowRight size={16} />
            </Link>
          ))}
        </section>
        <section className="card side">
          <div className="card-head"><h2>Upcoming</h2><Link to="/app/calendar" className="small">Calendar →</Link></div>
          {signings.map((e, i) => (
            <Link key={i} to={e.to} className="event-row">
              <span className="date-chip"><b>{new Date(e.date + 'T12:00').getDate()}</b><span>{new Date(e.date + 'T12:00').toLocaleDateString('en-CA', { month: 'short' })}</span></span>
              <span className="grow"><b>{e.title}</b><span className="small muted" style={{ display: 'block' }}>{fmtDate(e.date)} · {e.time} · {e.mode}</span></span>
            </Link>
          ))}
          {signings.length === 0 && <p className="muted"><CalendarDays size={14} /> Nothing scheduled.</p>}
        </section>
      </div>

      <div className="split">
        <section className="card main">
          <div className="card-head"><h2>Leads pipeline</h2><Link to="/app/leads" className="small">Open leads →</Link></div>
          <div className="pipeline-mini">
            {LEAD_COLUMNS.map((c) => (
              <Link key={c} to="/app/leads" className="pm-col">
                <span className="small muted">{c}</span>
                <b>{state.leads.filter((l) => l.status === c).length}</b>
              </Link>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>Quotes awaiting acceptance: <b>{money(pipelineValue)}</b></p>
        </section>
        <section className="card side">
          <div className="card-head"><h2>Recent activity</h2></div>
          <div className="stack" style={{ gap: 10 }}>
            {activity.map((a, i) => (
              <Link key={i} to={a.f ? `/app/files/${a.f.id}` : `/app/leads/${a.lead.id}`} className="activity">
                <span className="small muted">{a.t} · {a.f ? a.f.id : a.lead.id}</span>
                <span>{a.e}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
