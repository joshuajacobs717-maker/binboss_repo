import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import Status from './pages/Status.jsx'
import Navbar from './components/Navbar.jsx'
import { getTranslator } from './i18n.js'

const tabs = {
  status: Status,
  home: Home,
  profile: Profile,
}

const activeCleaner = {
  name: 'Amara',
  surname: 'Green',
  email: 'amara.green@binboss.co.za',
  phone: '+27725550198',
  idNumber: '9001015800085',
  initials: 'AG',
  rating: '4.9/5',
  binsCleaned: 1248,
}

const initialCleanerRequests = [
  {
    id: 'request-bk-731',
    binId: 'BIN-BK731',
    cleaner: activeCleaner,
    requestType: 'instant',
    schedule: null,
    status: 'Not collected',
    address: '8 Jacaranda Lane, Johannesburg',
    ownerInitials: 'BK',
  },
  {
    id: 'request-sm-482',
    binId: 'BIN-SM482',
    cleaner: activeCleaner,
    requestType: 'scheduled',
    schedule: {
      date: '2026-05-08',
      time: '10:30',
    },
    status: 'Not collected',
    address: '16 Parkview Avenue, Johannesburg',
    ownerInitials: 'SM',
  },
]

const defaultProfiles = {
  homeowner: {
    name: 'Joshua Jacobs',
    firstName: 'Joshua',
    lastName: 'Jacobs',
    email: 'joshua@example.com',
    phone: '+27 72 555 0198',
    contact: '+27 72 555 0198',
    address: '24 Greenway Road, Johannesburg',
    addressParts: {
      houseNumber: '24',
      streetName: 'Greenway Road',
      place: 'Johannesburg',
      postalCode: '',
    },
    initials: 'JJ',
    binId: 'BIN-6F5F',
    photoUrl: '',
  },
  cleaner: {
    name: 'Amara Green',
    firstName: 'Amara',
    lastName: 'Green',
    email: 'amara.green@binboss.co.za',
    phone: '+27 72 555 0198',
    contact: '+27 72 555 0198',
    idNumber: '9001015800085',
    initials: 'AG',
    photoUrl: '',
  },
}

function App() {
  const [role, setRole] = useState(null)
  const [profiles, setProfiles] = useState(defaultProfiles)
  const [activeTab, setActiveTab] = useState('home')
  const [activeJobs, setActiveJobs] = useState([])
  const [pastJobs, setPastJobs] = useState([])
  const [cleanerRequests, setCleanerRequests] = useState(initialCleanerRequests)
  const [showSplash, setShowSplash] = useState(true)
  const [isCleanerAvailable, setIsCleanerAvailable] = useState(false)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 1700)

    return () => window.clearTimeout(timer)
  }, [])

  const handleLogin = (selectedRole, signupProfile = null) => {
    if (signupProfile) {
      setProfiles((currentProfiles) => ({
        ...currentProfiles,
        [selectedRole]: {
          ...currentProfiles[selectedRole],
          ...signupProfile,
        },
      }))
    }

    setRole(selectedRole)
    setActiveTab('home')
  }

  const handleLogout = () => {
    setRole(null)
    setActiveTab('home')
  }

  const handleCleanerRequestAccepted = (request) => {
    setCleanerRequests((requests) => requests.filter((currentRequest) => currentRequest.id !== request.id))
    setActiveJobs((jobs) => [request, ...jobs])
  }

  const handleCleanerRequestRejected = (requestId) => {
    setCleanerRequests((requests) => requests.filter((request) => request.id !== requestId))
  }

  const sendBookingNotification = () => {
    const title = t('bookingMadeTitle')
    const body = t('bookingMadeBody')

    if (!('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      new Notification(title, { body })
      return
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      })
    }
  }

  const handleJobStatusUpdate = (jobId, status, photo = null) => {
    setActiveJobs((jobs) =>
      jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
              photos: {
                ...job.photos,
                ...(photo ? { [status.toLowerCase()]: photo } : {}),
              },
              awaitingHomeownerVerification: status === 'Returned',
            }
          : job,
      ),
    )

    if (status === 'Returned') {
      setPastJobs((past) => {
        const existingJob = past.find((job) => job.id === jobId)
        const currentJob = activeJobs.find((job) => job.id === jobId)

        if (!currentJob) {
          return past
        }

        const completedJob = {
          ...currentJob,
          status,
          photos: {
            ...currentJob.photos,
            ...(photo ? { [status.toLowerCase()]: photo } : {}),
          },
          awaitingHomeownerVerification: true,
          completedAt: existingJob?.completedAt || new Date().toISOString(),
        }

        if (existingJob) {
          return past.map((job) => (job.id === jobId ? { ...job, ...completedJob } : job))
        }

        return [completedJob, ...past]
      })
    }
  }

  const handleReturnVerified = (jobId, rating) => {
    setPastJobs((past) =>
      past.map((job) =>
        job.id === jobId
          ? {
              ...job,
              homeownerVerified: true,
              homeownerRating: rating,
            }
          : job,
      ),
    )
    setActiveJobs((jobs) => jobs.filter((job) => job.id !== jobId))
  }

  const handleJobCanceled = (jobId) => {
    setActiveJobs((jobs) => jobs.filter((job) => job.id !== jobId))
  }

  const ActivePage = tabs[activeTab]
  const activeProfile = profiles[role] || defaultProfiles.homeowner
  const homeownerProfile = profiles.homeowner
  const t = getTranslator(language)
  const pageProps = {
    home: {
      activeJobs,
      cleanerRequests,
      homeownerProfile,
      isCleanerAvailable,
      onCleanerAvailabilityChange: setIsCleanerAvailable,
      onCleanerRequestAccepted: handleCleanerRequestAccepted,
      onCleanerRequestRejected: handleCleanerRequestRejected,
      onCleanerAccepted: (cleaner, schedule = null, cleanDetails = null) => {
        setActiveJobs((jobs) => [
          {
            id: `${Date.now()}-${cleaner.email}`,
            binId: homeownerProfile.binId,
            cleaner,
            requestType: schedule ? 'scheduled' : 'instant',
            schedule,
            cleanDetails,
            status: 'Not collected',
            address: homeownerProfile.address,
            ownerInitials: homeownerProfile.initials,
          },
          ...jobs,
        ])
        sendBookingNotification()
        setActiveTab('status')
      },
      role,
      t,
    },
    status: {
      activeJobs,
      onJobCancel: handleJobCanceled,
      onJobStatusUpdate: handleJobStatusUpdate,
      onReturnVerified: handleReturnVerified,
      pastJobs,
      role,
      t,
    },
    profile: {
      language,
      onLogout: handleLogout,
      onLanguageChange: setLanguage,
      profile: activeProfile,
      onProfileChange: (updatedProfile) => {
        setProfiles((currentProfiles) => ({
          ...currentProfiles,
          [role]: updatedProfile,
        }))
      },
      t,
    },
  }

  return (
    <main className="app-shell">
      {showSplash && (
        <section className="splash-screen" aria-label="Welcome">
          <span>Bin there. Cleaned that.</span>
        </section>
      )}

      {role ? (
        <section className={`phone-frame ${showSplash ? 'phone-frame--hidden' : ''}`}>
          <ActivePage {...pageProps[activeTab]} />
          <Navbar activeTab={activeTab} onTabChange={setActiveTab} t={t} />
        </section>
      ) : (
        <Login onLogin={handleLogin} t={t} />
      )}
    </main>
  )
}

export default App
