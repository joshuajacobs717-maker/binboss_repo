import { useEffect, useRef, useState } from 'react'
import EditDetailsButton from '../components/EditDetailsButton.jsx'
import LogoutButton from '../components/LogoutButton.jsx'

const initialProfile = {
  name: 'Joshua Jacobs',
  email: 'joshua@example.com',
  phone: '+27 72 555 0198',
  address: '24 Greenway Road, Johannesburg',
  photoUrl: '',
}

function Profile({ onLogout }) {
  const [profile, setProfile] = useState(initialProfile)
  const [cameraError, setCameraError] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const streamRef = useRef(null)
  const videoRef = useRef(null)

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setProfile((currentProfile) => ({
        ...currentProfile,
        photoUrl: reader.result,
      }))
    }

    reader.readAsDataURL(file)
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsCameraOpen(false)
  }

  const openCamera = async () => {
    setCameraError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not available on this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
        },
      })

      streamRef.current = stream
      setIsCameraOpen(true)
    } catch {
      setCameraError('Camera permission was blocked or unavailable.')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current

    if (!video) {
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    setProfile((currentProfile) => ({
      ...currentProfile,
      photoUrl: canvas.toDataURL('image/jpeg', 0.9),
    }))
    stopCamera()
  }

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isCameraOpen])

  useEffect(() => stopCamera, [])

  return (
    <section className="page profile-page">
      <div className="profile-header">
        <div className="profile-photo" aria-label={`${profile.name} profile picture`}>
          {profile.photoUrl ? <img alt="" src={profile.photoUrl} /> : initials}
        </div>
        <div className="profile-photo-actions">
          <button className="photo-action-button" onClick={openCamera} type="button">
            Take photo
          </button>
          <label className="photo-action-button">
            Upload photo
            <input accept="image/*" onChange={handlePhotoChange} type="file" />
          </label>
        </div>
        {cameraError && <p className="camera-error">{cameraError}</p>}
        <h1>{profile.name}</h1>
      </div>

      <div className="profile-details">
        <div className="profile-details__title">
          <h2>Details</h2>
          <EditDetailsButton profile={profile} onSave={setProfile} />
        </div>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{profile.phone}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{profile.address}</dd>
          </div>
        </dl>
      </div>

      <LogoutButton onLogout={onLogout} />

      {isCameraOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="camera-modal" aria-label="Take profile photo">
            <div className="modal-header">
              <p className="eyebrow">Take photo</p>
              <button className="icon-button" onClick={stopCamera} type="button">
                x
              </button>
            </div>
            <video autoPlay className="camera-preview" muted playsInline ref={videoRef} />
            <button className="primary-action" onClick={capturePhoto} type="button">
              Use photo
            </button>
          </section>
        </div>
      )}
    </section>
  )
}

export default Profile
