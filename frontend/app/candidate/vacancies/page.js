"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { apiGet } from "../../lib/api"

export default function CandidateVacanciesPage() {
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const data = await apiGet("/vacancies/")
        setVacancies(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchVacancies()
  }, [])

  return (
    <div className="lx-animate">
      <div className="mb-4">
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>
          Lowongan Direkomendasikan
        </h1>
        <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
          Temukan lowongan yang sesuai dengan profil Anda
        </p>
      </div>

      {loading ? (
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      ) : vacancies.length === 0 ? (
        <div className="lx-empty">
          <div className="lx-empty-icon"><i className="bi bi-briefcase"></i></div>
          <p>Belum ada lowongan tersedia</p>
        </div>
      ) : (
        <div className="row g-3">
          {vacancies.map((v) => (
            <div className="col-md-6 col-lg-4" key={v.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
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
                    </div>
                  </div>
                  <div className="mt-2 text-end">
                    <Link href={`/candidate/vacancies/${v.id}`} className="btn btn-primary btn-sm">
                      Lihat Detail
                    </Link>
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
