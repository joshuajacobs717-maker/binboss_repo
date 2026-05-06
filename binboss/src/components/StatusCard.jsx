const statusSteps = ['Not collected', 'Collected', 'Cleaned', 'Returned']

function formatScheduledDateTime(schedule) {
  if (!schedule?.date || !schedule?.time) {
    return ''
  }

  return new Date(`${schedule.date}T${schedule.time}`).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function toCalendarStamp(date, time) {
  return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`
}

function createCalendarUrl(binId, schedule) {
  if (!schedule?.date || !schedule?.time) {
    return ''
  }

  const start = toCalendarStamp(schedule.date, schedule.time)
  const endDate = new Date(`${schedule.date}T${schedule.time}`)
  endDate.setHours(endDate.getHours() + 1)
  const end = toCalendarStamp(endDate.toISOString().slice(0, 10), endDate.toTimeString().slice(0, 5))
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BinBoss//Scheduled Clean//EN',
    'BEGIN:VEVENT',
    `UID:${binId}-${schedule.date}-${schedule.time}@binboss`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:BinBoss scheduled clean for ${binId}`,
    `DESCRIPTION:Scheduled bin clean for ${binId}.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`
}

function StatusCard({
  actionLabel = 'View cleaner',
  binId = 'BIN-2048',
  compact = false,
  onStatusChange,
  onViewCleaner,
  schedule = null,
  showStatusControls = false,
  status = 'Cleaned',
}) {
  const activeIndex = statusSteps.indexOf(status)
  const nextStatus = statusSteps[activeIndex + 1]
  const scheduledDateTime = formatScheduledDateTime(schedule)
  const calendarUrl = createCalendarUrl(binId, schedule)
  const cardClassName = `status-card ${compact ? 'status-card--compact' : ''}`
  const cleanerButton = (
    <button className="secondary-action view-cleaner-button" onClick={onViewCleaner} type="button">
      {actionLabel}
    </button>
  )
  const statusList = (
    <ol className="status-steps">
      {statusSteps.map((step, index) => {
        const isComplete = index <= activeIndex

        return (
          <li
            className={`status-step ${isComplete ? 'status-step--complete' : ''}`}
            key={step}
          >
            <span aria-hidden="true" />
            {step}
          </li>
        )
      })}
    </ol>
  )
  const updateButton = showStatusControls && nextStatus && (
    <button
      className="primary-action status-update-button"
      onClick={() => onStatusChange(nextStatus)}
      type="button"
    >
      Update status to {nextStatus}
    </button>
  )

  if (schedule) {
    return (
      <article className={cardClassName}>
        <p className="eyebrow">Bin ID</p>
        <h1>{binId}</h1>
        <div className="status-card__current">Scheduled clean</div>
        <dl className="status-card__details">
          <div>
            <dt>Date and time</dt>
            <dd>{scheduledDateTime}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{status}</dd>
          </div>
        </dl>
        {statusList}
        <div className="status-card__actions">
          {cleanerButton}
          {updateButton}
          <a
            className="primary-action calendar-button"
            download={`binboss-${binId}-clean.ics`}
            href={calendarUrl}
          >
            Add to calendar
          </a>
        </div>
      </article>
    )
  }

  return (
    <article className={cardClassName}>
      <p className="eyebrow">Bin ID</p>
      <h1>{binId}</h1>
      <div className="status-card__current">{status}</div>
      {statusList}
      <div className="status-card__actions">
        {cleanerButton}
        {updateButton}
      </div>
    </article>
  )
}

export default StatusCard
