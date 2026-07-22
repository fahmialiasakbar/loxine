"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiGet, apiPost } from "../../lib/api"

export default function CompanyVacanciesPage() {
  const [vacancies, setVacancies] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [companyId, setCompanyId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [vacsData, compsData] = await Promise.all([
        apiGet("/vacancies/"),
        apiGet("/companies/"),
      ])
      setVacancies(vacsData)
      setCompanies(compsData)
      if (compsData.length > 0 && !companyId) {
        setCompanyId(String(compsData[0].id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: "", text: "" })
    try {
      await apiPost("/vacancies/", {
        company: Number(companyId),
        title,
        description,
        location,
      })
      setMessage({ type: "success", text: "Lowongan berhasil dibuat" })
      setTitle("")
      setDescription("")
      setLocation("")
      setShowForm(false)
      fetchData()
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
          <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>Lowongan</h1>
          <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
            Kelola lowongan perusahaan Anda
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "+ Tambah Lowongan"}
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      {showForm && (
        <div className="card mb-4 lx-animate">
          <div className="card-body p-4">
            <h5 style={{ fontWeight: 700 }} className="mb-3">Tambah Lowongan Baru</h5>
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Judul Lowongan</label>
                  <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Contoh: Software Engineer, News Anchor..." />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Lokasi</label>
                  <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Contoh: Jakarta Selatan, WFO/Remote..." />
                </div>
                <div className="col-12">
                  <label className="form-label">Deskripsi</label>
                  <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Tuliskan deskripsi pekerjaan, kualifikasi, dan benefit yang ditawarkan..." />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Lowongan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      ) : vacancies.length === 0 ? (
        <div className="lx-empty">
          <div className="lx-empty-icon">📋</div>
          <p>Belum ada lowongan. Klik tombol di atas untuk menambah.</p>
        </div>
      ) : (
        <div className="row g-3">
          {vacancies.map((v) => (
            <div className="col-md-6" key={v.id}>
              <Link href={`/company/vacancies/${v.id}`} className="text-decoration-none">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 style={{ fontWeight: 700, color: "var(--text)", marginBottom: 0 }}>{v.title}</h6>
                      <span className="badge bg-primary">Detail →</span>
                    </div>
                    <p className="text-secondary mb-2" style={{ fontSize: "0.85rem" }}>
                      🏢 {v.company_name || `Company #${v.company}`} &nbsp;·&nbsp; 📍 {v.location}
                    </p>
                    <p className="text-secondary mb-0" style={{ fontSize: "0.85rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {v.description}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
