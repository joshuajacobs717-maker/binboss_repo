function LogoutButton({ onLogout }) {
  return (
    <button className="logout-button" onClick={onLogout} type="button">
      Log out
    </button>
  )
}

export default LogoutButton
