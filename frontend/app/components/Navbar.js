"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../lib/auth"

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = getNavItems(user?.role)

  return (
    <nav className="lx-navbar navbar navbar-expand-lg">
      <div className="container-fluid px-4">
        <Link href="/" className="navbar-brand">
          Loxine
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navItems.map((item) => (
              <li className="nav-item" key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${pathname === item.href || pathname.startsWith(item.href + "/") ? "active" : ""}`}
                >
                  <span className="me-2">{item.icon}</span> {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <span className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500, marginRight: "1rem" }}>
                  {user.fullname}
                </span>
                <button className="btn-outline-primary btn btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-sm btn-outline-primary">Login</Link>
                <Link href="/register" className="btn btn-sm btn-primary">Daftar</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function getNavItems(role) {
  if (role === "super_admin") {
    return [
      { href: "/admin/companies", label: "Perusahaan", icon: <i className="bi bi-building"></i> },
      { href: "/admin/candidates", label: "Kandidat", icon: <i className="bi bi-people"></i> },
      { href: "/admin/vacancies", label: "Lowongan", icon: <i className="bi bi-card-list"></i> },
      { href: "/admin/calculations", label: "Kalkulasi", icon: <i className="bi bi-bar-chart-line"></i> },
    ]
  }
  if (role === "admin_company") {
    return [
      { href: "/company/profile", label: "Profil", icon: <i className="bi bi-building"></i> },
      { href: "/company/vacancies", label: "Lowongan", icon: <i className="bi bi-card-list"></i> },
    ]
  }
  if (role === "candidate") {
    return [
      { href: "/candidate/profile", label: "Profil", icon: <i className="bi bi-person"></i> },
      { href: "/candidate/vacancies", label: "Lowongan", icon: <i className="bi bi-briefcase"></i> },
    ]
  }
  return []
}

function formatRole(role) {
  const map = {
    super_admin: "Super Admin",
    admin_company: "Admin Company",
    candidate: "Kandidat",
  }
  return map[role] || role
}
