"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("lx_token")
    const savedUser = localStorage.getItem("lx_user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("lx_user")
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem("lx_token", tokenValue)
    localStorage.setItem("lx_user", JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("lx_token")
    localStorage.removeItem("lx_user")
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((userData) => {
    localStorage.setItem("lx_user", JSON.stringify(userData))
    setUser(userData)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
