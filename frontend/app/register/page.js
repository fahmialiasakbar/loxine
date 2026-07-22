"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../lib/auth"
import { apiPost } from "../lib/api"

export default function RegisterPage() {
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const data = await apiPost("/auth/register/", {
        fullname,
        email,
        password,
        profile: "",
      })
      login(data.access, data.user)
      router.push("/candidate/profile")
    } catch (err) {
      setError(err.message || "Pendaftaran gagal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lx-auth-wrapper">
      <div className="lx-auth-card lx-animate">
        <div className="lx-brand">
          <span>Loxine</span>
          <p className="text-secondary mt-1" style={{ fontSize: "0.9rem" }}>
            Daftar sebagai kandidat
          </p>
        </div>

        {error && (
          <div className="alert alert-danger mb-3">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className="form-control form-control"
              placeholder="Masukkan nama lengkap"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              id="register-fullname"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control form-control"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="register-email"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control form-control"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              id="register-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            id="register-submit"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" />
                Memproses...
              </span>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
          <span className="text-secondary">Sudah punya akun? </span>
          <Link href="/login" className="text-decoration-none" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
