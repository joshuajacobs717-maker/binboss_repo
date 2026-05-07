import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import CleanerCard from '../components/CleanerCard.jsx'
import FindCleanerButton from '../components/FindCleanerButton.jsx'
import RecyclingBinModel from '../components/RecyclingBinModel.jsx'

const cleaners = [
  {
    name: 'Amara',
    surname: 'Green',
    email: 'amara.green@binboss.co.za',
    phone: '+27725550198',
    idNumber: '9001015800085',
    initials: 'AG',
    rating: '4.9/5',
    binsCleaned: 1248,
  },
  {
    name: 'Thabo',
    surname: 'Mokoena',
    email: 'thabo.mokoena@binboss.co.za',
    phone: '+27725550144',
    idNumber: '8806145700082',
    initials: 'TM',
    rating: '4.8/5',
    binsCleaned: 982,
  },
  {
    name: 'Priya',
    surname: 'Naidoo',
    email: 'priya.naidoo@binboss.co.za',
    phone: '+27725550163',
    idNumber: '9203280334081',
    initials: 'PN',
    rating: '4.7/5',
    binsCleaned: 1136,
  },
  {
    name: 'Lerato',
    surname: 'Dlamini',
    email: 'lerato.dlamini@binboss.co.za',
    phone: '+27725550187',
    idNumber: '9509110455086',
    initials: 'LD',
    rating: '5.0/5',
    binsCleaned: 1511,
  },
]

function formatSchedule(schedule) {
  if (!schedule?.date || !schedule?.time) {
    return 'Now'
  }

  return new Date(`${schedule.date}T${schedule.time}`).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getBinIdFromScan(value) {
  return value.match(/Bin ID:\s*([A-Z0-9-]+)/i)?.[1] || value.match(/BIN-[A-Z0-9-]+/i)?.[0] || ''
}

function Home({
  activeJobs = [],
  cleanerRequests = [],
  homeownerProfile,
  onCleanerAccepted,
  onCleanerRequestAccepted,
  onCleanerRequestRejected,
  role = 'homeowner',
}) {
  const [isSearching, setIsSearching] = useState(false)
  const [foundCleaner, setFoundCleaner] = useState(null)
  const [showQrCode, setShowQrCode] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [hasScannerStream, setHasScannerStream] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const [scannedBin, setScannedBin] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduledClean, setScheduledClean] = useState(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const scannerStreamRef = useRef(null)
  const scannerVideoRef = useRef(null)
  const scannerFrameRef = useRef(null)
  const scannerDetectorRef = useRef(null)
  const binDetails = {
    binId: homeownerProfile?.binId || 'BIN-6F5F',
    userInitials: homeownerProfile?.initials || 'BB',
    address: homeownerProfile?.address || 'Address pending',
  }

  const qrValue = `Bin ID: ${binDetails.binId}
User initials: ${binDetails.userInitials}
Address: ${binDetails.address}`
  const today = new Date().toISOString().slice(0, 10)
  const cleanerJobs = useMemo(
    () =>
      activeJobs.filter((job) => !(job.status === 'Returned' && job.awaitingHomeownerVerification)).sort((firstJob, secondJob) => {
        if (firstJob.requestType !== secondJob.requestType) {
          return firstJob.requestType === 'instant' ? -1 : 1
        }

        return `${firstJob.schedule?.date || ''}${firstJob.schedule?.time || ''}`.localeCompare(
          `${secondJob.schedule?.date || ''}${secondJob.schedule?.time || ''}`,
        )
      }),
    [activeJobs],
  )
  const currentCleanerRequest = cleanerRequests[0]

  useEffect(() => {
    if (!isSearching) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setFoundCleaner(cleaners[Math.floor(Math.random() * cleaners.length)])
      setIsSearching(false)
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [isSearching])

  const stopScanner = useCallback(() => {
    if (scannerFrameRef.current) {
      window.cancelAnimationFrame(scannerFrameRef.current)
      scannerFrameRef.current = null
    }

    scannerStreamRef.current?.getTracks().forEach((track) => track.stop())
    scannerStreamRef.current = null
    scannerDetectorRef.current = null
    setHasScannerStream(false)
    setShowScanner(false)
  }, [])

  const handleScannedValue = useCallback((value) => {
    const binId = getBinIdFromScan(value)
    const matchedJob = activeJobs.find((job) => job.binId.toLowerCase() === binId.toLowerCase())

    if (matchedJob) {
      setScannedBin(matchedJob)
      stopScanner()
      return
    }

    setScannerError('Scanned code did not match an assigned bin.')
  }, [activeJobs, stopScanner])

  const startScanner = async () => {
    setScannerError('')
    setScannedBin(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('Camera is not available on this browser.')
      setShowScanner(true)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
        },
      })

      scannerStreamRef.current = stream
      setHasScannerStream(true)

      if ('BarcodeDetector' in window) {
        try {
          scannerDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
        } catch {
          setScannerError('QR scanning is not supported by this browser. Use the test scan button below.')
        }
      } else {
        setScannerError('QR scanning is not supported by this browser. Use the test scan button below.')
      }

      setShowScanner(true)
    } catch {
      setScannerError('Camera permission was blocked or unavailable.')
      setHasScannerStream(false)
      setShowScanner(true)
    }
  }

  useEffect(() => {
    if (!showScanner || !scannerVideoRef.current || !scannerStreamRef.current) {
      return undefined
    }

    const video = scannerVideoRef.current
    video.srcObject = scannerStreamRef.current

    const detector = scannerDetectorRef.current

    if (!detector) {
      return undefined
    }

    let isActive = true

    const scanFrame = async () => {
      if (!isActive || !video.videoWidth) {
        scannerFrameRef.current = window.requestAnimationFrame(scanFrame)
        return
      }

      try {
        const codes = await detector.detect(video)

        if (codes[0]?.rawValue) {
          handleScannedValue(codes[0].rawValue)
          return
        }
      } catch {
        setScannerError('QR scanning paused. Use the test scan button below.')
      }

      scannerFrameRef.current = window.requestAnimationFrame(scanFrame)
    }

    scannerFrameRef.current = window.requestAnimationFrame(scanFrame)

    return () => {
      isActive = false
      if (scannerFrameRef.current) {
        window.cancelAnimationFrame(scannerFrameRef.current)
      }
    }
  }, [showScanner, handleScannedValue])

  useEffect(() => stopScanner, [stopScanner])

  const handleFindCleaner = () => {
    setFoundCleaner(null)
    setScheduledClean(null)
    setIsSearching(true)
  }

  const handleScheduleClean = (event) => {
    event.preventDefault()
    setFoundCleaner(null)
    setScheduledClean({
      date: scheduleDate,
      time: scheduleTime,
    })
    setShowScheduleModal(false)
    setIsSearching(true)
  }

  const handleAcceptCleaner = () => {
    onCleanerAccepted(foundCleaner, scheduledClean)
    setFoundCleaner(null)
    setScheduledClean(null)
  }

  const handleRejectCleaner = () => {
    setFoundCleaner(null)
    setScheduledClean(null)
  }

  if (role === 'cleaner') {
    return (
      <section className="page home-page cleaner-home-page">
        <div className="home-top">
          <p className="eyebrow">Cleaner schedule</p>
          <h1>Assigned bins</h1>
        </div>

        <div className="cleaner-schedule-list">
          {cleanerJobs.length ? (
            cleanerJobs.map((job) => (
              <article
                className={`cleaner-schedule-card ${
                  job.requestType === 'instant' ? 'cleaner-schedule-card--urgent' : ''
                }`}
                key={job.id}
              >
                <div>
                  <p className="eyebrow">
                    {job.requestType === 'instant' ? 'Find cleaner' : formatSchedule(job.schedule)}
                  </p>
                  <h2>{job.binId}</h2>
                </div>
                <p>{job.address}</p>
              </article>
            ))
          ) : (
            <div className="empty-status">
              <div className="empty-status__icon" aria-hidden="true">
                <span />
              </div>
              <p>No assigned bins yet</p>
            </div>
          )}
        </div>

        <button className="qr-fab scanner-fab" onClick={startScanner} type="button">
          <span className="scanner-fab__icon" aria-hidden="true" />
          <span className="sr-only">Scan bin QR code</span>
        </button>

        {currentCleanerRequest && (
          <aside className="homeowner-request-card" aria-live="polite">
            <button
              className="icon-button homeowner-request-card__close"
              onClick={() => onCleanerRequestRejected(currentCleanerRequest.id)}
              type="button"
            >
              x
            </button>
            <div className="homeowner-request-card__avatar" aria-hidden="true">
              {currentCleanerRequest.ownerInitials}
            </div>
            <div>
              <p className="eyebrow">
                {currentCleanerRequest.requestType === 'instant'
                  ? 'Homeowner needs a cleaner'
                  : formatSchedule(currentCleanerRequest.schedule)}
              </p>
              <h2>{currentCleanerRequest.binId}</h2>
            </div>
            <dl className="homeowner-request-card__details">
              <div>
                <dt>Owner</dt>
                <dd>{currentCleanerRequest.ownerInitials}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{currentCleanerRequest.address}</dd>
              </div>
            </dl>
            <div className="cleaner-actions">
              <button
                className="secondary-action"
                onClick={() => onCleanerRequestRejected(currentCleanerRequest.id)}
                type="button"
              >
                Reject
              </button>
              <button
                className="primary-action cleaner-actions__accept"
                onClick={() => onCleanerRequestAccepted(currentCleanerRequest)}
                type="button"
              >
                Accept
              </button>
            </div>
          </aside>
        )}

        {showScanner && (
          <div className="modal-backdrop" role="presentation">
            <section className="qr-modal scanner-modal" aria-label="Scan bin QR code">
              <div className="modal-header">
                <p className="eyebrow">Scan bin</p>
                <button className="icon-button" onClick={stopScanner} type="button">
                  x
                </button>
              </div>
              {hasScannerStream && (
                <video autoPlay className="scanner-preview" muted playsInline ref={scannerVideoRef} />
              )}
              {scannerError && <p className="camera-error">{scannerError}</p>}
              <button
                className="primary-action"
                disabled={!cleanerJobs.length}
                onClick={() => handleScannedValue(cleanerJobs[0]?.binId || '')}
                type="button"
              >
                Test scan first bin
              </button>
            </section>
          </div>
        )}

        {scannedBin && (
          <div className="modal-backdrop" role="presentation">
            <section className="bin-details-modal" aria-label="Scanned bin">
              <div className="modal-header">
                <p className="eyebrow">Scanned bin</p>
                <button className="icon-button" onClick={() => setScannedBin(null)} type="button">
                  x
                </button>
              </div>
              <dl className="bin-details-list">
                <div>
                  <dt>Bin ID</dt>
                  <dd>{scannedBin.binId}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{scannedBin.address}</dd>
                </div>
                <div>
                  <dt>Owner initials</dt>
                  <dd>{scannedBin.ownerInitials}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="page home-page">
      <div className="home-top">
        <p className="eyebrow">BinBoss</p>

      </div>

      <div className="bin-stage" aria-label={isSearching ? 'Searching for cleaners' : 'Recycling bin model'}>
        <div className={`bin-display ${isSearching ? 'bin-display--hidden' : ''}`}>
          <RecyclingBinModel />
          <div className="bin-glow" aria-hidden="true" />
        </div>

        {isSearching && (
          <div className="radar-search" aria-live="polite">
            <div className="radar-search__screen" aria-hidden="true">
              <span className="radar-search__sweep" />
              <span className="radar-search__dot radar-search__dot--one" />
              <span className="radar-search__dot radar-search__dot--two" />
              <span className="radar-search__dot radar-search__dot--three" />
            </div>
            <p>Searching for cleaners</p>
          </div>
        )}
      </div>

      <div className="home-actions">
        <FindCleanerButton isSearching={isSearching} onFindCleaner={handleFindCleaner} />
        <button
          className="secondary-action schedule-clean-button"
          disabled={isSearching}
          onClick={() => setShowScheduleModal(true)}
          type="button"
        >
          Schedule clean
        </button>
      </div>
      <button className="qr-fab" onClick={() => setShowQrCode(true)} type="button">
        <span className="qr-fab__icon" aria-hidden="true" />
        <span className="sr-only">Show bin QR code</span>
      </button>

      {showScheduleModal && (
        <div className="modal-backdrop" role="presentation">
          <section className="schedule-modal" aria-label="Schedule bin clean">
            <div className="modal-header">
              <p className="eyebrow">Schedule clean</p>
              <button
                className="icon-button"
                onClick={() => setShowScheduleModal(false)}
                type="button"
              >
                x
              </button>
            </div>

            <form className="schedule-form" onSubmit={handleScheduleClean}>
              <label>
                Date
                <input
                  min={today}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  required
                  type="date"
                  value={scheduleDate}
                />
              </label>
              <label>
                Time
                <input
                  onChange={(event) => setScheduleTime(event.target.value)}
                  required
                  type="time"
                  value={scheduleTime}
                />
              </label>
              <button className="primary-action" type="submit">
                Find scheduled cleaner
              </button>
            </form>
          </section>
        </div>
      )}

      {showQrCode && (
        <div className="modal-backdrop" role="presentation">
          <section className="qr-modal" aria-label="Bin QR code">
            <div className="modal-header">
              <p className="eyebrow">Bin verification</p>
              <button className="icon-button" onClick={() => setShowQrCode(false)} type="button">
                x
              </button>
            </div>

            <div className="qr-code-frame">
              <QRCodeSVG
                bgColor="#ffffff"
                fgColor="#1f6f5f"
                level="H"
                marginSize={2}
                size={260}
                value={qrValue}
              />
              <div className="qr-code-badge" aria-hidden="true">
                BB
              </div>
            </div>
          </section>
        </div>
      )}

      {foundCleaner && (
        <CleanerCard
          cleaner={foundCleaner}
          onAccept={handleAcceptCleaner}
          onReject={handleRejectCleaner}
        />
      )}
    </section>
  )
}

export default Home
