import api from "./api.js"

// used internally by houseService during registration
// but exported in case you need it elsewhere
export const createAddress = async ({ house_number, street_name, place, postal_code }) => {
  const res = await api.post("/address", {
    house_number,
    street_name,
    place,
    postal_code
  })
  return res.data // { message: "Address created", address_id: 1 }
}

export const getAddressById = async (id) => {
  const res = await api.get(`/address/${id}`)
  return res.data
}