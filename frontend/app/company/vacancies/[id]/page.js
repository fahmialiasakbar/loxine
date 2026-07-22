"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { apiGet } from "../../../lib/api"

export default function CompanyVacancyDetailPage() {
  const params = useParams()
  const vacancyId = params.id
  const [vacancy, setVacancy] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiGet(`/vacancies/${vacancyId}/applicants/`)
        setVacancy(data.vacancy)
        setApplicants(data.applicants || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [vacancyId])

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

  // Split into recommended (not applied, top 3) and regular applicants (applied)
  const recommended = applicants.filter((a) => a.application_status === "none").slice(0, 3)
  const regularApplicants = applicants.filter((a) => a.application_status !== "none")

  return (
    <div className="lx-animate">
      <Link href="/company/vacancies" className="btn btn-outline-primary btn-sm mb-3">
        <i className="bi bi-arrow-left me-1"></i> Kembali
      </Link>

      <div className="card mb-4">
        <div className="card-body p-4">
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.5px" }}>{vacancy.title}</h1>
          <p className="text-secondary mb-2" style={{ fontSize: "0.9rem" }}>
            <i className="bi bi-building me-1"></i> {vacancy.company_name || `Company #${vacancy.company}`} &nbsp;·&nbsp; <i className="bi bi-geo-alt me-1"></i> {vacancy.location}
          </p>
          <p className="mb-0" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            {vacancy.description}
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <h5 style={{ fontWeight: 700, marginBottom: "1rem" }}>
            <i className="bi bi-star-fill text-warning me-2"></i> Talenta Direkomendasikan
            <span className="badge bg-success ms-2">{recommended.length}</span>
          </h5>
          {recommended.length === 0 ? (
            <div className="card">
              <div className="card-body text-center text-secondary py-4">
                Belum ada talenta direkomendasikan
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {recommended.map((calc) => (
                <ApplicantCard key={calc.id} calc={calc} vacancyId={vacancyId} />
              ))}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <h5 style={{ fontWeight: 700, marginBottom: "1rem" }}>
            <i className="bi bi-people me-2"></i> Pelamar
            <span className="badge bg-primary ms-2">{regularApplicants.length}</span>
          </h5>
          {regularApplicants.length === 0 ? (
            <div className="card">
              <div className="card-body text-center text-secondary py-4">
                Belum ada pelamar
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {regularApplicants.map((calc) => (
                <ApplicantCard key={calc.id} calc={calc} vacancyId={vacancyId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ApplicantCard({ calc, vacancyId }) {
  const statusBadge = {
    accepted: { cls: "badge bg-success", label: "Lanjut Proses" },
    rejected: { cls: "badge bg-danger", label: "Ditolak" },
  }

  const badge = statusBadge[calc.application_status]

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3">
          <div className="lx-avatar">
            {calc.user_photo ? (
              <img src={calc.user_photo} alt={calc.user_fullname} />
            ) : (
              <span>{(calc.user_fullname || "?")[0].toUpperCase()}</span>
            )}
          </div>
          <div className="flex-grow-1 min-w-0">
            <h6 style={{ fontWeight: 600, marginBottom: "0.15rem", fontSize: "0.95rem" }}>
              {calc.user_fullname}
            </h6>
            {badge && (
              <div className="mb-1">
                <span className={`badge bg-secondary ${badge.cls}`}>{badge.label}</span>
              </div>
            )}
            <div>
              <Link
                href={`/company/vacancies/${vacancyId}/compare/${calc.id}`}
                className="text-decoration-none"
                style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--primary)" }}
              >
                Lihat Detail →
              </Link>
            </div>
          </div>
          <div className="text-end">
            <span className="lx-percentage">{calc.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
