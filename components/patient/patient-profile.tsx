"use client"

import { Mail, Phone, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Patient } from "@/lib/mock-data"

export function PatientProfile({ patient }: { patient: Patient }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Suas informacoes pessoais.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">{patient.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{patient.age} anos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{patient.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{patient.phone}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
