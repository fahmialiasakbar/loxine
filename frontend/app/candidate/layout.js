"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../lib/auth"
import Navbar from "../components/Navbar"

export default function CandidateLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "candidate")) {
      router.replace("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="lx-auth-wrapper">
        <div className="lx-loader"><div className="lx-spinner"></div></div>
      </div>
    )
  }

  if (!user || user.role !== "candidate") return null

  return (
    <>
      <Navbar />
      <div className="container-fluid px-4 py-3" style={{ maxWidth: 1200 }}>
        {children}
      </div>
    </>
  )
}
