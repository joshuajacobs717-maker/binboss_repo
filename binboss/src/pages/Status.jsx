import { useState } from 'react'
import StatusCard from '../components/StatusCard.jsx'

function Status({ activeJob }) {
  const [showCleanerDetails, setShowCleanerDetails] = useState(false)
  const cleaner = activeJob?.cleaner

  return (
    <section className="page status-page">
      <div className="status-intro">
        <p className="eyebrow">Current order</p>
        <h1>Cleaning status</h1>
      </div>
      {activeJob ? (
        <>
          <StatusCard
            binId={activeJob.binId}
            onClick={() => setShowCleanerDetails(true)}
            status={activeJob.status}
          />

          {showCleanerDetails && (
            <div className="modal-backdrop" role="presentation">
              <section className="cleaner-details-modal" aria-label="Cleaner details">
                <div className="modal-header">
                  <div className="cleaner-profile-photo" aria-hidden="true">
                    {cleaner.photoUrl ? (
                      <img alt="" src={cleaner.photoUrl} />
                    ) : (
                      cleaner.initials || `${cleaner.name[0]}${cleaner.surname[0]}`
                    )}
                  </div>
                  <div>
                    <p className="eyebrow">Assigned cleaner</p>
                    <h2>
                      {cleaner.name} {cleaner.surname}
                    </h2>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setShowCleanerDetails(false)}
                    type="button"
                  >
                    x
                  </button>
                </div>

                <dl className="cleaner-details-list">
                  <div>
                    <dt>Name</dt>
                    <dd>{cleaner.name}</dd>
                  </div>
                  <div>
                    <dt>Surname</dt>
                    <dd>{cleaner.surname}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{cleaner.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{cleaner.phone}</dd>
                  </div>
                  <div>
                    <dt>Rating</dt>
                    <dd className="rating-value">
                      <span className="star-icon" aria-hidden="true" />
                      {cleaner.rating}
                    </dd>
                  </div>
                  <div>
                    <dt>Amount of bins</dt>
                    <dd>{cleaner.binsCleaned}</dd>
                  </div>
                </dl>

                <a className="call-cleaner-button" href={`tel:${cleaner.phone}`}>
                  <span className="phone-icon" aria-hidden="true" />
                  Call cleaner
                </a>
              </section>
            </div>
          )}
        </>
      ) : (
        <div className="empty-status">
          <div className="empty-status__icon" aria-hidden="true">
            <span />
          </div>
          <p>No bins being cleaned</p>
        </div>
      )}
    </section>
  )
}

export default Status
