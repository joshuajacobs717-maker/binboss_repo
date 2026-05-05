import { useState } from 'react'

function EditDetailsButton({ profile, onSave }) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState(profile)

  const handleChange = (event) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(draft)
    setIsOpen(false)
  }

  return (
    <>
      <button className="edit-details-button" onClick={() => setIsOpen(true)} type="button">
        Edit
      </button>

      {isOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="details-modal" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>Edit details</h2>
              <button className="icon-button" onClick={() => setIsOpen(false)} type="button">
                x
              </button>
            </div>

            <label>
              Name
              <input name="name" onChange={handleChange} value={draft.name} />
            </label>
            <label>
              Email
              <input name="email" onChange={handleChange} type="email" value={draft.email} />
            </label>
            <label>
              Phone
              <input name="phone" onChange={handleChange} value={draft.phone} />
            </label>
            <label>
              Address
              <textarea name="address" onChange={handleChange} rows="3" value={draft.address} />
            </label>

            <button className="primary-action" type="submit">
              Save
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default EditDetailsButton
