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

const binOptions = [
  { id: 'small', label: 'Small bin', price: 50 },
  { id: 'normal', label: 'Normal bin', price: 100 },
  { id: 'large', label: 'Large bin', price: 400 },
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
  return (
    value.match(/Bin Code:\s*([A-Z0-9-]+)/i)?.[1] ||
    value.match(/Bin ID:\s*([A-Z0-9-]+)/i)?.[1] ||
    value.match(/BIN-[A-Z0-9-]+/i)?.[0] ||
    ''
  )
}

function Home({
  activeJobs = [],
  cleanerRequests = [],
  homeownerProfile,
  cleanerProfile,
  isCleanerAvailable = false,
  onCleanerAccepted,
  onCleanerAvailabilityChange,
  onCleanerRequestAccepted,
  onCleanerRequestRejected,
  role = 'homeowner',
  t = (key) => key,
}) {
  const [isSearching, setIsSearching] = useState(false)
  const [foundCleaner, setFoundCleaner] = useState(null)
  const [showQrCode, setShowQrCode] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [hasScannerStream, setHasScannerStream] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const [scanStatus, setScanStatus] = useState(null)
  const [scannedBin, setScannedBin] = useState(null)
  const [scheduledClean, setScheduledClean] = useState(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [pendingCleanType, setPendingCleanType] = useState(null)
  const [selectedBinType, setSelectedBinType] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [selectedCleanDetails, setSelectedCleanDetails] = useState(null)
  const scannerStreamRef = useRef(null)
  const scannerVideoRef = useRef(null)
  const scannerFrameRef = useRef(null)
  const scannerDetectorRef = useRef(null)
  const scanStatusTimeoutRef = useRef(null)
  const binDetails = {
    binId: homeownerProfile?.binId || 'BIN-6F5F',
    userInitials: homeownerProfile?.initials || 'BB',
    address: homeownerProfile?.address || 'Address pending',
  }

  const qrValue = `Bin Code: ${binDetails.binId}
Owner initials: ${binDetails.userInitials}
Address: ${binDetails.address}`
  const today = new Date().toISOString().slice(0, 10)
  const cleanerJobs = useMemo(
    () => {
      const relevantJobs =
        role === 'cleaner' && cleanerProfile
          ? activeJobs.filter((job) => job.cleaner?.email === cleanerProfile.email)
          : activeJobs

      return relevantJobs.filter((job) => !(job.status === 'Returned' && job.awaitingHomeownerVerification)).sort((firstJob, secondJob) => {
        if (firstJob.requestType !== secondJob.requestType) {
          return firstJob.requestType === 'instant' ? -1 : 1
        }

        return `${firstJob.schedule?.date || ''}${firstJob.schedule?.time || ''}`.localeCompare(
          `${secondJob.schedule?.date || ''}${secondJob.schedule?.time || ''}`,
        )
      })
    },
    [activeJobs, cleanerProfile, role],
  )
  const currentCleanerRequest = isCleanerAvailable ? cleanerRequests[0] : null

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
    clearTimeout(scanStatusTimeoutRef.current)
    scanStatusTimeoutRef.current = null
    setHasScannerStream(false)
    setShowScanner(false)
    setScanStatus(null)
  }, [])

  const handleScannedValue = useCallback(
    (value) => {
      const binId = getBinIdFromScan(value)
      if (!binId) {
        setScanStatus({ type: 'error', message: 'No bin code found in the QR code.' })
        clearTimeout(scanStatusTimeoutRef.current)
        scanStatusTimeoutRef.current = window.setTimeout(() => setScanStatus(null), 2000)
        return
      }

      const jobsToCheck =
        role === 'cleaner' && cleanerProfile
          ? activeJobs.filter((job) => job.cleaner?.email === cleanerProfile.email)
          : activeJobs

      const matchedJob = jobsToCheck.find((job) => job.binId.toLowerCase() === binId.toLowerCase())

      if (matchedJob) {
        setScannedBin(matchedJob)
        setScanStatus({ type: 'success', message: 'Bin code verified.' })
        clearTimeout(scanStatusTimeoutRef.current)
        scanStatusTimeoutRef.current = window.setTimeout(() => setScanStatus(null), 2000)
        stopScanner()
        return
      }

      setScanStatus({ type: 'error', message: 'Scanned code does not match your assigned bin.' })
      clearTimeout(scanStatusTimeoutRef.current)
      scanStatusTimeoutRef.current = window.setTimeout(() => setScanStatus(null), 2000)
    },
    [activeJobs, cleanerProfile, role, stopScanner],
  )

  const startScanner = async () => {
    setScannerError('')
    setScanStatus(null)
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

  const resetCleanSelection = () => {
    setPendingCleanType(null)
    setSelectedBinType('')
    setPaymentMethod('card')
  }

  const handleFindCleaner = () => {
    setFoundCleaner(null)
    setScheduledClean(null)
    setSelectedCleanDetails(null)
    setPendingCleanType('instant')
  }

  const handleScheduleClean = () => {
    setFoundCleaner(null)
    setScheduledClean(null)
    setSelectedCleanDetails(null)
    setPendingCleanType('scheduled')
  }

  const handleStartSearch = (event) => {
    event.preventDefault()

    const selectedBin = binOptions.find((binOption) => binOption.id === selectedBinType)

    if (!selectedBin) {
      return
    }

    const cleanDetails = {
      binType: selectedBin.label,
      binCost: selectedBin.price,
      paymentMethod,
    }

    setSelectedCleanDetails(cleanDetails)
    setScheduledClean(
      pendingCleanType === 'scheduled'
        ? {
            date: scheduleDate,
            time: scheduleTime,
          }
        : null,
    )
    resetCleanSelection()
    setIsSearching(true)
  }

  const handleAcceptCleaner = () => {
    onCleanerAccepted(foundCleaner, scheduledClean, selectedCleanDetails)
    setFoundCleaner(null)
    setScheduledClean(null)
    setSelectedCleanDetails(null)
  }

  const handleRejectCleaner = () => {
    setFoundCleaner(null)
    setScheduledClean(null)
    setSelectedCleanDetails(null)
  }

  if (role === 'cleaner') {
    return (
      <section className="page home-page cleaner-home-page">
        <div className="home-top">
          <p className="eyebrow">{t('cleanerSchedule')}</p>
          <h1>{t('assignedBins')}</h1>
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
              <p>{t('noAssignedBins')}</p>
            </div>
          )}
        </div>

        {!isCleanerAvailable && (
          <p className="availability-hint">{t('noOrdersUntilAvailable')}</p>
        )}

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
                  ? t('homeownerNeedsCleaner')
                  : formatSchedule(currentCleanerRequest.schedule)}
              </p>
              <h2>{currentCleanerRequest.binId}</h2>
            </div>
            <dl className="homeowner-request-card__details">
              <div>
                <dt>{t('owner')}</dt>
                <dd>{currentCleanerRequest.ownerInitials}</dd>
              </div>
              <div>
                <dt>{t('address')}</dt>
                <dd>{currentCleanerRequest.address}</dd>
              </div>
            </dl>
            <div className="cleaner-actions">
              <button
                className="secondary-action"
                onClick={() => onCleanerRequestRejected(currentCleanerRequest.id)}
                type="button"
              >
                {t('reject')}
              </button>
              <button
                className="primary-action cleaner-actions__accept"
                onClick={() => onCleanerRequestAccepted(currentCleanerRequest)}
                type="button"
              >
                {t('accept')}
              </button>
            </div>
          </aside>
        )}

        <button
          className={`availability-toggle ${isCleanerAvailable ? 'availability-toggle--active' : ''}`}
          onClick={() => onCleanerAvailabilityChange?.(!isCleanerAvailable)}
          type="button"
        >
          <span>{isCleanerAvailable ? t('availableForOrders') : t('unavailableForOrders')}</span>
          <strong>{isCleanerAvailable ? t('setUnavailable') : t('setAvailable')}</strong>
        </button>

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
              {scanStatus && (
                <div className={`scan-result scan-result--${scanStatus.type}`} role="status" aria-live="polite">
                  <span aria-hidden="true">{scanStatus.type === 'success' ? '✔' : '✕'}</span> {scanStatus.message}
                </div>
              )}
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
        <p className="eyebrow">Scentora</p>

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
            <p>{t('searchingForCleaners')}</p>
          </div>
        )}
      </div>

      <div className="home-actions">
        <FindCleanerButton isSearching={isSearching} onFindCleaner={handleFindCleaner} t={t} />
        <button
          className="secondary-action schedule-clean-button"
          disabled={isSearching}
          onClick={handleScheduleClean}
          type="button"
        >
          {t('scheduleClean')}
        </button>
      </div>
      <button className="qr-fab" onClick={() => setShowQrCode(true)} type="button">
        <span className="qr-fab__icon" aria-hidden="true" />
        <span className="sr-only">{t('showBinQr')}</span>
      </button>

      {pendingCleanType && !isSearching && (
        <form className="clean-options-panel" onSubmit={handleStartSearch}>
          <div className="modal-header">
            <p className="eyebrow">{pendingCleanType === 'instant' ? t('findCleaner') : t('scheduleClean')}</p>
            <button className="icon-button" onClick={resetCleanSelection} type="button">
              x
            </button>
          </div>

          <div className="bin-cost-list" role="radiogroup" aria-label="Select bin size">
            {binOptions.map((binOption) => (
              <label key={binOption.id}>
                <input
                  checked={selectedBinType === binOption.id}
                  name="binType"
                  onChange={() => setSelectedBinType(binOption.id)}
                  required
                  type="radio"
                  value={binOption.id}
                />
                <span>{binOption.label}</span>
                <strong>R {binOption.price}</strong>
              </label>
            ))}
          </div>

          <div className="payment-method-toggle" role="radiogroup" aria-label="Select payment method">
            {['card', 'cash'].map((method) => (
              <label className={paymentMethod === method ? 'payment-method-toggle__option--active' : ''} key={method}>
                <input
                  checked={paymentMethod === method}
                  name="paymentMethod"
                  onChange={() => setPaymentMethod(method)}
                  type="radio"
                  value={method}
                />
                {method}
              </label>
            ))}
          </div>

          {pendingCleanType === 'scheduled' && (
            <div className="schedule-form">
              <label>
                {t('date')}
                <input
                  min={today}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  required
                  type="date"
                  value={scheduleDate}
                />
              </label>
              <label>
                {t('time')}
                <input
                  onChange={(event) => setScheduleTime(event.target.value)}
                  required
                  type="time"
                  value={scheduleTime}
                />
              </label>
            </div>
          )}

          <button className="primary-action" type="submit">
            {pendingCleanType === 'instant' ? t('startSearch') : t('findScheduledCleaner')}
          </button>
        </form>
      )}

      {showQrCode && (
        <div className="modal-backdrop" role="presentation">
          <section className="qr-modal" aria-label="Bin QR code">
            <div className="modal-header">
              <p className="eyebrow">{t('binVerification')}</p>
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
          t={t}
        />
      )}
    </section>
  )
}

export default Home
