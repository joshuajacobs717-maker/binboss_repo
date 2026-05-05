function CleanerCard({ cleaner, onAccept, onReject }) {
  if (!cleaner) {
    return null
  }

  return (
    <aside className="cleaner-card" aria-live="polite">
      <button className="icon-button cleaner-card__close" onClick={onReject} type="button">
        x
      </button>
      <div className="cleaner-card__avatar" aria-hidden="true">
        {cleaner.name.charAt(0)}
      </div>
      <div>
        <p className="eyebrow">Cleaner found</p>
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
      <div className="cleaner-actions">
        <button className="secondary-action" onClick={onReject} type="button">
          Reject
        </button>
        <button className="primary-action cleaner-actions__accept" onClick={onAccept} type="button">
          Accept
        </button>
      </div>
    </aside>
  )
}

export default CleanerCard
