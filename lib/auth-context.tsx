"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

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

  const loginAsPatient = useCallback(async (cpf: string, birthDate: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, birth_date: birthDate }),
      })

      if (!res.ok) return false

      const data = await res.json()
      setState({
        isAuthenticated: true,
        role: data.role,
        user: { user_id: data.user_id, name: data.name, role: data.role },
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
      console.log("Tentando login com:", { email, password }) // 👈 log do request

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("Status da resposta:", res.status) // 👈 ver se é 200

      const data = await res.json()
      console.log("Dados retornados:", data) // 👈 ver o corpo da resposta

      if (!res.ok) return false

      setState({
        isAuthenticated: true,
        role: data.role,
        user: { user_id: data.user_id, name: data.name, role: data.role },
        token: data.access_token,
      })

      return true
    } catch (err) {
      console.error("Erro ao logar médico:", err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, role: null, user: null, token: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, loginAsPatient, loginAsDoctor, logout }}
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