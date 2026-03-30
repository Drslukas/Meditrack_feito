"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { patients, doctors, type Patient, type Doctor } from "./mock-data"

type UserRole = "patient" | "doctor"

interface AuthState {
  isAuthenticated: boolean
  role: UserRole | null
  user: Patient | Doctor | null
}

interface AuthContextType extends AuthState {
  loginAsPatient: (email: string, password: string) => boolean
  loginAsDoctor: (email: string) => boolean
  logout: () => void
  addPatient: (doctorId: string, name: string, email: string, phone: string, age: number, cpf: string, password: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
  })

  const loginAsPatient = useCallback((email: string, password: string) => {
    const patient = patients.find(
      (p) => p.email.toLowerCase() === email.toLowerCase() && p.password === password
    )
    if (patient) {
      setState({ isAuthenticated: true, role: "patient", user: patient })
      return true
    }
    return false
  }, [])

  const loginAsDoctor = useCallback((email: string) => {
    const doctor = doctors.find(
      (d) => d.email.toLowerCase() === email.toLowerCase()
    )
    if (doctor) {
      setState({ isAuthenticated: true, role: "doctor", user: doctor })
      return true
    }
    setState({ isAuthenticated: true, role: "doctor", user: doctors[0] })
    return true
  }, [])

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, role: null, user: null })
  }, [])

  const addPatient = useCallback(
    (doctorId: string, name: string, email: string, phone: string, age: number, cpf: string, password: string) => {
      // Verificar se CPF já existe
      const existingPatient = patients.find(p => p.cpf === cpf)
      if (existingPatient) {
        return false // CPF já cadastrado
      }

      const newPatient: Patient = {
        id: `p-${patients.length + 1}`,
        name,
        email,
        phone,
        age,
        cpf,
        password,
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
