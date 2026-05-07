function CleanerCard({
  cleaner,
  mode = 'choice',
  onAccept,
  onReject,
  title = '',
  t = (key) => key,
}) {
  if (!cleaner) {
    return null
  }

  const cardTitle = title || (mode === 'view' ? t('assignedCleaner') : 'Cleaner found')

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
        <p className="eyebrow">{cardTitle}</p>
        <h2>
          {cleaner.name} {cleaner.surname}
        </h2>
      </div>
      <dl className="cleaner-stats">
        <div>
          <dt>{t('rating')}</dt>
          <dd className="rating-value">
            <span className="star-icon" aria-hidden="true" />
            {cleaner.rating}
          </dd>
        </div>
        <div>
          <dt>{t('binsCleaned')}</dt>
          <dd>{cleaner.binsCleaned}</dd>
        </div>
      </dl>
      {mode === 'choice' && (
        <div className="cleaner-actions">
          <button className="secondary-action" onClick={onReject} type="button">
            {t('reject')}
          </button>
          <button className="primary-action cleaner-actions__accept" onClick={onAccept} type="button">
            {t('accept')}
          </button>
        </div>
      )}
    </aside>
  )
}

export default CleanerCard
