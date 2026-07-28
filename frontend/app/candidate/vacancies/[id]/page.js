"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { apiGet, apiPost } from "../../../lib/api"

export default function CandidateVacancyDetailPage() {
  const params = useParams()
  const vacancyId = params.id
  const [vacancy, setVacancy] = useState(null)
  const [calc, setCalc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [actionLoading, setActionLoading] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vacData, calcsData] = await Promise.all([
          apiGet(`/vacancies/${vacancyId}/`),
          apiGet("/calculations/"),
        ])
        setVacancy(vacData)

        // Check calculation
        const myCalc = calcsData.find((c) => c.vacancy === Number(vacancyId))
        if (myCalc) {
          setCalc(myCalc)
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
      const data = await apiPost(`/vacancies/${vacancyId}/apply/`, {})
      setCalc(data)
      setMessage({ type: "success", text: "Berhasil melamar! Status Anda: Telah Melamar." })
    } catch (err) {
      setMessage({ type: "danger", text: err.message })
    } finally {
      setApplying(false)
    }
  }

  const handleRespondOffer = async (newStatus) => {
    setActionLoading(newStatus)
    setMessage({ type: "", text: "" })
    try {
      const data = await apiPatch(`/calculations/${calc.id}/`, {
        application_status: newStatus,
      })
      setCalc(data)
      setMessage({
        type: newStatus === "pending" ? "success" : "warning",
        text: newStatus === "pending" 
          ? "Berhasil menerima tawaran! Perusahaan akan segera menghubungi Anda." 
          : "Tawaran telah ditolak.",
      })
    } catch (err) {
      setMessage({ type: "danger", text: err.message })
    } finally {
      setActionLoading("")
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

          {/* Apply button and Offer Actions */}
          <div className="text-center">
            {calc && calc.is_offered ? (
              // Case: Offered by company
              calc.application_status === "none" ? (
                <div className="card border-primary p-3 mb-0" style={{ background: "rgba(37, 99, 235, 0.03)" }}>
                  <h6 style={{ fontWeight: 700, color: "var(--primary)" }} className="mb-2">
                    <i className="bi bi-gift me-2"></i> Anda Mendapat Tawaran!
                  </h6>
                  <p className="text-secondary small mb-3">
                    Perusahaan ini tertarik dengan profil Anda dan menawarkan posisi ini. Apakah Anda ingin menerima tawaran ini?
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-success btn-sm px-4"
                      onClick={() => handleRespondOffer("pending")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === "pending" ? "Memproses..." : <><i className="bi bi-check2 me-1"></i> Terima Tawaran</>}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm px-4"
                      onClick={() => handleRespondOffer("rejected")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === "rejected" ? "Memproses..." : <><i className="bi bi-x me-1"></i> Tolak</>}
                    </button>
                  </div>
                </div>
              ) : calc.application_status === "pending" ? (
                <div className="alert alert-info mb-0 text-center" style={{ fontWeight: 500 }}>
                  <i className="bi bi-clock-history me-1"></i> Anda telah menerima tawaran ini. Menunggu kabar selanjutnya dari perusahaan.
                </div>
              ) : calc.application_status === "rejected" ? (
                <div className="alert alert-secondary mb-0 text-center" style={{ fontWeight: 500 }}>
                  <i className="bi bi-x-circle me-1"></i> Anda telah menolak tawaran ini.
                </div>
              ) : calc.application_status === "accepted" ? (
                <div className="alert alert-success mb-0 text-center" style={{ fontWeight: 500 }}>
                  <i className="bi bi-check-circle-fill me-1"></i> Selamat! Anda terpilih ke tahap selanjutnya untuk tawaran ini. Silakan cek email Anda.
                </div>
              ) : null
            ) : (
              // Case: Normal job application (candidate applying on their own)
              (!calc || calc.application_status === "none") ? (
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
              ) : calc.application_status === "pending" ? (
                <button className="btn btn-outline-success w-100" disabled>
                  <i className="bi bi-check2-all me-1"></i> Telah Melamar
                </button>
              ) : calc.application_status === "rejected" ? (
                <div className="alert alert-danger mb-0 text-center" style={{ fontWeight: 500 }}>
                  <i className="bi bi-x-circle me-1"></i> Mohon maaf, lamaran Anda belum dapat dilanjutkan untuk saat ini.
                </div>
              ) : calc.application_status === "accepted" ? (
                <div className="alert alert-success mb-0 text-center" style={{ fontWeight: 500 }}>
                  <i className="bi bi-check-circle me-1"></i> Selamat! Anda terpilih ke tahap selanjutnya. Silakan cek email Anda.
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
