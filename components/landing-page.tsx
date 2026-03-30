"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Stethoscope, Pill, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientAuthForm } from "@/components/patient-auth-form"
import { DoctorAuthForm } from "@/components/doctor-auth-form"

type View = "home" | "patient-login" | "doctor-login"

export function LandingPage() {
  const [view, setView] = useState<View>("home")

  if (view === "patient-login") {
    return <PatientAuthForm onBack={() => setView("home")} />
  }

  if (view === "doctor-login") {
    return <DoctorAuthForm onBack={() => setView("home")} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="MediTrack" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-semibold text-foreground tracking-tight">MediTrack</span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Controle inteligente de medicamentos
          </p>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight text-balance leading-tight">
            Sua saude sob controle, todos os dias
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty leading-relaxed max-w-xl mx-auto">
            Acompanhe seus medicamentos, receba lembretes e mantenha seu medico informado sobre sua adesao ao tratamento.
          </p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Card
            className="group cursor-pointer border-2 border-border transition-all hover:border-primary hover:shadow-lg"
            onClick={() => setView("patient-login")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Sou Paciente</CardTitle>
              <CardDescription className="text-muted-foreground">
                Acompanhe seus medicamentos e confira seu historico de adesao
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Button variant="ghost" className="text-primary gap-2 group-hover:gap-3 transition-all">
                Acessar portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer border-2 border-border transition-all hover:border-primary hover:shadow-lg"
            onClick={() => setView("doctor-login")}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                <Stethoscope className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Sou Medico</CardTitle>
              <CardDescription className="text-muted-foreground">
                Monitore a adesao dos seus pacientes e prescreva medicamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Button variant="ghost" className="text-primary gap-2 group-hover:gap-3 transition-all">
                Acessar portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
              <Pill className="w-5 h-5 text-success" />
            </div>
            <h3 className="font-medium text-foreground text-sm">Acompanhamento Diario</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Marque cada medicamento como tomado e veja seu progresso
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
              <Shield className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-medium text-foreground text-sm">Lembretes via WhatsApp</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Receba notificacoes para nunca esquecer seus remedios
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-foreground text-sm">Monitoramento Medico</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seu medico acompanha sua adesao em tempo real
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          MediTrack - Plataforma de Adesao Medicamentosa
        </p>
      </footer>
    </div>
  )
}
