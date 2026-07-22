"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { apiGet, apiPost } from "../../../lib/api"

export default function CandidateVacancyDetailPage() {
  const params = useParams()
  const vacancyId = params.id
  const [vacancy, setVacancy] = useState(null)
  const [applicationStatus, setApplicationStatus] = useState("none")
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vacData, calcsData] = await Promise.all([
          apiGet(`/vacancies/${vacancyId}/`),
          apiGet("/calculations/"),
        ])
        setVacancy(vacData)

        // Check application status
        const myCalc = calcsData.find((c) => c.vacancy === Number(vacancyId))
        if (myCalc) {
          setApplicationStatus(myCalc.application_status)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [vacancyId])

  const handleApply = async () => {
    setApplying(true)
    setMessage({ type: "", text: "" })
    try {
      await apiPost(`/vacancies/${vacancyId}/apply/`, {})
      setApplicationStatus("pending")
      setMessage({ type: "success", text: "Berhasil melamar! Profil Anda sedang diproses." })
    } catch (err) {
      setMessage({ type: "danger", text: err.message })
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="lx-loader" style={{ padding: "4rem" }}><div className="lx-spinner"></div></div>
  }

  if (!vacancy) {
    return (
      <div className="lx-empty">
        <div className="lx-empty-icon"><i className="bi bi-x-circle text-danger"></i></div>
        <p>Lowongan tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="lx-animate" style={{ maxWidth: 700 }}>
      <Link href="/candidate/vacancies" className="btn btn-outline-primary btn-sm mb-3">
        <i className="bi bi-arrow-left me-1"></i> Kembali
      </Link>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-body p-4">
          {/* Header */}
          <div className="d-flex align-items-start gap-3 mb-4">
            <div className="lx-avatar lx-avatar-lg">
              {vacancy.company_image ? (
                <img src={vacancy.company_image} alt={vacancy.company_name} />
              ) : (
                <span>{(vacancy.company_name || "C")[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "1.35rem", letterSpacing: "-0.5px", marginBottom: "0.25rem" }}>
                {vacancy.title} — {vacancy.company_name || `Company #${vacancy.company}`}
              </h1>
              <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
                <i className="bi bi-geo-alt me-1"></i> {vacancy.location}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h6 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Deskripsi</h6>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
              {vacancy.description}
            </p>
          </div>

          {/* Apply button */}
          <div className="text-center">
            {applicationStatus === "rejected" ? (
              <div className="alert alert-danger mb-0 text-center" style={{ fontWeight: 500 }}>
                <i className="bi bi-x-circle me-1"></i> Mohon maaf, lamaran Anda belum dapat dilanjutkan untuk saat ini.
              </div>
            ) : applicationStatus === "accepted" ? (
              <div className="alert alert-success mb-0 text-center" style={{ fontWeight: 500 }}>
                <i className="bi bi-check-circle me-1"></i> Selamat! Anda terpilih ke tahap selanjutnya. Silakan cek email Anda.
              </div>
            ) : applicationStatus === "pending" ? (
              <button className="btn btn-outline-primary w-100" disabled>
                <i className="bi bi-clock me-1"></i> Lamaran Sedang Diproses
              </button>
            ) : (
              <button
                className="btn btn-primary w-100"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" />
                    Mengirim lamaran...
                  </span>
                ) : (
                  <><i className="bi bi-send me-1"></i> Lamar Sekarang</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
