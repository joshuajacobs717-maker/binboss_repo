const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// uploads photo directly to Cloudinary from the browser
// returns the secure URL string to store in your DB
export const uploadPhoto = async (file) => {
  if (!file) throw new Error("No file provided")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)
  formData.append("folder", "bin-boss/cleaners") // organizes in Cloudinary dashboard

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!res.ok) {
    throw new Error("Photo upload failed")
  }

  const data = await res.json()
  return data.secure_url // this is what you store in DB — e.g. https://res.cloudinary.com/...
}