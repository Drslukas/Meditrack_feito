"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { patients, doctors, type Patient, type Doctor } from "./mock-data"

type UserRole = "patient" | "doctor"

interface AuthState {
  isAuthenticated: boolean
  role: UserRole | null
  user: Patient | Doctor | null
}

interface AuthContextType extends AuthState {
  loginAsPatient: (cpf: string, birthDate: string) => boolean
  loginAsDoctor: (email: string, password: string) => boolean
  logout: () => void
  addPatient: (
    doctorId: string,
    name: string,
    cpf: string,
    birthDate: string,
    phone?: string
  ) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
  })

  // Login paciente usando CPF + birthDate
  const loginAsPatient = useCallback((cpf: string, birthDate: string) => {
    const patient = patients.find(
      p => p.cpf === cpf && p.birthDate === birthDate
    )
    if (patient) {
      setState({ isAuthenticated: true, role: "patient", user: patient })
      return true
    }
    return false
  }, [])

  // Login médico usando email
  const loginAsDoctor = useCallback((email: string, password: string) => {
    const doctor = doctors.find(
      d => d.email.toLowerCase() === email.toLowerCase() && d.password === password
    )
    if (doctor) {
      setState({ isAuthenticated: true, role: "doctor", user: doctor })
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, role: null, user: null })
  }, [])

  const addPatient = useCallback(
    (doctorId: string, name: string, cpf: string, birthDate: string, phone?: string) => {
      // Verifica se CPF já existe
      const existingPatient = patients.find(p => p.cpf === cpf)
      if (existingPatient) return false

      const newPatient: Patient = {
        id: `p-${patients.length + 1}`,
        name,
        cpf,
        birthDate,
        phone,
        medications: [],
        logs: [],
      }

      patients.push(newPatient)

      const doctor = doctors.find(d => d.id === doctorId)
      if (doctor) {
        doctor.patients.push(newPatient.id)
      }

      return true
    },
    []
  )

  return (
    <AuthContext.Provider
      value={{ ...state, loginAsPatient, loginAsDoctor, logout, addPatient }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}