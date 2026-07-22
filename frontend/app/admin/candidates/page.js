"use client"

import { useState, useEffect } from "react"
import { apiGet } from "../../lib/api"

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await apiGet("/candidates/")
        setCandidates(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [])

  return (
    <div className="lx-animate">
      <div className="mb-4">
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.5px" }}>Kandidat</h1>
        <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
          Daftar semua kandidat terdaftar
        </p>
      </div>

      {loading ? (
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      ) : candidates.length === 0 ? (
        <div className="lx-empty">
          <div className="lx-empty-icon">👥</div>
          <p>Belum ada kandidat terdaftar</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Foto</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Profil</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>#{c.id}</td>
                      <td>
                        <div className="lx-avatar" style={{ width: 36, height: 36, borderRadius: 8, fontSize: "0.8rem" }}>
                          {c.photo ? <img src={c.photo} alt={c.fullname} /> : c.fullname[0]?.toUpperCase()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.fullname}</td>
                      <td className="text-secondary">{c.email}</td>
                      <td className="text-secondary" style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.profile || "-"}
                      </td>
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
