import { useEffect, useRef, useState, useCallback } from 'react';
import EditDetailsButton from '../components/EditDetailsButton.jsx';
import LogoutButton from '../components/LogoutButton.jsx';
import { languages } from '../i18n.js';

const defaultProfile = {
  name: 'Guest User',
  firstName: 'Guest',
  lastName: 'User',
  email: '',
  phone: '',
  contact: '',
  address: '',
  initials: 'GU',
  binId: '',
  photoUrl: '',
};

function Profile({
  language = 'en',
  onLanguageChange,
  onLogout,
  onProfileChange,
  profile: savedProfile = defaultProfile,
  t = (key) => key,
}) {
  const [cameraError, setCameraError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const streamRef = useRef(null);
  const videoRef = useRef(null);

  // Safely merge saved profile with defaults
  const profile = { ...defaultProfile, ...savedProfile };

  // Safe initials calculation
  const initials = profile.initials || 
    (profile.name || '')
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    '??';

  const saveProfile = (nextProfile) => {
    onProfileChange?.(nextProfile);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      saveProfile({ ...profile, photoUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  }, []);

  const openCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not available on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      console.error(err);
      setCameraError('Camera permission was blocked or unavailable.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    saveProfile({
      ...profile,
      photoUrl: canvas.toDataURL('image/jpeg', 0.9),
    });
    stopCamera();
  };

  // Set video stream when camera opens
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <section className="page profile-page">
      <button
        aria-label={t('chooseLanguage')}
        className="language-button"
        onClick={() => setIsLanguageOpen(true)}
        type="button"
      >
        💬
      </button>

      <div className="profile-header">
        <div className="profile-photo" aria-label={`${profile.name} profile picture`}>
          {profile.photoUrl ? (
            <img alt="" src={profile.photoUrl} />
          ) : (
            <span className="initials">{initials}</span>
          )}
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
          <h2>{t('details')}</h2>
          <EditDetailsButton profile={profile} onSave={saveProfile} />
        </div>

        <dl>
          <div><dt>{t('name')}</dt><dd>{profile.firstName || profile.name}</dd></div>
          {profile.lastName && (
            <div><dt>{t('lastName')}</dt><dd>{profile.lastName}</dd></div>
          )}
          <div><dt>{t('email')}</dt><dd>{profile.email}</dd></div>
          <div><dt>{t('phone')}</dt><dd>{profile.phone || profile.contact}</dd></div>
          
          {profile.idNumber && (
            <div><dt>{t('idNumber')}</dt><dd>{profile.idNumber}</dd></div>
          )}
          {profile.address && (
            <div><dt>{t('address')}</dt><dd>{profile.address}</dd></div>
          )}
          {profile.binId && (
            <div><dt>{t('binId')}</dt><dd>{profile.binId}</dd></div>
          )}
        </dl>
      </div>

      <LogoutButton onLogout={onLogout} />

      {/* Language Modal */}
      {isLanguageOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="language-modal" aria-label={t('selectLanguage')}>
            <div className="modal-header">
              <p className="eyebrow">{t('language')}</p>
              <button className="icon-button" onClick={() => setIsLanguageOpen(false)} type="button">x</button>
            </div>
            <div className="language-list">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  className={`language-option ${language === lang.id ? 'language-option--active' : ''}`}
                  onClick={() => {
                    onLanguageChange?.(lang.id);
                    setIsLanguageOpen(false);
                  }}
                  type="button"
                >
                  {t(lang.labelKey)}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="camera-modal" aria-label="Take profile photo">
            <div className="modal-header">
              <p className="eyebrow">Take photo</p>
              <button className="icon-button" onClick={stopCamera} type="button">x</button>
            </div>
            <video
              autoPlay
              muted
              playsInline
              ref={videoRef}
              className="camera-preview"
            />
            <button className="primary-action" onClick={capturePhoto} type="button">
              Use photo
            </button>
          </section>
        </div>
      )}
    </section>
  );
}

export default Profile;