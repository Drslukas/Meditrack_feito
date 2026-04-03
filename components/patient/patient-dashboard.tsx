"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Pill,
  CalendarDays,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { PatientOverview } from "./patient-overview"
import { PatientCalendar } from "./patient-calendar"
import { PatientMedications } from "./patient-medications"
import { PatientProfile } from "./patient-profile"

type Tab = "overview" | "calendar" | "medications" | "profile"

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Painel", icon: LayoutDashboard },
  { id: "calendar", label: "Calendário", icon: CalendarDays },
  { id: "medications", label: "Medicamentos", icon: Pill },
  { id: "profile", label: "Perfil", icon: User },
]

export function PatientDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <Image src="/logo.png" alt="MediTrack" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">MediTrack</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-foreground text-sm font-medium">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50">Paciente</p>
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
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
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
      <main className="flex-1 md:overflow-y-auto pt-16 md:pt-0 md:ml-64">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {activeTab === "overview" && <PatientOverview />}
          {activeTab === "calendar" && <PatientCalendar />}
          {activeTab === "medications" && <PatientMedications patientId={user?.user_id!} />}
          {activeTab === "profile" && <PatientProfile userId={user?.user_id!} />}
        </div>
      </main>
    </div>
  )
}