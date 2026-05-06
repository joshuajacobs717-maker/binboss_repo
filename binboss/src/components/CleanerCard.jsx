function CleanerCard({
  cleaner,
  mode = 'choice',
  onAccept,
  onReject,
  title = mode === 'view' ? 'Assigned cleaner' : 'Cleaner found',
}) {
  if (!cleaner) {
    return null
  }

  return (
    <aside
      className={`cleaner-card ${mode === 'view' ? 'cleaner-card--view' : ''}`}
      aria-live="polite"
    >
      <button className="icon-button cleaner-card__close" onClick={onReject} type="button">
        x
      </button>
      <div className="cleaner-card__avatar" aria-hidden="true">
        {cleaner.initials || cleaner.name.charAt(0)}
      </div>
      <div>
        <p className="eyebrow">{title}</p>
        <h2>
          {cleaner.name} {cleaner.surname}
        </h2>
      </div>
      <dl className="cleaner-stats">
        <div>
          <dt>Rating</dt>
          <dd className="rating-value">
            <span className="star-icon" aria-hidden="true" />
            {cleaner.rating}
          </dd>
        </div>
        <div>
          <dt>Bins cleaned</dt>
          <dd>{cleaner.binsCleaned}</dd>
        </div>
      </dl>
      {mode === 'choice' && (
        <div className="cleaner-actions">
          <button className="secondary-action" onClick={onReject} type="button">
            Reject
          </button>
          <button className="primary-action cleaner-actions__accept" onClick={onAccept} type="button">
            Accept
          </button>
        </div>
      )}
    </aside>
  )
}

export default CleanerCard
