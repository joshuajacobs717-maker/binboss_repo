import axios from "axios"

const api = axios.create({
  baseURL: "https://scentora.up.railway.app",
  headers: {
    "Content-Type": "application/json"
  }
})

// automatically attach token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api