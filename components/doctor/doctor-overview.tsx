"use client"

import {
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Patient } from "./doctor-dashboard"

interface DashboardOverview {
  total_patients: number
  general_adherence: number
  high_adherence_percentage: number
  low_adherence_percentage: number
  patients: Patient[]
}

interface DoctorOverviewProps {
  overview: DashboardOverview
  onSelectPatient: (patient: Patient) => void
}

export function DoctorOverview({ overview, onSelectPatient }: DoctorOverviewProps) {
  const { user } = useAuth()

  const chartData = overview.patients.map((p) => ({
    name: p.name.split(" ")[0],
    adesao: p.adherence,
  }))

  const lowAdherenceCount = overview.patients.filter((p) => p.adherence < 70).length
  const highAdherenceCount = overview.patients.filter((p) => p.adherence >= 90).length

  function getAdherenceColor(adherence: number) {
    if (adherence >= 90) return "text-success"
    if (adherence >= 70) return "text-warning"
    return "text-destructive"
  }

  function getAdherenceBg(adherence: number) {
    if (adherence >= 90) return "bg-success"
    if (adherence >= 70) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Olá, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe a adesão dos seus pacientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overview.total_patients}</p>
                <p className="text-xs text-muted-foreground">Pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overview.general_adherence}%</p>
                <p className="text-xs text-muted-foreground">Adesão média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{lowAdherenceCount}</p>
                <p className="text-xs text-muted-foreground">Baixa adesão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{highAdherenceCount}</p>
                <p className="text-xs text-muted-foreground">Alta adesão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Adesão por Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Adesão"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="adesao" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Paciente</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Idade</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Medicamentos</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Adesão</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {overview.patients
                  .sort((a, b) => a.adherence - b.adherence)
                  .map((patient) => (
                    <tr key={patient.patient_id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {patient.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{patient.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {patient.age ? `${patient.age} anos` : "—"}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{patient.active_medications}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={patient.adherence}
                            className={`h-2 w-20 ${getAdherenceBg(patient.adherence)}`}
                          />
                          <span className={`text-sm font-medium ${getAdherenceColor(patient.adherence)}`}>
                            {patient.adherence}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-primary"
                          onClick={() => onSelectPatient(patient)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {overview.patients
              .sort((a, b) => a.adherence - b.adherence)
              .map((patient) => (
                <div
                  key={patient.patient_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectPatient(patient)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.age ? `${patient.age} anos - ` : ""}{patient.active_medications} meds
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${patient.adherence >= 90
                        ? "bg-success/10 text-success border-success/20"
                        : patient.adherence >= 70
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    variant="outline"
                  >
                    {patient.adherence}%
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}