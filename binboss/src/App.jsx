import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import Status from './pages/Status.jsx'
import Navbar from './components/Navbar.jsx'

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

function App() {
  const [role, setRole] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [activeJobs, setActiveJobs] = useState([])
  const [pastJobs, setPastJobs] = useState([])
  const [cleanerRequests, setCleanerRequests] = useState(initialCleanerRequests)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 1700)

    return () => window.clearTimeout(timer)
  }, [])

  const handleLogin = (selectedRole) => {
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

  const handleJobStatusUpdate = (jobId, status, photo = null) => {
    setActiveJobs((jobs) =>
      jobs.map((job) => {
        if (job.id !== jobId) {
          return job
        }

        const updatedJob = {
          ...job,
          status,
          photos: {
            ...job.photos,
            ...(photo ? { [status.toLowerCase()]: photo } : {}),
          },
          awaitingHomeownerVerification: status === 'Returned',
        }

        if (status === 'Returned') {
          setPastJobs((past) => [
            {
              ...updatedJob,
              completedAt: new Date().toISOString(),
            },
            ...past,
          ])
        }

        return updatedJob
      }),
    )
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

  const ActivePage = tabs[activeTab]
  const pageProps = {
    home: {
      activeJobs,
      cleanerRequests,
      onCleanerRequestAccepted: handleCleanerRequestAccepted,
      onCleanerRequestRejected: handleCleanerRequestRejected,
      onCleanerAccepted: (cleaner, schedule = null) => {
        setActiveJobs((jobs) => [
          {
            id: `${Date.now()}-${cleaner.email}`,
            binId: 'BIN-6F5F',
            cleaner,
            requestType: schedule ? 'scheduled' : 'instant',
            schedule,
            status: 'Not collected',
            address: '24 Greenway Road, Johannesburg',
            ownerInitials: 'JM',
          },
          ...jobs,
        ])
        setActiveTab('status')
      },
      role,
    },
    status: {
      activeJobs,
      onJobStatusUpdate: handleJobStatusUpdate,
      onReturnVerified: handleReturnVerified,
      pastJobs,
      role,
    },
    profile: {
      onLogout: handleLogout,
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
          <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        </section>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </main>
  )
}

export default App
