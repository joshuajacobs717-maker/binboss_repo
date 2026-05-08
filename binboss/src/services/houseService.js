import api from "./api.js"

export const registerHouse = async ({
  first_name, last_name, email, contact, password, photo,
  house_number, street_name, place, postal_code
}) => {
  const res = await api.post("/house/register", {
    first_name, last_name, email, contact, password,
    photo: photo || null,
    house_number, street_name, place, postal_code
  })
  return res.data
}

export const loginHouse = async ({ email, password }) => {
  const res = await api.post("/house/login", { email, password })
  return res.data
}

export const getHouseProfile = async () => {
  const res = await api.get("/house/profile")
  return res.data
}