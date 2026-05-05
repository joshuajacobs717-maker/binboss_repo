import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import CleanerCard from '../components/CleanerCard.jsx'
import FindCleanerButton from '../components/FindCleanerButton.jsx'
import RecyclingBinModel from '../components/RecyclingBinModel.jsx'

const cleaner = {
  name: 'Amara',
  surname: 'Green',
  email: 'amara.green@binboss.co.za',
  phone: '+27725550198',
  initials: 'AG',
  rating: '4.9/5',
  binsCleaned: 1248,
}

const binDetails = {
  binId: 'BIN-6F5F',
  userInitials: 'JM',
  address: '24 Greenway Road, Johannesburg',
}

function Home({ onCleanerAccepted }) {
  const [isSearching, setIsSearching] = useState(false)
  const [foundCleaner, setFoundCleaner] = useState(null)
  const [showQrCode, setShowQrCode] = useState(false)

  const qrValue = `Bin ID: ${binDetails.binId}
User initials: ${binDetails.userInitials}
Address: ${binDetails.address}`

  useEffect(() => {
    if (!isSearching) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setFoundCleaner(cleaner)
      setIsSearching(false)
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [isSearching])

  const handleFindCleaner = () => {
    setFoundCleaner(null)
    setIsSearching(true)
  }

  const handleAcceptCleaner = () => {
    onCleanerAccepted(foundCleaner)
    setFoundCleaner(null)
  }

  return (
    <section className="page home-page">
      <div className="home-top">
        <p className="eyebrow">BinBoss</p>
        <h1>Your clean bin is one tap away</h1>
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

      <FindCleanerButton isSearching={isSearching} onFindCleaner={handleFindCleaner} />
      <button className="qr-fab" onClick={() => setShowQrCode(true)} type="button">
        <span className="qr-fab__icon" aria-hidden="true" />
        <span className="sr-only">Show bin QR code</span>
      </button>

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
          onReject={() => setFoundCleaner(null)}
        />
      )}
    </section>
  )
}

export default Home
