"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./lib/auth"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    switch (user.role) {
      case "super_admin":
        router.replace("/admin/companies")
        break
      case "admin_company":
        router.replace("/company/vacancies")
        break
      case "candidate":
        router.replace("/candidate/vacancies")
        break
      default:
        router.replace("/login")
    }
  }, [user, loading, router])

  return (
    <div className="lx-auth-wrapper">
      <div className="lx-loader">
        <div className="lx-spinner"></div>
      </div>
    </div>
  )
}
