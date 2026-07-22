"use client"

import { useState, useEffect } from "react"
import { apiGet, apiPost } from "../../lib/api"

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [submitting, setSubmitting] = useState(false)

  const fetchCompanies = async () => {
    try {
      const data = await apiGet("/companies/")
      setCompanies(data)
    } catch (err) {
      setMessage({ type: "danger", text: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCompanies() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: "", text: "" })
    try {
      await apiPost("/admin-company/", { fullname: `Admin ${name}`, email, password })
      await apiPost("/companies/", { name, location, image, description })
      
      setMessage({ type: "success", text: "Perusahaan dan Admin berhasil ditambahkan" })
      setName("")
      setLocation("")
      setImage("")
      setDescription("")
      setEmail("")
      setPassword("")
      setShowForm(false)
      fetchCompanies()
    } catch (err) {
      setMessage({ type: "danger", text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="lx-animate">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>Perusahaan</h1>
          <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
            Kelola daftar perusahaan
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "+ Tambah Perusahaan"}
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      {showForm && (
        <div className="card mb-4 lx-animate">
          <div className="card-body p-4">
            <h5 style={{ fontWeight: 700 }} className="mb-3">Tambah Perusahaan Baru</h5>
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nama Perusahaan</label>
                  <input className="form-control form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="PT. Contoh" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Lokasi</label>
                  <input className="form-control form-control" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Jakarta" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Admin</label>
                  <input type="email" className="form-control form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@perusahaan.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password Admin</label>
                  <input type="password" className="form-control form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password admin (min 8 karakter)" minLength={8} />
                </div>
                <div className="col-12">
                  <label className="form-label">URL Logo / Gambar</label>
                  <input className="form-control form-control" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
                </div>
                <div className="col-12">
                  <label className="form-label">Deskripsi</label>
                  <textarea className="form-control form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Deskripsi perusahaan..." />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      ) : companies.length === 0 ? (
        <div className="lx-empty">
          <div className="lx-empty-icon">🏢</div>
          <p>Belum ada perusahaan terdaftar</p>
        </div>
      ) : (
        <div className="row g-3">
          {companies.map((c) => (
            <div className="col-md-6 col-lg-4" key={c.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3">
                    <div className="lx-avatar">
                      {c.image ? (
                        <img src={c.image} alt={c.name} />
                      ) : (
                        <span>{(c.name || "C")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h6 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{c.name || `Company #${c.id}`}</h6>
                      <p className="text-secondary mb-1" style={{ fontSize: "0.85rem" }}>📍 {c.location}</p>
                      <p className="mb-0 text-secondary" style={{ fontSize: "0.85rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {c.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
