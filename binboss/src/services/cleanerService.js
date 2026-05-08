import api from "./api.js"

export const registerCleaner = async ({
  first_name, last_name, email, contact,
  id_number, password, photo
}) => {
  const res = await api.post("/cleaner/register", {
    first_name,
    last_name,
    email,
    contact,
    id_number,
    password,
    photo // required for cleaners
  })
  return res.data
}

export const loginCleaner = async ({ email, password }) => {
  const res = await api.post("/cleaner/login", { email, password })
  return res.data // { token, user: { cleaner_id, first_name, last_name, email, role } }
}

export const getCleanerProfile = async () => {
  const res = await api.get("/cleaner/profile")
  return res.data
}