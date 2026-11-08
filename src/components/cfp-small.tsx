import {
  UserSelectionButtonProps,
  UserSelectionButtons,
} from './user-selection-buttons'
import { EventThumb } from './event-thumb'
import { isInIsrael } from '../shared/regions'
export function daysUntil(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(date).valueOf() - today.valueOf()) / 86400000)
}
const dateLabel = (date: Date) =>
  date
    ? new Date(date).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'To be announced'
export { isInIsrael }
function IsraelFlag() {
  return (
    <span className="israel-flag" role="img" aria-label="Israel">
      <svg viewBox="0 0 220 160" width="28" height="20" aria-hidden="true">
        <rect width="220" height="160" fill="#fff" />
        <rect y="15" width="220" height="25" fill="#0038b8" />
        <rect y="120" width="220" height="25" fill="#0038b8" />
        <g fill="none" stroke="#0038b8" strokeWidth="5.5">
          <path d="M110 52 L136 97 L84 97 Z" />
          <path d="M110 108 L84 63 L136 63 Z" />
        </g>
      </svg>
    </span>
  )
}
export default function CfpSmall({
  cfp,
  select,
  toggleUserSelection,
}: { select: VoidFunction } & UserSelectionButtonProps) {
  const days = daysUntil(cfp.cfpDate)
  const urgency = days < 0 ? 'closed' : days <= 7 ? 'urgent' : ''
  return (
    <article
      className={`opportunity-card ${cfp.hidden ? 'is-hidden' : ''} ${
        isInIsrael(cfp.location) ? 'is-israel' : ''
      }`}
    >
      <button
        className="card-thumb-button"
        onClick={select}
        tabIndex={-1}
        aria-hidden="true"
      >
        <EventThumb image={cfp.image} name={cfp.conferenceName}>
          {isInIsrael(cfp.location) && <IsraelFlag />}
          <span className={`status-badge ${urgency}`}>
            {days < 0
              ? 'Closed'
              : days === 0
                ? 'Closes today'
                : days <= 7
                  ? `${days} day${days === 1 ? '' : 's'} left`
                  : 'Open for proposals'}
          </span>
        </EventThumb>
      </button>
      <h3>
        <button className="card-title" onClick={select}>
          {cfp.conferenceName}
        </button>
      </h3>
      <div className={`deadline ${urgency}`}>
        <span>CFP deadline</span>
        <strong>{dateLabel(cfp.cfpDate)}</strong>
        {days >= 0 && (
          <em>
            {days === 0 ? 'Today' : `in ${days} day${days === 1 ? '' : 's'}`}
          </em>
        )}
      </div>
      <div className="event-meta">
        <span>▦</span> {dateLabel(cfp.conferenceDate)}
      </div>
      <div className="event-meta">
        <span>◎</span> {cfp.location || 'Location to be announced'}
      </div>
      <div className="card-bottom">
        <UserSelectionButtons
          cfp={cfp}
          toggleUserSelection={toggleUserSelection}
        />
        <button className="details-link" onClick={select}>
          View opportunity <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  )
}
