"use client"

import { useState, useEffect } from "react"
import { apiGet } from "../../lib/api"

export default function AdminVacanciesPage() {
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
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>Lowongan</h1>
        <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
          Semua lowongan dari seluruh perusahaan
        </p>
      </div>

      {loading ? (
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      ) : vacancies.length === 0 ? (
        <div className="lx-empty">
          <div className="lx-empty-icon">📋</div>
          <p>Belum ada lowongan</p>
        </div>
      ) : (
        <div className="row g-3">
          {vacancies.map((v) => (
            <div className="col-md-6" key={v.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{v.title}</h6>
                      <p className="text-secondary mb-1" style={{ fontSize: "0.85rem" }}>
                        🏢 {v.company_name || `Company #${v.company}`} &nbsp;·&nbsp; 📍 {v.location}
                      </p>
                    </div>
                    <span className="badge bg-primary">#{v.id}</span>
                  </div>
                  <p className="text-secondary mb-0 mt-2" style={{ fontSize: "0.85rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {v.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
