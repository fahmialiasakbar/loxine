const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api"

export async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lx_token") : null

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lx_token")
      localStorage.removeItem("lx_user")
      window.location.href = "/login"
    }
    throw new Error("Unauthorized")
  }

  return response
}

export async function apiGet(path) {
  const response = await apiFetch(path)
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.detail || "Request failed")
  }
  return response.json()
}

export async function apiPost(path, body) {
  const response = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data) || "Request failed")
  }
  return data
}

export async function apiPut(path, body) {
  const response = await apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || "Request failed")
  }
  return data
}

export async function apiPatch(path, body) {
  const response = await apiFetch(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || "Request failed")
  }
  return data
}
