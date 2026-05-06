import { useEffect, useMemo, useRef, useState } from 'react'
import CleanerCard from '../components/CleanerCard.jsx'
import StatusCard from '../components/StatusCard.jsx'

const photoRequiredStatuses = ['Collected', 'Returned']

function Status({
  activeJobs = [],
  onJobStatusUpdate,
  onReturnVerified,
  pastJobs = [],
  role = 'homeowner',
}) {
  const [selectedCleaner, setSelectedCleaner] = useState(null)
  const [selectedBin, setSelectedBin] = useState(null)
  const [pendingPhotoUpdate, setPendingPhotoUpdate] = useState(null)
  const [hasCameraStream, setHasCameraStream] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [contactCleaner, setContactCleaner] = useState(null)
  const [ratingJob, setRatingJob] = useState(null)
  const [rating, setRating] = useState('5')
  const [showPastJobs, setShowPastJobs] = useState(false)
  const streamRef = useRef(null)
  const videoRef = useRef(null)
  const isCleaner = role === 'cleaner'
  const visibleJobs = useMemo(
    () =>
      isCleaner
        ? activeJobs.filter((job) => !(job.status === 'Returned' && job.awaitingHomeownerVerification))
        : activeJobs,
    [activeJobs, isCleaner],
  )
  const hasJobs = visibleJobs.length > 0
  const useCompactCards = visibleJobs.length > 1
  const historyLabel = isCleaner ? 'View past bins' : 'View past cleans'
  const returnedPromptJob =
    !isCleaner && !ratingJob && !contactCleaner
      ? activeJobs.find((job) => job.status === 'Returned' && job.awaitingHomeownerVerification)
      : null

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setHasCameraStream(false)
    setPendingPhotoUpdate(null)
  }

  const openCameraForStatus = async (job, status) => {
    setCameraError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not available on this browser.')
      setPendingPhotoUpdate({ job, status })
      return
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
        },
      })
      setHasCameraStream(true)
      setPendingPhotoUpdate({ job, status })
    } catch {
      setCameraError('Camera permission was blocked or unavailable.')
      setHasCameraStream(false)
      setPendingPhotoUpdate({ job, status })
    }
  }

  const handleStatusChange = (job, status) => {
    if (photoRequiredStatuses.includes(status)) {
      openCameraForStatus(job, status)
      return
    }

    onJobStatusUpdate(job.id, status)
  }

  const captureStatusPhoto = () => {
    const video = videoRef.current
    const update = pendingPhotoUpdate

    if (!update) {
      return
    }

    if (!video || !video.videoWidth) {
      onJobStatusUpdate(update.job.id, update.status)
      stopCamera()
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    onJobStatusUpdate(update.job.id, update.status, canvas.toDataURL('image/jpeg', 0.9))
    stopCamera()
  }

  const handleReturnYes = (job) => {
    setRating('5')
    setRatingJob(job)
  }

  const submitRating = (event) => {
    event.preventDefault()

    if (ratingJob) {
      onReturnVerified(ratingJob.id, rating)
      setRatingJob(null)
    }
  }

  useEffect(() => {
    if (pendingPhotoUpdate && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [pendingPhotoUpdate])

  useEffect(() => stopCamera, [])

  return (
    <section className="page status-page">
      <div className="status-intro">
        <p className="eyebrow">Current orders</p>
        <h1>Cleaning status</h1>
      </div>

      {hasJobs ? (
        <div className={`status-list ${useCompactCards ? 'status-list--compact' : ''}`}>
          {visibleJobs.map((job) => (
            <StatusCard
              actionLabel={isCleaner ? 'View bin' : 'View cleaner'}
              binId={job.binId}
              compact={useCompactCards}
              key={job.id}
              onStatusChange={(nextStatus) => handleStatusChange(job, nextStatus)}
              onViewCleaner={() => (isCleaner ? setSelectedBin(job) : setSelectedCleaner(job.cleaner))}
              schedule={job.schedule}
              showStatusControls={isCleaner}
              status={job.status}
            />
          ))}
        </div>
      ) : (
        <div className="empty-status">
          <div className="empty-status__icon" aria-hidden="true">
            <span />
          </div>
          <p>No bins being cleaned</p>
        </div>
      )}

      <button className="secondary-action history-button" onClick={() => setShowPastJobs(true)} type="button">
        {historyLabel}
      </button>

      {selectedCleaner && (
        <div className="modal-backdrop" role="presentation">
          <CleanerCard
            cleaner={selectedCleaner}
            mode="view"
            onReject={() => setSelectedCleaner(null)}
          />
        </div>
      )}

      {selectedBin && (
        <div className="modal-backdrop" role="presentation">
          <section className="bin-details-modal" aria-label="Bin details">
            <div className="modal-header">
              <p className="eyebrow">Assigned bin</p>
              <button className="icon-button" onClick={() => setSelectedBin(null)} type="button">
                x
              </button>
            </div>
            <dl className="bin-details-list">
              <div>
                <dt>Bin ID</dt>
                <dd>{selectedBin.binId}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{selectedBin.address}</dd>
              </div>
              <div>
                <dt>Owner initials</dt>
                <dd>{selectedBin.ownerInitials}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      {pendingPhotoUpdate && (
        <div className="modal-backdrop" role="presentation">
          <section className="camera-modal" aria-label="Capture bin photo">
            <div className="modal-header">
              <p className="eyebrow">{pendingPhotoUpdate.status} photo</p>
              <button className="icon-button" onClick={stopCamera} type="button">
                x
              </button>
            </div>
            {hasCameraStream && (
              <video autoPlay className="camera-preview" muted playsInline ref={videoRef} />
            )}
            {cameraError && <p className="camera-error">{cameraError}</p>}
            <button className="primary-action" onClick={captureStatusPhoto} type="button">
              Use photo
            </button>
          </section>
        </div>
      )}

      {returnedPromptJob && (
        <div className="modal-backdrop" role="presentation">
          <section className="bin-details-modal" aria-label="Confirm returned bin">
            <div className="modal-header">
              <p className="eyebrow">Bin returned</p>
            </div>
            <h2>Has your bin been returned?</h2>
            <div className="modal-actions">
              <button className="secondary-action" onClick={() => setContactCleaner(returnedPromptJob.cleaner)} type="button">
                No
              </button>
              <button className="primary-action" onClick={() => handleReturnYes(returnedPromptJob)} type="button">
                Yes
              </button>
            </div>
          </section>
        </div>
      )}

      {ratingJob && (
        <div className="modal-backdrop" role="presentation">
          <section className="bin-details-modal" aria-label="Rate cleaner">
            <div className="modal-header">
              <p className="eyebrow">Rate cleaner</p>
            </div>
            <form className="rating-form" onSubmit={submitRating}>
              <label>
                Cleaner rating
                <select onChange={(event) => setRating(event.target.value)} value={rating}>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Okay</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Bad</option>
                </select>
              </label>
              <button className="primary-action" type="submit">
                Submit rating
              </button>
            </form>
          </section>
        </div>
      )}

      {contactCleaner && (
        <div className="modal-backdrop" role="presentation">
          <section className="cleaner-details-modal" aria-label="Cleaner contact details">
            <div className="modal-header">
              <p className="eyebrow">Cleaner contact</p>
              <button className="icon-button" onClick={() => setContactCleaner(null)} type="button">
                x
              </button>
            </div>
            <dl className="cleaner-details-list">
              <div>
                <dt>Name</dt>
                <dd>{contactCleaner.name}</dd>
              </div>
              <div>
                <dt>Surname</dt>
                <dd>{contactCleaner.surname}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{contactCleaner.phone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{contactCleaner.email}</dd>
              </div>
              <div>
                <dt>ID number</dt>
                <dd>{contactCleaner.idNumber}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      {showPastJobs && (
        <div className="modal-backdrop" role="presentation">
          <section className="past-jobs-modal" aria-label={historyLabel}>
            <div className="modal-header">
              <p className="eyebrow">{historyLabel}</p>
              <button className="icon-button" onClick={() => setShowPastJobs(false)} type="button">
                x
              </button>
            </div>
            <div className="past-jobs-list">
              {pastJobs.length ? (
                pastJobs.map((job) => (
                  <article className="past-job-card" key={`${job.id}-${job.completedAt || job.status}`}>
                    <h2>{job.binId}</h2>
                    <p>{job.address}</p>
                    <dl className="bin-details-list">
                      <div>
                        <dt>Status</dt>
                        <dd>{job.status}</dd>
                      </div>
                      <div>
                        <dt>Cleaner</dt>
                        <dd>
                          {job.cleaner.name} {job.cleaner.surname}
                        </dd>
                      </div>
                      {job.homeownerRating && (
                        <div>
                          <dt>Rating</dt>
                          <dd>{job.homeownerRating}/5</dd>
                        </div>
                      )}
                    </dl>
                  </article>
                ))
              ) : (
                <p className="empty-history">No past jobs yet</p>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default Status
