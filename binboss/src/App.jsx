import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Status from './pages/Status.jsx'
import Navbar from './components/Navbar.jsx'

const tabs = {
  status: Status,
  home: Home,
  profile: Profile,
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [activeJob, setActiveJob] = useState(null)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 1700)

    return () => window.clearTimeout(timer)
  }, [])

  const ActivePage = tabs[activeTab]
  const pageProps = {
    home: {
      onCleanerAccepted: (cleaner) => {
        setActiveJob({
          binId: 'BIN-6F5F',
          cleaner,
          status: 'Not collected',
        })
        setActiveTab('status')
      },
    },
    status: {
      activeJob,
    },
    profile: {},
  }

  return (
    <main className="app-shell">
      {showSplash && (
        <section className="splash-screen" aria-label="Welcome">
          <span>Bin there. Cleaned that.</span>
        </section>
      )}

      <section className={`phone-frame ${showSplash ? 'phone-frame--hidden' : ''}`}>
        <ActivePage {...pageProps[activeTab]} />
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      </section>
    </main>
  )
}

export default App
