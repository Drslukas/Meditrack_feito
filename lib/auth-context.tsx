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
      } catch (err) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [])

  const loginAsPatient = useCallback(async (cpf: string, birthDate: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, birth_date: birthDate }),
      })

      if (!res.ok) return false

      const data = await res.json()
      const user = { user_id: data.user_id, name: data.name, role: data.role }

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(user))

      setState({
        isAuthenticated: true,
        role: data.role,
        user,
        token: data.access_token,
      })

      return true
    } catch (err) {
      console.error("Login paciente falhou:", err)
      return false
    }
  }, [])

  const loginAsDoctor = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) return false

      const data = await res.json()
      const user = { user_id: data.user_id, name: data.name, role: data.role }

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(user))

      setState({
        isAuthenticated: true,
        role: data.role,
        user,
        token: data.access_token,
      })

      return true
    } catch (err) {
      console.error("Erro ao logar médico:", err)
      return false
    }
  }, [])

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