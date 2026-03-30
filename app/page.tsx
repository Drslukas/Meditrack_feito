"use client"

import { useAuth } from "@/lib/auth-context"
import { LandingPage } from "@/components/landing-page"
import { PatientDashboard } from "@/components/patient/patient-dashboard"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function Home() {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <LandingPage />
  }

  if (role === "patient") {
    return <PatientDashboard />
  }

  if (role === "doctor") {
    return <DoctorDashboard />
  }

  return <LandingPage />
}
