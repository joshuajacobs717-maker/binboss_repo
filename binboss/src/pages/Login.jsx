import { useState } from 'react'

const credentials = {
  homeowner: {
    email: 'homeowner@a',
    password: 'home123',
  },
  cleaner: {
    email: 'cleaner@a',
    password: 'clean123',
  },
}

const getInitials = (name, lastName) =>
  `${name?.trim().charAt(0) || ''}${lastName?.trim().charAt(0) || ''}`.toUpperCase() || 'BB'

function Login({ onLogin, t = (key) => key }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [signupRole, setSignupRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleSignUpSelect = (role) => {
    setSignupRole(role)
    setError('')
  }

  const handleBackToSignIn = () => {
    setAuthMode('signin')
    setSignupRole(null)
    setSelectedRole(null)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (
      email.trim().toLowerCase() === credentials[selectedRole].email &&
      password === credentials[selectedRole].password
    ) {
      onLogin(selectedRole)
      return
    }

    setError('Credentials do not match this sign in type.')
  }

  const handleSignUpSubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name').trim()
    const lastName = formData.get('lastName').trim()
    const contact = formData.get('contact').trim()
    const newPassword = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const idNumber = formData.get('idNumber')
    const addressParts = {
      houseNumber: formData.get('houseNumber')?.trim() || '',
      streetName: formData.get('streetName')?.trim() || '',
      place: formData.get('place')?.trim() || '',
      postalCode: formData.get('postalCode')?.trim() || '',
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (signupRole === 'cleaner' && !/^\d{13}$/.test(idNumber)) {
      setError('South African ID number must be exactly 13 digits.')
      return
    }

    onLogin(signupRole, {
      name: `${name} ${lastName}`,
      firstName: name,
      lastName,
      email: formData.get('email').trim(),
      phone: contact,
      contact,
      idNumber: signupRole === 'cleaner' ? idNumber : '',
      initials: getInitials(name, lastName),
      address:
        signupRole === 'homeowner'
          ? `${addressParts.houseNumber} ${addressParts.streetName}, ${addressParts.place}, ${addressParts.postalCode}`
          : '',
      addressParts,
      binId: signupRole === 'homeowner' ? 'BIN-6F5F' : '',
      photoUrl: '',
    })
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
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button className="primary-action" type="submit">
          {t('signIn')}
        </button>
      </form>
    )
  }

  const renderSignUp = () => {
    if (!signupRole) {
      return (
        <div className="login-actions">
          <button className="primary-action" onClick={() => handleSignUpSelect('homeowner')} type="button">
            {t('homeowner')}
          </button>
          <button className="secondary-action" onClick={() => handleSignUpSelect('cleaner')} type="button">
            {t('cleaner')}
          </button>
          <button className="secondary-action login-signup-button" onClick={handleBackToSignIn} type="button">
            {t('backToSignIn')}
          </button>
        </div>
      )
    }

    return (
      <form className="login-form signup-form" onSubmit={handleSignUpSubmit}>
        <div className="login-role-row">
          <h2>{signupRole === 'homeowner' ? t('homeowner') : t('cleaner')}</h2>
          <button className="secondary-action login-back-button" onClick={() => handleSignUpSelect(null)} type="button">
            {t('change')}
          </button>
        </div>
        <div className="signup-field-grid">
          <label>
            {t('name')}
            <input autoComplete="given-name" name="name" required type="text" />
          </label>
          <label>
            {t('lastName')}
            <input autoComplete="family-name" name="lastName" required type="text" />
          </label>
          <label>
            {t('email')}
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            {t('contact')}
            <input autoComplete="tel" name="contact" required type="tel" />
          </label>
          {signupRole === 'cleaner' && (
            <label className="signup-field-grid__full">
              {t('idNumber')}
              <input
                inputMode="numeric"
                maxLength={13}
                name="idNumber"
                pattern="[0-9]{13}"
                required
                title="Enter a 13 digit South African ID number."
                type="text"
              />
            </label>
          )}
          <label>
            Password
            <input autoComplete="new-password" name="password" required type="password" />
          </label>
          <label>
            Confirm password
            <input autoComplete="new-password" name="confirmPassword" required type="password" />
          </label>
        </div>
        {signupRole === 'homeowner' && (
          <fieldset className="signup-address">
            <legend>Address</legend>
            <div className="signup-field-grid">
              <label>
                House number
                <input autoComplete="address-line1" name="houseNumber" required type="text" />
              </label>
              <label>
                Street name
                <input autoComplete="address-line1" name="streetName" required type="text" />
              </label>
              <label>
                Place
                <input autoComplete="address-level2" name="place" required type="text" />
              </label>
              <label>
                Postal code
                <input autoComplete="postal-code" inputMode="numeric" name="postalCode" required type="text" />
              </label>
            </div>
          </fieldset>
        )}
        {error && <p className="login-error">{error}</p>}
        <button className="primary-action" type="submit">
          {t('signUp')}
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
