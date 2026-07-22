"use client"

import { useState } from "react"
import { useAuth } from "../../lib/auth"
import { apiPut } from "../../lib/api"

export default function CompanyProfilePage() {
  const { user, updateUser } = useAuth()
  const [fullname, setFullname] = useState(user?.fullname || "")
  const [photo, setPhoto] = useState(user?.photo || "")
  const [profile, setProfile] = useState(user?.profile || "")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: "", text: "" })
    try {
      const data = await apiPut("/auth/profile/", { fullname, photo, profile })
      updateUser(data)
      setMessage({ type: "success", text: "Profil berhasil diperbarui" })
    } catch (err) {
      setMessage({ type: "danger", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lx-animate" style={{ maxWidth: 600 }}>
      <div className="mb-4">
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>Profil Perusahaan</h1>
        <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
          Atur profil akun admin perusahaan
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="lx-avatar lx-avatar-lg">
              {photo ? <img src={photo} alt={fullname} /> : (fullname || "A")[0]?.toUpperCase()}
            </div>
            <div>
              <h5 style={{ fontWeight: 700, marginBottom: "0.15rem" }}>{fullname || "Admin"}</h5>
              <p className="text-secondary mb-0" style={{ fontSize: "0.85rem" }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label">Nama Lengkap</label>
              <input
                className="form-control form-control"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">URL Foto</label>
              <input
                className="form-control form-control"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Profil</label>
              <textarea
                className="form-control form-control"
                rows={4}
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="Deskripsi singkat tentang Anda..."
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
