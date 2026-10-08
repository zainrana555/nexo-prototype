import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox as InboxIcon, Mail, MailOpen, ArrowRight, FileText, Video, CalendarPlus, Paperclip, BookOpen, LogOut } from 'lucide-react'
import { downloadIcs, OFFICE_ADDRESS } from '../../availability'
import { useStore } from '../../store'
import { Logo, Avatar } from '../../ui'
import { t, emailContent } from '../../i18n'
import { DEMO_FILE, DEMO_LEAD } from '../../data'
import { money, fmtDate } from '../../logic'

export function useClientCtx() {
  const { state } = useStore()
  const lead = state.leads.find((l) => l.id === DEMO_LEAD)
  const file = state.files.find((f) => f.id === DEMO_FILE)
  return {
    lead, file,
    first: 'Émilie',
    addr: lead.property,
    total: money(file?.contract.total || lead.quote || 0, state.lang),
    file_id: DEMO_FILE,
    when: file?.booking ? `${fmtDate(file.booking.date, state.lang)} · ${file.booking.time} · ${file.booking.mode}` : '',
  }
}

export default function Inbox() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const c = useClientCtx()
  const ctx = { ...c, file: DEMO_FILE }
  const [openId, setOpenId] = useState(state.emails[0]?.id)
  const open = state.emails.find((m) => m.id === openId)
  const content = open && emailContent(open.kind, L, { ...ctx, ...open.data })
  const unread = state.emails.filter((m) => !m.read).length

  const select = (m) => { setOpenId(m.id); if (!m.read) dispatch({ type: 'email/read', id: m.id }) }

  return (
    <div className="mail">
      <aside className="mail-nav">
        <div className="row" style={{ gap: 10, padding: '4px 6px 14px' }}><Avatar name="Émilie Gagnon" size={36} /><span style={{ lineHeight: 1.2 }}><b style={{ display: 'block' }}>Émilie Gagnon</b><span className="small muted">emilie.gagnon@exemple.ca</span></span></div>
        <button className="nav-link active"><InboxIcon size={17} /><span className="grow">{t(L, 'inbox')}</span>{unread > 0 && <span className="nav-count">{unread}</span>}</button>
        <button className="nav-link" onClick={() => nav('/client/file')}><FileText size={17} /><span className="grow">{t(L, 'myFile')}</span></button>
        <button className="nav-link" onClick={() => nav('/client/guide')}><BookOpen size={17} /><span className="grow">{t(L, 'guide')}</span></button>
        <button className="nav-link" onClick={() => { dispatch({ type: 'client/logout' }); nav('/client/login') }}><LogOut size={17} /><span className="grow">{t(L, 'logout')}</span></button>
        <div className="grow" />
        <div className="seg light" role="group" aria-label="Language">
          <button className={L === 'fr' ? 'on' : ''} onClick={() => dispatch({ type: 'lang', lang: 'fr' })}>Français</button>
          <button className={L === 'en' ? 'on' : ''} onClick={() => dispatch({ type: 'lang', lang: 'en' })}>English</button>
        </div>
        <p className="small muted" style={{ marginTop: 10 }}>{t(L, 'inboxHint')}</p>
      </aside>

      <section className="mail-list" aria-label={t(L, 'inbox')}>
        {state.emails.map((m) => {
          const e = emailContent(m.kind, L, { ...ctx, ...m.data })
          return (
            <button key={m.id} className={'mail-item' + (m.id === openId ? ' on' : '') + (m.read ? '' : ' unread')} onClick={() => select(m)}>
              <span className="row between"><b className="row" style={{ gap: 6 }}>{m.read ? <MailOpen size={14} /> : <Mail size={14} />} Acoca Notaires</b><span className="small muted">{m.t.replace('Today ', '')}</span></span>
              <span className="mail-subj">{e.subject}</span>
              <span className="small muted mail-prev">{e.body.split('\n').filter(Boolean)[1]}</span>
            </button>
          )
        })}
      </section>

      <article className="mail-read">
        {!content ? <p className="muted" style={{ padding: 40 }}>{t(L, 'inboxEmpty')}</p> : (
          <>
            <h1 style={{ fontSize: 22 }}>{content.subject}</h1>
            <div className="row" style={{ gap: 10, margin: '16px 0 20px' }}>
              <Logo size={36} />
              <div className="grow"><b>Acoca Notaires</b> <span className="small muted">&lt;nathalie@acoca-demo.ca&gt;</span><div className="small muted">{t(L, 'to')}: emilie.gagnon@exemple.ca · {open.t}</div></div>
            </div>
            {content.attach && <button className="attach-chip as-link" onClick={() => nav(content.attach.to)}><Paperclip size={13} /> {content.attach.label}</button>}
            <div className="mail-body">{content.body}</div>
            {content.slots?.length > 0 && (
              <div className="slot-offer">
                {content.slots.map((sl) => (
                  <button key={sl.date + sl.time} className="slot-offer-btn" onClick={() => nav(`/client/booking?date=${sl.date}&time=${sl.time}`)}>
                    <b>{fmtDate(sl.date, L)}</b><span>{sl.time}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="row" style={{ marginTop: 22, gap: 10 }}>
              {content.teams && <button className="btn btn-primary mail-cta teams-btn" style={{ marginTop: 0 }} onClick={() => notify(L === 'fr' ? 'Ouverture de Microsoft Teams (démo)' : 'Opening Microsoft Teams (demo)')}><Video size={16} /> {t(L, 'joinTeams')}</button>}
              {content.cta && <button className={'btn mail-cta ' + (content.teams ? '' : 'btn-primary')} style={{ marginTop: 0 }} onClick={() => nav(content.to)}>{content.cta} <ArrowRight size={16} /></button>}
              {content.ics && open.data && <button className="btn mail-cta" style={{ marginTop: 0 }} onClick={() => downloadIcs({ title: open.data.title ?? 'Acoca Notaires', date: open.data.date, time: open.data.time, duration: open.data.duration, location: open.data.teams ?? OFFICE_ADDRESS })}><CalendarPlus size={16} /> {t(L, 'addToCal')}</button>}
            </div>
            <p className="fraud-note">{t(L, 'fraud')}</p>
            <p className="small muted" style={{ marginTop: 12 }}>Acoca Notaires inc. · 700 Av. Sainte-Croix, Saint-Laurent · 514 748-6539</p>
          </>
        )}
      </article>
    </div>
  )
}
