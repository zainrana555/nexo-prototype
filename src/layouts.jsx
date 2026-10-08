import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Inbox, FolderOpen, ShieldCheck, CalendarDays, FileText, Zap, Settings, Bell, Search, Plus,
  LogOut, User, CircleCheck, Circle, CirclePlay, RotateCcw, X, Mail, ArrowRight, Printer, Landmark, Lock,
} from 'lucide-react'
import { useStore } from './store'
import { Logo, Avatar, Modal } from './ui'
import { demoSteps, isClosed, can } from './logic'
import { accessOf } from './data'
import { t } from './i18n'
import { NewLeadModal } from './pages/staff/Leads'
import { NewFileModal } from './pages/staff/Files'

/* ---------- Demo bar + guided demo (shown on every screen) ---------- */

export function DemoBar() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const steps = demoSteps(state)
  const done = steps.filter((s) => s.done).length
  const onClient = pathname.startsWith('/client')

  return (
    <>
      <div className="demobar">
        <span className="demo-tag">DEMO</span>
        <span className="hide-sm">Sample data · nothing is sent</span>
        <div className="seg" role="group" aria-label="Switch view">
          <button className={!onClient ? 'on' : ''} onClick={() => nav(state.auth ? '/app' : '/login')}>Staff app</button>
          <button className={onClient ? 'on' : ''} onClick={() => nav('/client')}>Client view · Émilie</button>
        </div>
        <div className="grow" />
        <button className="demo-btn" onClick={() => setOpen(true)}><CirclePlay size={15} /> Guided demo <b>{done}/{steps.length}</b></button>
        <button className="demo-btn hide-sm" onClick={() => { if (confirm('Reset all demo data?')) { dispatch({ type: 'reset' }); notify('Demo data reset'); nav(state.auth ? '/app' : '/login') } }}><RotateCcw size={14} /> Reset</button>
      </div>
      {open && <DemoGuide steps={steps} onClose={() => setOpen(false)} />}
    </>
  )
}

function DemoGuide({ steps, onClose }) {
  const nav = useNavigate()
  const current = steps.findIndex((s) => !s.done)
  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" aria-label="Guided demo">
        <div className="row between">
          <div>
            <h2>Guided demo</h2>
            <p className="small muted">Follow Émilie Gagnon from first inquiry to closed file.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <ol className="guide">
          {steps.map((s, i) => (
            <li key={i} className={s.done ? 'done' : i === current ? 'current' : ''}>
              <span className="guide-icon">{s.done ? <CircleCheck size={18} /> : <Circle size={18} />}</span>
              <div className="grow">
                <span className={'side-tag ' + s.side.toLowerCase()}>{s.side}</span>
                <div>{s.label}</div>
              </div>
              {!s.done && (
                <button className={'btn btn-sm' + (i === current ? ' btn-primary' : '')} onClick={() => { onClose(); nav(s.to) }}>
                  Go <ArrowRight size={14} />
                </button>
              )}
            </li>
          ))}
        </ol>
        {current === -1 && <p className="banner ok">Journey complete: the file is closed and archived.</p>}
      </aside>
    </div>
  )
}

/* ---------- Staff app shell ---------- */

export function AppLayout() {
  const { state } = useStore()
  if (!state.auth) return <Navigate to="/login" replace />
  const pendingIds = state.files.reduce((n, f) => n + f.parties.reduce((m, p) => m + p.ids.filter((d) => d.review === 'pending').length, 0), 0)
  const nav = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/leads', label: 'Leads', icon: Inbox, count: state.leads.filter((l) => l.status === 'New').length },
    { to: '/app/files', label: 'Files', icon: FolderOpen, count: state.files.filter((f) => !isClosed(f)).length, quiet: true },
    { to: '/app/id-review', label: 'ID review', icon: ShieldCheck, count: pendingIds },
    { to: '/app/fax', label: 'Fax inbox', icon: Printer, count: state.faxes.filter((f) => f.status === 'review').length },
    { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/app/templates', label: 'Templates', icon: FileText },
    { to: '/app/automations', label: 'Automations', icon: Zap },
    can(state, 'banking.view') && { to: '/app/banking', label: 'Banking', icon: Landmark },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ]
  return (
    <div className="app">
      <DemoBar />
      <div className="shell">
        <nav className="sidebar" aria-label="Main">
          <Link to="/app" className="brand"><Logo size={30} /><span className="brand-name">Nexo</span></Link>
          <div className="nav-group">
            {nav.filter(Boolean).map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <n.icon size={18} /><span className="grow">{n.label}</span>
                {!!n.count && <span className={'nav-count' + (n.quiet ? ' quiet' : '')}>{n.count}</span>}
              </NavLink>
            ))}
          </div>
          <div className="grow" />
          <div className="firm-card hide-sm">
            <div className="small muted">Firm</div>
            <b>Acoca Notaires</b>
            <div className="small muted">Workspace · Montréal · FR / EN</div>
          </div>
        </nav>
        <div className="main-col">
          <TopBar />
          <main className="content"><Outlet /></main>
        </div>
      </div>
    </div>
  )
}

function useClickAway(onAway) {
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onAway()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onAway])
  return ref
}

function TopBar() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(null)
  const [modal, setModal] = useState(null)
  const close = useMemo(() => () => setMenu(null), [])
  const ref = useClickAway(close)
  const unread = state.notifications.filter((n) => !n.read).length

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const files = state.files.filter((f) => [f.id, f.addr, f.city, ...f.clients].join(' ').toLowerCase().includes(s)).map((f) => ({ k: f.id, label: `${f.id} · ${f.clients.join(' & ')}`, sub: `File · ${f.addr}`, to: `/app/files/${f.id}` }))
    const leads = state.leads.filter((l) => [l.id, l.name, l.property].join(' ').toLowerCase().includes(s)).map((l) => ({ k: l.id, label: l.name, sub: `Lead · ${l.status}`, to: `/app/leads/${l.id}` }))
    return [...files, ...leads].slice(0, 8)
  }, [q, state.files, state.leads])

  const go = (to) => { setQ(''); setMenu(null); nav(to) }

  return (
    <header className="topbar" ref={ref}>
      <div className="search">
        <Search size={16} />
        <label className="sr-only" htmlFor="gsearch">Search</label>
        <input id="gsearch" placeholder="Search files, clients, leads…" value={q} onChange={(e) => { setQ(e.target.value); setMenu('search') }} onFocus={() => setMenu('search')} />
        {menu === 'search' && results.length > 0 && (
          <div className="dropdown" style={{ left: 0, right: 0 }}>
            {results.map((r) => (
              <button key={r.k} className="dd-item" onClick={() => go(r.to)}><b>{r.label}</b><span className="small muted">{r.sub}</span></button>
            ))}
          </div>
        )}
      </div>
      <div className="grow" />
      <div className="pos">
        <button className="btn btn-primary btn-sm" onClick={() => setMenu(menu === 'new' ? null : 'new')}><Plus size={16} /> New</button>
        {menu === 'new' && (
          <div className="dropdown" style={{ right: 0, width: 220 }}>
            <button className="dd-item" onClick={() => { setMenu(null); setModal('lead') }}><b>New lead</b><span className="small muted">Log a call or email inquiry</span></button>
            <button className="dd-item" onClick={() => { setMenu(null); setModal('file') }}><b>New file</b><span className="small muted">Open a file directly</span></button>
          </div>
        )}
      </div>
      <div className="pos">
        <button className="icon-btn" aria-label={`Notifications, ${unread} unread`} onClick={() => setMenu(menu === 'notif' ? null : 'notif')}>
          <Bell size={19} />{unread > 0 && <span className="dot">{unread}</span>}
        </button>
        {menu === 'notif' && (
          <div className="dropdown" style={{ right: 0, width: 340 }}>
            <div className="row between" style={{ padding: '8px 12px' }}>
              <b>Notifications</b>
              <button className="link-btn" onClick={() => dispatch({ type: 'notif/readAll' })}>Mark all read</button>
            </div>
            {state.notifications.slice(0, 8).map((n) => (
              <button key={n.id} className={'dd-item' + (n.read ? '' : ' unread')} onClick={() => { dispatch({ type: 'notif/read', id: n.id }); go(n.to) }}>
                <span>{n.text}</span><span className="small muted">{n.t}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="pos">
        <button className="user-btn" onClick={() => setMenu(menu === 'user' ? null : 'user')} aria-label="Account menu">
          <Avatar name={state.auth.name} size={32} />
          <span className="hide-sm" style={{ textAlign: 'left', lineHeight: 1.2 }}><b style={{ display: 'block', fontSize: 13 }}>{state.auth.name}</b><span className="small muted">{state.auth.role} · {accessOf(state.auth)}</span></span>
        </button>
        {menu === 'user' && (
          <div className="dropdown" style={{ right: 0, width: 220 }}>
            <button className="dd-item row" onClick={() => go('/app/settings?tab=team')}><User size={16} /> My profile</button>
            <button className="dd-item row" onClick={() => go('/app/settings')}><Settings size={16} /> Settings</button>
            <button className="dd-item row" onClick={() => go('/client')}><Mail size={16} /> Open client view</button>
            <button className="dd-item row" onClick={() => { dispatch({ type: 'logout' }); notify('Signed out'); nav('/login') }}><LogOut size={16} /> Sign out</button>
          </div>
        )}
      </div>
      {modal === 'lead' && <NewLeadModal onClose={() => setModal(null)} />}
      {modal === 'file' && <NewFileModal onClose={() => setModal(null)} />}
    </header>
  )
}

/* ---------- Client shell ---------- */

const CLIENT_PUBLIC = ['/client/login', '/client/signup']

// Every client page needs a signed-in client account; messages are only readable after sign-in.
export function ClientLayout() {
  const { pathname } = useLocation()
  const { state } = useStore()
  const isPublic = CLIENT_PUBLIC.includes(pathname)
  if (!state.clientSignedIn && !isPublic) return <Navigate to={state.clientAccount ? '/client/login' : '/client/signup'} replace />
  if (state.clientSignedIn && isPublic) return <Navigate to="/client" replace />
  const inbox = pathname === '/client' || pathname === '/client/'
  return (
    <div className="app">
      <DemoBar />
      {inbox ? <Outlet /> : (
        <div className="client-shell">
          <div className="client-wrap">
            {isPublic ? <span className="back-inbox"><Lock size={14} /> acoca.ca · {state.lang === 'fr' ? 'espace client' : 'client space'}</span> : <Link to="/client" className="back-inbox"><Mail size={14} /> {t(state.lang, 'backMessages')}</Link>}
            <ClientCard />
          </div>
        </div>
      )}
    </div>
  )
}

function ClientCard() {
  const { state, dispatch } = useStore()
  const L = state.lang
  return (
    <div className="client" lang={L}>
      <header>
        <Link to="/client/file" className="row" style={{ textDecoration: 'none', gap: 8 }}>
          <Logo size={28} />
          <span style={{ lineHeight: 1.15 }}><b style={{ color: 'var(--navy)', display: 'block' }}>Acoca Notaires</b><span className="small muted">{t(L, 'notaries')}</span></span>
        </Link>
        <div className="seg light" role="group" aria-label="Language">
          <button className={L === 'fr' ? 'on' : ''} onClick={() => dispatch({ type: 'lang', lang: 'fr' })}>FR</button>
          <button className={L === 'en' ? 'on' : ''} onClick={() => dispatch({ type: 'lang', lang: 'en' })}>EN</button>
        </div>
      </header>
      <Outlet />
      <div className="client-foot small muted">🔒 {t(L, 'secure')}</div>
    </div>
  )
}

export function ConfirmModal({ title, children, onClose, onConfirm, label = 'Confirm' }) {
  return (
    <Modal title={title} onClose={onClose}>
      {children}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onConfirm}>{label}</button>
      </div>
    </Modal>
  )
}
