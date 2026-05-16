"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

type UserRole = "patient" | "doctor"

interface User {
  user_id: number
  name: string
  role: UserRole
}

interface AuthState {
  isAuthenticated: boolean
  role: UserRole | null
  user: User | null
  token: string | null
}

interface AuthContextType extends AuthState {
  loading: boolean
  loginAsPatient: (cpf: string, birthDate: string) => Promise<boolean>
  loginAsDoctor: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
    token: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")

      if (!token || !user) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setLoading(false)
          return
        }

        const parsedUser = JSON.parse(user)
        setState({
          isAuthenticated: true,
          role: parsedUser.role,
          user: parsedUser,
          token,
        })
        
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  // ✅ COLE ISSO NO LUGAR
  const login = useCallback(async (endpoint: string, body: object) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) return false

      const data = await res.json()
      const user = { user_id: data.user_id, name: data.name, role: data.role }

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(user))

      setState({ isAuthenticated: true, role: data.role, user, token: data.access_token })
      return true
    } catch {
      return false
    }
  }, [])

  const loginAsPatient = useCallback((cpf: string, birthDate: string) =>
    login("/auth/login/patient", { cpf, birth_date: birthDate }), [login])

  const loginAsDoctor = useCallback((email: string, password: string) =>
    login("/auth/login/doctor", { email, password }), [login])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setState({ isAuthenticated: false, role: null, user: null, token: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, loading, loginAsPatient, loginAsDoctor, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}