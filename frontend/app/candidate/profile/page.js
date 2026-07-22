"use client"

import { useState } from "react"
import { useAuth } from "../../lib/auth"
import { apiPut } from "../../lib/api"

export default function CandidateProfilePage() {
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
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>Profil Saya</h1>
        <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
          Lengkapi profil Anda untuk meningkatkan kecocokan
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-body p-4">
          {/* Avatar Preview */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="lx-avatar lx-avatar-lg">
              {photo ? <img src={photo} alt={fullname} /> : (fullname || "?")[0]?.toUpperCase()}
            </div>
            <div>
              <h5 style={{ fontWeight: 700, marginBottom: "0.15rem" }}>{fullname || "Kandidat"}</h5>
              <p className="text-secondary mb-0" style={{ fontSize: "0.85rem" }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label">Upload Photo (URL)</label>
              <input
                className="form-control form-control"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
              <small className="text-secondary">Masukkan URL gambar profil Anda</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Nama Lengkap</label>
              <input
                className="form-control form-control"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Profil</label>
              <textarea
                className="form-control form-control"
                rows={6}
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="Ceritakan tentang diri Anda, pengalaman, keahlian, pendidikan..."
              />
              <small className="text-secondary">Profil ini akan digunakan untuk mencocokkan dengan lowongan</small>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={saving}>
              {saving ? "Menyimpan..." : <><i className="bi bi-floppy me-2"></i> Simpan</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
