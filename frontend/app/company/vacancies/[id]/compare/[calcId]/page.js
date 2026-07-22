"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiGet, apiPatch } from "../../../../../lib/api"


export default function ComparePage() {
  const params = useParams()
  const router = useRouter()
  const { id: vacancyId, calcId } = params
  const [calc, setCalc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchCalc = async () => {
      try {
        const data = await apiGet(`/calculations/${calcId}/`)
        setCalc(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCalc()
  }, [calcId])

  const handleAction = async (action) => {
    setActionLoading(action)
    setMessage({ type: "", text: "" })
    try {
      let body = {}
      if (action === "offer") {
        body = { is_offered: true }
      } else if (action === "accept") {
        body = { application_status: "accepted" }
      } else if (action === "reject") {
        body = { application_status: "rejected" }
      }

      const data = await apiPatch(`/calculations/${calcId}/`, body)
      setCalc(data)

      const messages = {
        offer: "Tawaran berhasil dikirim",
        accept: "Kandidat berhasil dilanjutkan ke tahap berikutnya",
        reject: "Kandidat berhasil ditolak",
      }
      setMessage({ type: "success", text: messages[action] })

      // Auto-trigger mailto removed due to Thunderbird crash on user's OS
      // Email link will be provided manually via a button below instead.
    } catch (err) {
      setMessage({ type: "danger", text: err.message })
    } finally {
      setActionLoading("")
    }
  }

  if (loading) {
    return <div className="lx-loader" style={{ padding: "4rem" }}><div className="lx-spinner"></div></div>
  }

  if (!calc) {
    return (
      <div className="lx-empty">
        <div className="lx-empty-icon">❌</div>
        <p>Data tidak ditemukan</p>
      </div>
    )
  }

  // Determine available actions
  const canOffer = !calc.is_offered && calc.application_status === "none"
  const canAccept = calc.application_status === "pending"
  const canReject = calc.application_status === "pending"

  return (
    <div className="lx-animate">
      <Link href={`/company/vacancies/${vacancyId}`} className="btn btn-outline-primary btn-sm mb-3">
        <i className="bi bi-arrow-left me-1"></i> Kembali ke Detail Lowongan
      </Link>

      {/* Header */}
      <div className="card mb-4">
        <div className="card-body p-4">
          <h1 style={{ fontWeight: 800, fontSize: "1.35rem", letterSpacing: "-0.5px" }}>
            {calc.vacancy_title}
          </h1>
          <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
            <i className="bi bi-geo-alt me-1"></i> {calc.vacancy_location}
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
      )}

      <div className="row g-4">
        {/* Left - Vacancy Description */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 style={{ fontWeight: 700, marginBottom: "1rem" }}><i className="bi bi-file-text me-2"></i> Deskripsi Lowongan</h6>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                {calc.vacancy_description}
              </p>
            </div>
          </div>
        </div>

        {/* Right - Candidate Profile */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 style={{ fontWeight: 700, marginBottom: "1rem" }}>
                <i className="bi bi-person me-2"></i> Profil {calc.user_fullname}
              </h6>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="lx-avatar lx-avatar-lg">
                  {calc.user_photo ? (
                    <img src={calc.user_photo} alt={calc.user_fullname} />
                  ) : (
                    <span>{(calc.user_fullname || "?")[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h6 style={{ fontWeight: 700, marginBottom: "0.15rem" }}>{calc.user_fullname}</h6>
                  <p className="text-secondary mb-0" style={{ fontSize: "0.85rem" }}>{calc.user_email}</p>
                </div>
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                {calc.user_profile || "Belum ada profil"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Match percentage and actions */}
      <div className="card mt-4">
        <div className="card-body p-4 text-center">
          <p className="text-secondary mb-1" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
            Tingkat Kecocokan
          </p>
          <div className="lx-percentage-lg mb-3">{calc.percentage}%</div>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {canOffer && (
              <button
                className="btn btn-primary"
                onClick={() => handleAction("offer")}
                disabled={!!actionLoading}
              >
                {actionLoading === "offer" ? "Memproses..." : <><i className="bi bi-handshake me-1"></i> Tawarkan</>}
              </button>
            )}

            {calc.is_offered && calc.application_status === "none" && (
              <span className="badge bg-success" style={{ fontSize: "0.85rem", padding: "0.5em 1em" }}>
                <i className="bi bi-check-circle me-1"></i> Telah Ditawarkan
              </span>
            )}

            {canAccept && (
              <button
                className="btn btn-success"
                onClick={() => handleAction("accept")}
                disabled={!!actionLoading}
              >
                {actionLoading === "accept" ? "Memproses..." : <><i className="bi bi-check-circle me-1"></i> Lanjut Proses</>}
              </button>
            )}

            {canReject && (
              <button
                className="btn btn-danger"
                onClick={() => handleAction("reject")}
                disabled={!!actionLoading}
              >
                {actionLoading === "reject" ? "Memproses..." : <><i className="bi bi-x-circle me-1"></i> Tolak</>}
              </button>
            )}

            {calc.application_status === "accepted" && (
              <a
                href={`mailto:${calc.user_email}?subject=Proses Lanjutan: ${calc.vacancy_title}&body=Halo ${calc.user_fullname},%0A%0AKami ingin menginformasikan bahwa Anda terpilih untuk melanjutkan proses rekrutmen ke tahap selanjutnya untuk posisi ${calc.vacancy_title}.%0A%0ASalam,%0ATim HR`}
                className="btn btn-primary"
              >
                <i className="bi bi-envelope me-1"></i> Kirim Email Lanjutan
              </a>
            )}

            {calc.application_status === "accepted" && (
              <span className="badge bg-success" style={{ fontSize: "0.85rem", padding: "0.5em 1em" }}>
                <i className="bi bi-check-circle me-1"></i> Lanjut Proses
              </span>
            )}

            {calc.application_status === "rejected" && (
              <span className="badge bg-danger" style={{ fontSize: "0.85rem", padding: "0.5em 1em" }}>
                <i className="bi bi-x-circle me-1"></i> Ditolak
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
