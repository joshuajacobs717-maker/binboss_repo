const statusSteps = ['Not collected', 'Collected', 'Cleaned', 'Returned']

function StatusCard({ binId = 'BIN-2048', onClick, status = 'Cleaned' }) {
  const activeIndex = statusSteps.indexOf(status)

  return (
    <article
      className={`status-card ${onClick ? 'status-card--interactive' : ''}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onClick()
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <p className="eyebrow">Bin ID</p>
      <h1>{binId}</h1>
      <div className="status-card__current">{status}</div>
      <ol className="status-steps">
        {statusSteps.map((step, index) => (
          <li
            className={`status-step ${index <= activeIndex ? 'status-step--complete' : ''}`}
            key={step}
          >
            <span aria-hidden="true" />
            {step}
          </li>
        ))}
      </ol>
    </article>
  )
}

export default StatusCard
