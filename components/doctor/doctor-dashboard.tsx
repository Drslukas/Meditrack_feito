"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { patients as allPatients, type Doctor, type Patient } from "@/lib/mock-data"
import { DoctorOverview } from "./doctor-overview"
import { DoctorPatientDetail } from "./doctor-patient-detail"
import { DoctorPatientsList } from "./doctor-patients-list"
import { DoctorAddPatient } from "./doctor-add-patient"

type View = "overview" | "patients" | "patient-detail" | "add-patient"

export function DoctorDashboard() {
  const { user, logout } = useAuth()
  const doctor = user as Doctor
  const [view, setView] = useState<View>("overview")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const doctorPatients = allPatients.filter((p) =>
    doctor.patients.includes(p.id)
  )

  function openPatient(patient: Patient) {
    setSelectedPatient(patient)
    setView("patient-detail")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <Image src="/logo.png" alt="MediTrack" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">MediTrack</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          <button
            onClick={() => { setView("overview"); setSelectedPatient(null) }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === "overview"
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Painel
          </button>
          <button
            onClick={() => { setView("patients"); setSelectedPatient(null) }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === "patients" || view === "patient-detail" || view === "add-patient"
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            Pacientes
          </button>
          <button
            onClick={() => { setView("add-patient"); setSelectedPatient(null) }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === "add-patient"
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Paciente
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-foreground text-sm font-medium">
              {doctor.name.replace("Dr. ", "").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{doctor.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{doctor.crm}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="MediTrack" width={32} height={32} className="rounded-lg" />
            <span className="font-semibold text-foreground">MediTrack</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="px-4 pb-4 flex flex-col gap-1 bg-card border-b border-border">
            <button
              onClick={() => { setView("overview"); setSelectedPatient(null); setMobileMenuOpen(false) }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <LayoutDashboard className="w-4 h-4" />
              Painel
            </button>
            <button
              onClick={() => { setView("patients"); setSelectedPatient(null); setMobileMenuOpen(false) }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Users className="w-4 h-4" />
              Pacientes
            </button>
            <button
              onClick={() => { setView("add-patient"); setSelectedPatient(null); setMobileMenuOpen(false) }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Paciente
            </button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-muted-foreground mt-2"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:overflow-y-auto pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {view === "overview" && (
            <DoctorOverview
              doctor={doctor}
              patients={doctorPatients}
              onSelectPatient={openPatient}
            />
          )}
          {view === "patients" && (
            <DoctorPatientsList
              patients={doctorPatients}
              onSelectPatient={openPatient}
            />
          )}
          {view === "patient-detail" && selectedPatient && (
            <DoctorPatientDetail
              patient={selectedPatient}
              onBack={() => { setView("overview"); setSelectedPatient(null) }}
            />
          )}
          {view === "add-patient" && (
            <DoctorAddPatient
              doctor={doctor}
              onBack={() => setView("patients")}
              onPatientAdded={() => setView("patients")}
            />
          )}
        </div>
      </main>
    </div>
  )
}
