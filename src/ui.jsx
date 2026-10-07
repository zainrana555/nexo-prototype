import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronRight } from 'lucide-react'

export function Logo({ size = 32, color = '#211C84' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Nexo">
      <polygon points="50,6 89,28 89,72 50,94 11,72 11,28" fill="none" stroke={color} strokeWidth="9" />
      <text x="50" y="65" textAnchor="middle" fontFamily="IBM Plex Sans, sans-serif" fontWeight="600" fontSize="40" letterSpacing="-2" fill={color}>NX</text>
    </svg>
  )
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="row between">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Switch({ checked, onChange, label }) {
  return <button type="button" className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} />
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.key} role="tab" aria-selected={value === t.key} className={'tab' + (value === t.key ? ' on' : '')} onClick={() => onChange(t.key)}>
          {t.label}{t.count != null && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function PageHeader({ crumbs, title, sub, actions }) {
  return (
    <div className="page-header">
      <div className="stack" style={{ gap: 4, minWidth: 0 }}>
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i} className="row" style={{ gap: 4 }}>
                {i > 0 && <ChevronRight size={12} />}
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  )
}

const TONES = {
  New: 'blue', 'Mini-mandate sent': 'navy', 'Follow-up': 'warn', Won: 'ok', Lost: 'gray',
  Client: 'blue', Staff: 'navy', Bank: 'purple', Closed: 'ok', Connected: 'ok', Manual: 'gray',
  pending: 'warn', approved: 'ok', rejected: 'bad',
}
export function Badge({ children, tone }) {
  const label = typeof children === 'string' ? children.charAt(0).toUpperCase() + children.slice(1) : children
  return <span className={'badge ' + (tone || TONES[children] || 'gray')}>{label}</span>
}

export function Avatar({ name, size = 32 }) {
  const initials = name.replace(/^Me /, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('')
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">{initials}</span>
}

export function Empty({ icon: Icon, title, sub, action }) {
  return (
    <div className="empty">
      {Icon && <Icon size={28} />}
      <b>{title}</b>
      {sub && <p className="muted">{sub}</p>}
      {action}
    </div>
  )
}

export function Progress({ value }) {
  return <div className="bar" aria-label={`${value}%`}><div style={{ width: `${value}%` }} /></div>
}
