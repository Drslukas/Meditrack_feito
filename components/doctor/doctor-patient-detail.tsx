"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  TrendingUp,
  Flame,
  AlertTriangle,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Patient } from "./doctor-dashboard"

interface PatientDashboard {
  patient_name: string
  patient_phone: string | null
  patient_age: number | null
  total_doses: number
  taken_doses: number
  general_adherence: number
  missed_doses: number
  consecutive_days: number
  daily_adherence: { date: string; total_doses: number; taken_doses: number; adherence: number }[]
  weekly_adherence: { week: string; total_doses: number; taken_doses: number; adherence: number }[]
}

interface DoctorPatientDetailProps {
  patient: Patient
  onBack: () => void
}

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export function DoctorPatientDetail({ patient, onBack }: DoctorPatientDetailProps) {
  const { token, user } = useAuth()
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/patient/${patient.patient_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        const data = await res.json()
        setDashboard(data)
      } catch (err) {
        console.error("Erro ao buscar dashboard do paciente:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [patient.patient_id, token])

  // Montar calendário dos últimos 6 meses
  const annualCalendar = (() => {
    const today = new Date()
    const months: { month: number; year: number; days: { dateStr: string; percentage: number }[] }[] = []

    for (let m = 5; m >= 0; m--) {
      const date = new Date(today.getFullYear(), today.getMonth() - m, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const days = []

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        const found = dashboard?.daily_adherence.find((da) => da.date === dateStr)
        days.push({ dateStr, percentage: found?.adherence ?? -1 })
      }

      months.push({ month, year, days })
    }

    return months
  })()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold">
              {dashboard.patient_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{dashboard.patient_name}</h1>
              <p className="text-sm text-muted-foreground">
                {dashboard.patient_age ? `${dashboard.patient_age} anos` : "Idade não informada"}
              </p>
            </div>
          </div>
        </div>
        <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Prescrever</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Prescrição</DialogTitle>
            </DialogHeader>
            <PrescriptionForm
              doctorId={user?.user_id!}
              patientId={patient.patient_id}
              token={token!}
              onSave={() => {
                setPrescriptionOpen(false)
                toast.success("Prescrição salva com sucesso!")
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Patient Info */}
      {dashboard.patient_phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          <span>{dashboard.patient_phone}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{dashboard.general_adherence}%</p>
                <p className="text-xs text-muted-foreground">Adesão geral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {dashboard.weekly_adherence.length > 0
                    ? dashboard.weekly_adherence[dashboard.weekly_adherence.length - 1].adherence
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Semana atual</p>
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
                <p className="text-2xl font-bold text-foreground">{dashboard.missed_doses}</p>
                <p className="text-xs text-muted-foreground">Doses perdidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
                <Flame className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{dashboard.consecutive_days}</p>
                <p className="text-xs text-muted-foreground">Dias seguidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4 mt-4">
          {/* 30 day chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Tendência de Adesão - 30 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard.daily_adherence}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Adesão"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adherence"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Adesão Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard.weekly_adherence}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Adesão"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adherence"
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      dot={{ fill: "var(--chart-2)", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Histórico de Adesão - 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 text-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-warning" />
                  <span className="text-xs text-muted-foreground">50-99%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                  <span className="text-xs text-muted-foreground">&lt;50%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-muted border border-border" />
                  <span className="text-xs text-muted-foreground">Sem dados</span>
                </div>
              </div>

              <TooltipProvider>
                <div className="flex flex-col gap-4">
                  {annualCalendar.map((m) => (
                    <div key={`${m.year}-${m.month}`}>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        {MONTHS_SHORT[m.month]} {m.year}
                      </p>
                      <div className="flex flex-wrap gap-0.5">
                        {m.days.map((day) => {
                          let bg = "bg-muted"
                          if (day.percentage === 100) bg = "bg-success"
                          else if (day.percentage >= 50) bg = "bg-warning"
                          else if (day.percentage >= 0) bg = "bg-destructive"
                          return (
                            <Tooltip key={day.dateStr}>
                              <TooltipTrigger asChild>
                                <div className={`w-3 h-3 rounded-sm ${bg} cursor-default`} />
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                {day.dateStr.split("-").reverse().join("/")}
                                {day.percentage >= 0 ? ` - ${day.percentage}%` : " - Sem dados"}
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Prescription Form Component
function PrescriptionForm({ doctorId, patientId, token, onSave }: {
  doctorId: number
  patientId: number
  token: string
  onSave: () => void
}) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("")
  const [medications, setMedications] = useState([
    { name: "", dosage: "", times: ["08:00"], fasting: false, instructions: "" },
  ])

  async function handleSave() {
    try {
      const body = {
        doctor_id: doctorId,
        patient_id: patientId,
        notes,
        medications: medications.map((med) => ({
          name: med.name,
          dosage: med.dosage,
          indication: med.fasting ? "Tomar em jejum" : null,
          notes: med.instructions || null,
          start_date: startDate,
          end_date: endDate,
          schedules: med.times.map((t) => ({ scheduled_time: t })),
        })),
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prescriptions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        toast.error("Erro ao salvar prescrição")
        return
      }

      onSave()
    } catch (err) {
      console.error(err)
      toast.error("Erro ao salvar prescrição")
    }
  }

  function addMedication() {
    setMedications([...medications, { name: "", dosage: "", times: ["08:00"], fasting: false, instructions: "" }])
  }

  function removeMedication(index: number) {
    if (medications.length === 1) return
    setMedications(medications.filter((_, i) => i !== index))
  }

  function updateMedication(index: number, field: string, value: string | boolean | string[]) {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  function addTime(medIndex: number) {
    const updated = [...medications]
    updated[medIndex].times = [...updated[medIndex].times, "12:00"]
    setMedications(updated)
  }

  function updateTime(medIndex: number, timeIndex: number, value: string) {
    const updated = [...medications]
    updated[medIndex].times[timeIndex] = value
    setMedications(updated)
  }

  function removeTime(medIndex: number, timeIndex: number) {
    const updated = [...medications]
    if (updated[medIndex].times.length === 1) return
    updated[medIndex].times = updated[medIndex].times.filter((_, i) => i !== timeIndex)
    setMedications(updated)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Período da prescrição */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-foreground">Data de início</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-foreground">Data de fim</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-foreground">Observações gerais</Label>
        <Textarea
          placeholder="Observações da prescrição..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {medications.map((med, medIndex) => (
        <div key={medIndex} className="flex flex-col gap-3 p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Medicamento {medIndex + 1}
            </span>
            {medications.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-destructive"
                onClick={() => removeMedication(medIndex)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-foreground">Nome</Label>
              <Input
                placeholder="Ex: Losartana"
                value={med.name}
                onChange={(e) => updateMedication(medIndex, "name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-foreground">Dosagem</Label>
              <Input
                placeholder="Ex: 50mg"
                value={med.dosage}
                onChange={(e) => updateMedication(medIndex, "dosage", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-foreground">Horários</Label>
            <div className="flex flex-col gap-2">
              {med.times.map((time, timeIndex) => (
                <div key={timeIndex} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(medIndex, timeIndex, e.target.value)}
                    className="flex-1"
                  />
                  {med.times.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground"
                      onClick={() => removeTime(medIndex, timeIndex)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-1"
                onClick={() => addTime(medIndex)}
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar horário
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`fasting-${medIndex}`} className="text-xs text-foreground">
              Em jejum
            </Label>
            <Switch
              id={`fasting-${medIndex}`}
              checked={med.fasting}
              onCheckedChange={(checked) => updateMedication(medIndex, "fasting", checked)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-foreground">Instruções especiais</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={med.instructions}
              onChange={(e) => updateMedication(medIndex, "instructions", e.target.value)}
              rows={2}
            />
          </div>
        </div>
      ))}

      <Button variant="outline" className="w-full gap-2" onClick={addMedication}>
        <Plus className="w-4 h-4" />
        Adicionar medicamento
      </Button>

      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handleSave}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Salvar prescrição
      </Button>
    </div>
  )
}