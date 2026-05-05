const navItems = [
  { id: 'status', label: 'Status', icon: 'S' },
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'profile', label: 'Profile', icon: 'P' },
]

function Navbar({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => (
        <button
          aria-current={activeTab === item.id ? 'page' : undefined}
          className={`nav-tab ${activeTab === item.id ? 'nav-tab--active' : ''}`}
          key={item.id}
          onClick={() => onTabChange(item.id)}
          type="button"
        >
          <span className="nav-tab__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navbar
