import { useMemo } from 'react'
import { useStore } from './store'
import { slotsFor, nextWeekdays } from './availability'
import { t } from './i18n'

// Day strip + time grid built from the person's availability (Outlook busy times + existing appointments).
export default function SlotPicker({ person, duration, value, onChange, excludeId, lang = 'en', days = 8 }) {
  const { state } = useStore()
  const dates = useMemo(() => nextWeekdays(days), [days])
  const date = value?.date && dates.includes(value.date) ? value.date : dates[0]
  const loc = lang === 'fr' ? 'fr-CA' : 'en-CA'
  const slots = slotsFor(state, person, date, duration, excludeId)
  const freeCount = (d) => slotsFor(state, person, d, duration, excludeId).filter((s) => s.free).length

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }}>
        {dates.map((d) => {
          const dt = new Date(d + 'T12:00')
          const n = freeCount(d)
          return (
            <button key={d} type="button" disabled={!n} className={'pill-btn day' + (d === date ? ' on' : '')} onClick={() => onChange({ date: d, time: null })} aria-label={dt.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' })}>
              <span className="small">{dt.toLocaleDateString(loc, { weekday: 'short' })}</span><b>{dt.getDate()}</b>
            </button>
          )
        })}
      </div>
      <div className="small muted">{new Date(date + 'T12:00').toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' })} · {person} · {duration} min</div>
      {slots.some((s) => s.free) ? (
        <div className="slot-grid">
          {slots.map((s) => (
            <button key={s.time} type="button" disabled={!s.free} className={'pill-btn' + (value?.date === date && value?.time === s.time ? ' on' : '')} onClick={() => onChange({ date, time: s.time })}>{s.time}</button>
          ))}
        </div>
      ) : <p className="small muted">{lang === 'fr' || lang === 'en' ? t(lang, 'noSlots') : 'No availability this day.'}</p>}
    </div>
  )
}
