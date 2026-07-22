"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "../lib/auth"
import { apiPost } from "../lib/api"

export default function LoginPage() {
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
      const data = await apiPost("/auth/login/", { email, password })
      login(data.access, data.user)

      switch (data.user.role) {
        case "super_admin":
          router.push("/admin/companies")
          break
        case "admin_company":
          router.push("/company/vacancies")
          break
        case "candidate":
          router.push("/candidate/vacancies")
          break
        default:
          router.push("/")
      }
    } catch (err) {
      setError(err.message || "Login gagal")
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
            Masuk ke akun Anda
          </p>
        </div>

        {error && (
          <div className="alert alert-danger mb-3">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control form-control"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control form-control"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" />
                Memproses...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <p className="text-center mt-4 mb-0" style={{ fontSize: "0.9rem" }}>
          <span className="text-secondary">Belum punya akun? </span>
          <Link href="/register" className="text-decoration-none" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Daftar sebagai kandidat
          </Link>
        </p>
      </div>
    </div>
  )
}
