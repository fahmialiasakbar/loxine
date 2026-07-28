"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiGet, apiPatch, apiPost } from "../../lib/api"

export default function CandidateVacanciesPage() {
  const [vacancies, setVacancies] = useState([])
  const [offeredCalculations, setOfferedCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("recommended")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vacData, calcsData] = await Promise.all([
          apiGet("/vacancies/"),
          apiGet("/calculations/"),
        ])

        // Map matching percentage to vacancies and sort descending
        const vacanciesWithPercentage = vacData.map((v) => {
          const calc = calcsData.find((c) => c.vacancy === v.id)
          return {
            ...v,
            percentage: calc ? parseFloat(calc.percentage) : 0,
            application_status: calc ? calc.application_status : "none",
            is_offered: calc ? calc.is_offered : false,
            calc_id: calc ? calc.id : null,
          }
        })
        vacanciesWithPercentage.sort((a, b) => b.percentage - a.percentage)
        setVacancies(vacanciesWithPercentage)

        // Filter calculations where is_offered === true
        const offered = calcsData.filter((c) => c.is_offered)
        setOfferedCalculations(offered)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleApplyDirect = async (vacancyId) => {
    try {
      const data = await apiPost(`/vacancies/${vacancyId}/apply/`, {})
      
      // Update vacancies list state
      setVacancies((prev) =>
        prev.map((v) =>
          v.id === vacancyId
            ? {
                ...v,
                application_status: data.application_status,
                calc_id: data.id,
              }
            : v
        )
      )
      alert("Berhasil melamar lowongan!")
    } catch (err) {
      console.error(err)
      alert("Gagal melamar lowongan: " + err.message)
    }
  }

  const handleRespondOffer = async (calcId, newStatus) => {
    try {
      const updated = await apiPatch(`/calculations/${calcId}/`, {
        application_status: newStatus,
      })
      setOfferedCalculations((prev) =>
        prev.map((c) => (c.id === calcId ? updated : c))
      )
    } catch (err) {
      console.error(err)
      alert("Gagal merespon tawaran: " + err.message)
    }
  }

  return (
    <div className="lx-animate">
      <div className="mb-4">
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>
          Lowongan Kerja
        </h1>
        <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
          Temukan lowongan yang sesuai dengan profil Anda atau respon tawaran masuk.
        </p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3">
        <li className="nav-item">
          <button
            className={`nav-link px-4 py-2 d-flex align-items-center gap-2 ${activeTab === "recommended" ? "active" : ""}`}
            onClick={() => setActiveTab("recommended")}
            style={{ 
              fontWeight: 600, 
              borderRadius: "8px",
              background: activeTab === "recommended" ? "var(--primary)" : "transparent",
              color: activeTab === "recommended" ? "#fff" : "var(--text-secondary)",
              border: activeTab === "recommended" ? "none" : "1px solid var(--border)"
            }}
          >
            <i className="bi bi-briefcase"></i> Rekomendasi Lowongan
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link px-4 py-2 d-flex align-items-center gap-2 position-relative ${activeTab === "offered" ? "active" : ""}`}
            onClick={() => setActiveTab("offered")}
            style={{ 
              fontWeight: 600, 
              borderRadius: "8px",
              background: activeTab === "offered" ? "var(--primary)" : "transparent",
              color: activeTab === "offered" ? "#fff" : "var(--text-secondary)",
              border: activeTab === "offered" ? "none" : "1px solid var(--border)"
            }}
          >
            <i className="bi bi-gift"></i> Ditawarkan
            {offeredCalculations.filter(c => c.application_status === "none").length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem" }}>
                {offeredCalculations.filter(c => c.application_status === "none").length}
              </span>
            )}
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      ) : activeTab === "recommended" ? (
        vacancies.length === 0 ? (
          <div className="lx-empty">
            <div className="lx-empty-icon"><i className="bi bi-briefcase"></i></div>
            <p>Belum ada lowongan tersedia</p>
          </div>
        ) : (
          <div className="row g-3">
            {vacancies.map((v) => (
              <div className="col-md-6 col-lg-4" key={v.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-start gap-3">
                      <div className="lx-avatar">
                        {v.company_image ? (
                          <img src={v.company_image} alt={v.company_name} />
                        ) : (
                          <span>{(v.company_name || "C")[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                          {v.title}
                        </h6>
                        <p className="text-secondary mb-1" style={{ fontSize: "0.82rem" }}>
                          <i className="bi bi-building me-1"></i> {v.company_name || `Company #${v.company}`}
                        </p>
                        <p className="text-secondary mb-2" style={{ fontSize: "0.82rem" }}>
                          <i className="bi bi-geo-alt me-1"></i> {v.location}
                        </p>
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <span className="badge bg-primary text-white" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                            Kecocokan: {Math.round(v.percentage)}%
                          </span>
                          {v.application_status !== "none" && !v.is_offered && (
                            <span className={`badge ${
                              v.application_status === "pending" ? "bg-info text-white" :
                              v.application_status === "accepted" ? "bg-success text-white" :
                              "bg-secondary text-white"
                            }`} style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                              {v.application_status === "pending" ? "Telah Melamar" : 
                               v.application_status === "accepted" ? "Diterima" : "Ditolak"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto pt-2 text-end d-flex gap-2 justify-content-end align-items-center">
                      {v.application_status === "none" ? (
                        <button
                          onClick={() => handleApplyDirect(v.id)}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Lamar
                        </button>
                      ) : (
                        v.application_status === "pending" && (
                          <span className="text-secondary small" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                            <i className="bi bi-check-circle-fill text-success me-1"></i> Telah Melamar
                          </span>
                        )
                      )}
                      <Link href={`/candidate/vacancies/${v.id}`} className="btn btn-primary btn-sm">
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        offeredCalculations.length === 0 ? (
          <div className="lx-empty">
            <div className="lx-empty-icon"><i className="bi bi-gift"></i></div>
            <p>Belum ada tawaran masuk</p>
          </div>
        ) : (
          <div className="row g-3">
            {offeredCalculations.map((calc) => (
              <div className="col-md-6 col-lg-4" key={calc.id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-start gap-3">
                      <div className="lx-avatar">
                        {calc.company_image ? (
                          <img src={calc.company_image} alt={calc.company_name} />
                        ) : (
                          <span>{(calc.company_name || "C")[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                          {calc.vacancy_title}
                        </h6>
                        <p className="text-secondary mb-1" style={{ fontSize: "0.82rem" }}>
                          <i className="bi bi-building me-1"></i> {calc.company_name}
                        </p>
                        <p className="text-secondary mb-2" style={{ fontSize: "0.82rem" }}>
                          <i className="bi bi-geo-alt me-1"></i> {calc.vacancy_location}
                        </p>
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          {calc.application_status === "none" && (
                            <span className="badge bg-warning text-dark" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                              Tawaran Baru
                            </span>
                          )}
                          {calc.application_status === "pending" && (
                            <span className="badge bg-info text-white" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                              Menunggu Konfirmasi
                            </span>
                          )}
                          {calc.application_status === "accepted" && (
                            <span className="badge bg-success" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                              Diterima
                            </span>
                          )}
                          {calc.application_status === "rejected" && (
                            <span className="badge bg-secondary" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                              Ditolak
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex gap-2 justify-content-end align-items-center">
                      {calc.application_status === "none" && (
                        <>
                          <button
                            className="btn btn-success btn-sm px-3"
                            onClick={() => handleRespondOffer(calc.id, "pending")}
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                          >
                            Terima
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm px-3"
                            onClick={() => handleRespondOffer(calc.id, "rejected")}
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      <Link href={`/candidate/vacancies/${calc.vacancy}`} className="btn btn-outline-primary btn-sm" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
