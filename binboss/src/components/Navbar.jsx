const navItems = [
  { id: 'status', labelKey: 'status', icon: 'S' },
  { id: 'home', labelKey: 'home', icon: 'H' },
  { id: 'profile', labelKey: 'profile', icon: 'P' },
]

function Navbar({ activeTab, onTabChange, t = (key) => key }) {
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
          <span>{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navbar
