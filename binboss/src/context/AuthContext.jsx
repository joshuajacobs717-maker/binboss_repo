import { createContext, useContext, useState, useEffect } from "react"
import { loginHouse, registerHouse } from "../services/houseService.js"
import { loginCleaner, registerCleaner } from "../services/cleanerService.js"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // restore session from localStorage on app load
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (role, credentials) => {
    const data = role === "house"
      ? await loginHouse(credentials)
      : await loginCleaner(credentials)

    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const signUp = async (role, formData) => {
    if (role === "house") {
      await registerHouse(formData) // creates address + house in one go
    } else {
      await registerCleaner(formData)
    }
    // after signup, auto sign them in
    return await signIn(role, {
      email: formData.email,
      password: formData.password
    })
  }

  const signOut = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// custom hook — use this in any component instead of useContext directly
export const useAuth = () => useContext(AuthContext)

export default AuthContext