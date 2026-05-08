import { useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { uploadPhoto } from "../services/cloudinaryService.js"

function Login({ onLogin, t = (key) => key }) {
  const { signIn, signUp } = useAuth()
  const [selectedRole, setSelectedRole] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [signupRole, setSignupRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleBackToSignIn = () => {
    setAuthMode('signin')
    setSignupRole(null)
    setSelectedRole(null)
    setEmail('')
    setPassword('')
    setError('')
    setPhotoPreview(null)
    setPhotoFile(null)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    // show preview
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // map 'homeowner' role to 'house' for backend
      const backendRole = selectedRole === 'homeowner' ? 'house' : 'cleaner'
      const user = await signIn(backendRole, { email, password })
      onLogin(user.role, user)
    } catch (err) {
      setError(err.response?.data?.message || "Sign in failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignUpSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    const first_name = formData.get('name').trim()
    const last_name = formData.get('lastName').trim()
    const emailVal = formData.get('email').trim()
    const contact = formData.get('contact').trim()
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setSubmitting(false)
      return
    }

    try {
// replace the cleaner block inside handleSignUpSubmit with this:
      if (signupRole === 'cleaner') {
        const id_number = formData.get('idNumber')
        if (!/^\d{13}$/.test(id_number)) {
          setError('South African ID number must be exactly 13 digits.')
          setSubmitting(false)
          return
        }
        if (!photoFile) {
          setError('A profile photo is required for cleaners.')
          setSubmitting(false)
          return
        }

        // upload to Cloudinary first — get back a URL
        const photoUrl = await uploadPhoto(photoFile)
        console.log("Cloudinary URL:", photoUrl)
        console.log("Type:", typeof photoUrl)
        // then register cleaner with the URL — no large payload
        const user = await signUp('cleaner', {
          first_name, last_name, email: emailVal, contact,
          id_number, password,
          photo: photoUrl // just a URL string — tiny payload
        })
        console.log({
          first_name,
          last_name,
          email: emailVal,
          contact,
          id_number,
          password,
          photo: photoUrl
        })
        onLogin(user.role, user)
      } else {
        const house_number = formData.get('houseNumber').trim()
        const street_name = formData.get('streetName').trim()
        const place = formData.get('place').trim()
        const postal_code = formData.get('postalCode').trim()
        const user = await signUp('house', {
          first_name, last_name, email: emailVal, contact, password,
          house_number, street_name, place, postal_code,
          photo: null // optional for house
        })
        onLogin(user.role, user)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  const renderSignIn = () => {
    if (!selectedRole) {
      return (
        <div className="login-actions">
          <button className="primary-action" onClick={() => handleRoleSelect('homeowner')} type="button">
            {t('signInHomeowner')}
          </button>
          <button className="secondary-action" onClick={() => handleRoleSelect('cleaner')} type="button">
            {t('signInCleaner')}
          </button>
          <p className="login-divider">or</p>
          <button className="secondary-action login-signup-button" onClick={() => setAuthMode('signup')} type="button">
            {t('signUp')}
          </button>
        </div>
      )
    }

    return (
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-role-row">
          <h2>{selectedRole === 'homeowner' ? t('homeowner') : t('cleaner')}</h2>
          <button className="secondary-action login-back-button" onClick={() => setSelectedRole(null)} type="button">
            {t('change')}
          </button>
        </div>
        <label>
          {t('email')}
          <input autoComplete="email" onChange={(e) => setEmail(e.target.value)} required type="email" value={email} />
        </label>
        <label>
          Password
          <input autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} required type="password" value={password} />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button className="primary-action" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : t('signIn')}
        </button>
      </form>
    )
  }

  const renderSignUp = () => {
    if (!signupRole) {
      return (
        <div className="login-actions">
          <button className="primary-action" onClick={() => setSignupRole('homeowner')} type="button">{t('homeowner')}</button>
          <button className="secondary-action" onClick={() => setSignupRole('cleaner')} type="button">{t('cleaner')}</button>
          <button className="secondary-action login-signup-button" onClick={handleBackToSignIn} type="button">{t('backToSignIn')}</button>
        </div>
      )
    }

    return (
      <form className="login-form signup-form" onSubmit={handleSignUpSubmit}>
        <div className="login-role-row">
          <h2>{signupRole === 'homeowner' ? t('homeowner') : t('cleaner')}</h2>
          <button className="secondary-action login-back-button" onClick={() => { setSignupRole(null); setPhotoPreview(null); setPhotoFile(null) }} type="button">{t('change')}</button>
        </div>
        <div className="signup-field-grid">
          <label>{t('name')}<input autoComplete="given-name" name="name" required type="text" /></label>
          <label>{t('lastName')}<input autoComplete="family-name" name="lastName" required type="text" /></label>
          <label>{t('email')}<input autoComplete="email" name="email" required type="email" /></label>
          <label>{t('contact')}<input autoComplete="tel" name="contact" required type="tel" /></label>
          {signupRole === 'cleaner' && (
            <>
              <label className="signup-field-grid__full">
                {t('idNumber')}
                <input inputMode="numeric" maxLength={13} name="idNumber" pattern="[0-9]{13}" required type="text" />
              </label>
              <label className="signup-field-grid__full">
                Profile Photo (required)
                <input accept="image/*" onChange={handlePhotoChange} required type="file" />
              </label>
              {photoPreview && (
                <div className="signup-field-grid__full">
                  <img src={photoPreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              )}
            </>
          )}
          <label>Password<input autoComplete="new-password" name="password" required type="password" /></label>
          <label>Confirm password<input autoComplete="new-password" name="confirmPassword" required type="password" /></label>
        </div>
        {signupRole === 'homeowner' && (
          <fieldset className="signup-address">
            <legend>Address</legend>
            <div className="signup-field-grid">
              <label>House number<input autoComplete="address-line1" name="houseNumber" required type="text" /></label>
              <label>Street name<input autoComplete="address-line1" name="streetName" required type="text" /></label>
              <label>Place<input autoComplete="address-level2" name="place" required type="text" /></label>
              <label>Postal code<input autoComplete="postal-code" inputMode="numeric" name="postalCode" required type="text" /></label>
            </div>
          </fieldset>
        )}
        {error && <p className="login-error">{error}</p>}
        <button className="primary-action" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : t('signUp')}
        </button>
      </form>
    )
  }

  return (
    <section className="login-page" aria-label={authMode === 'signin' ? 'Sign in' : 'Sign up'}>
      <div className={`login-panel ${signupRole ? 'login-panel--wide' : ''}`}>
        <div className="login-panel__header">
          <p className="eyebrow">BinBoss</p>
          <h1>{authMode === 'signup' ? t('signUp') : t('welcome')}</h1>
        </div>
        {authMode === 'signup' ? renderSignUp() : renderSignIn()}
      </div>
    </section>
  )
}

export default Login