import { useNavigate } from 'react-router-dom'
import { Check, FileText, Banknote, MessageSquare } from 'lucide-react'
import { useStore } from '../../store'
import { t } from '../../i18n'
import { money } from '../../logic'
import { DEMO_LEAD, DEMO_FILE } from '../../data'

export default function Mandate() {
  const { state, dispatch, notify } = useStore()
  const nav = useNavigate()
  const L = state.lang
  const lead = state.leads.find((l) => l.id === DEMO_LEAD)

  if (lead.status === 'New') return <NotYet L={L} />
  const accepted = !!lead.fileId

  return (
    <>
      <div className="body">
        <div>
          <h1>{t(L, 'mTitle')}</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{t(L, 'mSub', { addr: lead.property })}</p>
        </div>
        <div className="quote-hero">
          <span className="small">{t(L, 'mIncl')}</span>
          <b>{money(lead.quote, L)}</b>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <b>{t(L, 'mWhat')}</b>
          {t(L, 'mWhatList').map((x) => <span key={x} className="row small" style={{ gap: 8, alignItems: 'flex-start' }}><Check size={15} className="ok" style={{ flex: 'none', marginTop: 2 }} />{x}</span>)}
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <b>{t(L, 'mDocs')}</b>
          {t(L, 'mDocsList').map((x) => <span key={x} className="row small" style={{ gap: 8, alignItems: 'flex-start' }}><FileText size={15} style={{ flex: 'none', marginTop: 2 }} />{x}</span>)}
        </div>
        <p className="banner neutral row small" style={{ gap: 8, alignItems: 'flex-start' }}><Banknote size={16} style={{ flex: 'none' }} />{t(L, 'mPay')}</p>
        {accepted && (
          <div className="banner ok stack" style={{ gap: 4 }}>
            <b>{t(L, 'mAccepted', { id: DEMO_FILE })}</b>
            <span>{t(L, 'mNext')}</span>
          </div>
        )}
      </div>
      <footer style={{ flexDirection: 'column' }}>
        {accepted ? (
          <button className="btn btn-primary btn-block" onClick={() => nav('/client/intake')}>{t(L, 'startQ')}</button>
        ) : (
          <>
            <button className="btn btn-primary btn-block" onClick={() => { dispatch({ type: 'lead/accept', id: DEMO_LEAD, byClient: true }); notify(L === 'fr' ? 'Dossier ouvert' : 'File opened') }}>{t(L, 'mAccept')}</button>
            <button className="btn btn-block" onClick={() => notify(L === 'fr' ? 'Message envoyé à l’étude' : 'Message sent to the office')}><MessageSquare size={16} /> {t(L, 'mQuestion')}</button>
          </>
        )}
      </footer>
    </>
  )
}

export function NotYet({ L }) {
  const nav = useNavigate()
  return (
    <div className="body" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <h1>{t(L, 'notYet')}</h1>
      <p className="muted">{t(L, 'notYetSub')}</p>
      <button className="btn btn-block" onClick={() => nav('/client/file')}>{t(L, 'toFile')}</button>
    </div>
  )
}
