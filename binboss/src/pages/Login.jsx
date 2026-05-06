import { useState } from 'react'

const credentials = {
  homeowner: {
    email: 'homeowner@binboss.co.za',
    password: 'home123',
  },
  cleaner: {
    email: 'cleaner@binboss.co.za',
    password: 'clean123',
  },
}

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
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

  return (
    <section className="login-page" aria-label="Sign in">
      <div className="login-panel">
        <p className="eyebrow">BinBoss</p>
        <h1>Sign in</h1>

        {!selectedRole ? (
          <div className="login-actions">
            <button className="primary-action" onClick={() => handleRoleSelect('homeowner')} type="button">
              Sign in as homeowner
            </button>
            <button className="secondary-action" onClick={() => handleRoleSelect('cleaner')} type="button">
              Sign in as cleaner
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-role-row">
              <h2>{selectedRole === 'homeowner' ? 'Homeowner' : 'Cleaner'}</h2>
              <button className="secondary-action login-back-button" onClick={() => setSelectedRole(null)} type="button">
                Change
              </button>
            </div>
            <label>
              Email
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
              Sign in
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default Login
