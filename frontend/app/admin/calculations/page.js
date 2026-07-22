"use client"

import { useState, useEffect } from "react"
import { apiGet } from "../../lib/api"

export default function AdminCalculationsPage() {
  const [matrix, setMatrix] = useState({})
  const [vacancies, setVacancies] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const data = await apiGet("/calculations/")
        
        // Pivot data
        const mat = {}
        const vacSet = new Set()
        const candSet = new Set()
        
        data.forEach(c => {
            if (!mat[c.vacancy_title]) {
                mat[c.vacancy_title] = {}
            }
            mat[c.vacancy_title][c.user_fullname] = c.percentage
            vacSet.add(c.vacancy_title)
            candSet.add(c.user_fullname)
        })
        
        setMatrix(mat)
        setVacancies(Array.from(vacSet).sort())
        setCandidates(Array.from(candSet).sort())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCalculations()
  }, [])

  return (
    <div className="lx-animate">
      <div className="mb-4">
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>Matriks Hasil Kemiripan</h1>
        <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
          Tabel pivot persentase kecocokan pelamar terhadap seluruh lowongan.
        </p>
      </div>

      {loading ? (
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      ) : vacancies.length === 0 ? (
        <div className="lx-empty">
          <div className="lx-empty-icon"><i className="bi bi-bar-chart-line"></i></div>
          <p>Belum ada data kalkulasi</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table table-hover table-bordered mb-0" style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ textAlign: "left" }}>Lowongan \ Pelamar</th>
                    {candidates.map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {vacancies.map(v => (
                    <tr key={v}>
                      <td style={{ fontWeight: 600, textAlign: "left" }}>{v}</td>
                      {candidates.map(c => {
                          const val = matrix[v][c] !== undefined ? parseFloat(matrix[v][c]).toFixed(2) : "0.00"
                          // Highlighting best matches optionally
                          const isHigh = parseFloat(val) > 50
                          return (
                              <td key={c}>
                                  <span className={`lx-percentage ${isHigh ? 'text-success fw-bold' : ''}`}>
                                    {val}%
                                  </span>
                              </td>
                          )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
