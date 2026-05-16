"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, TrendingUp, Flame, AlertTriangle, Calendar, Plus, Phone, Clock, Trash2, Pill, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

interface MedicationSchedule {
  scheduled_time: string
}

interface MedicationForm {
  id: string
  name: string
  dosage: string
  indication: string
  notes: string
  start_date: string
  end_date: string
  schedules: MedicationSchedule[]
}

function createEmptyMedication(): MedicationForm {
  return {
    id: crypto.randomUUID(),
    name: "",
    dosage: "",
    indication: "",
    notes: "",
    start_date: "",
    end_date: "",
    schedules: [{ scheduled_time: "" }],
  }
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
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        setDashboard(data)
      } catch {
        toast.error("Erro ao carregar dados do paciente")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [patient.patient_id, token])

  const annualCalendar = (() => {
    const today = new Date()
    const months: { month: number; year: number; days: { dateStr: string; percentage: number }[] }[] = []

    // Descobre o mês mais antigo com dados, ou usa o mês atual como fallback
    const firstDate = (dashboard?.daily_adherence?.length ?? 0) > 0
      ? new Date(dashboard!.daily_adherence[0].date)
      : today

    const start = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 1)

    while (start <= end) {
      const year = start.getFullYear()
      const month = start.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const days = []

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        const found = dashboard?.daily_adherence.find((da) => da.date === dateStr)
        days.push({ dateStr, percentage: found?.adherence ?? -1 })
      }

      months.push({ month, year, days })
      start.setMonth(start.getMonth() + 1)
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Prescrição</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os medicamentos e horários para {dashboard.patient_name}
              </DialogDescription>
            </DialogHeader>
            <PrescriptionForm
              doctorId={user?.user_id!}
              patientId={patient.patient_id}
              token={token!}
              onSave={() => {
                setPrescriptionOpen(false)
                toast.success("Prescrição criada com sucesso!")
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Adesão recente
                  </CardTitle>

                  <p className="text-xs text-muted-foreground mt-1">
                    Desde o início do tratamento
                  </p>
                </div>

                {/* Legenda */}
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    {
                      label: "100%",
                      color: "bg-[#1D9E75]",
                    },
                    {
                      label: "50–99%",
                      color: "bg-[#EF9F27]",
                    },
                    {
                      label: "<50%",
                      color: "bg-destructive",
                    },
                    {
                      label: "Sem dados",
                      color:
                        "bg-muted border border-border/60",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-1.5"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${item.color}`}
                      />

                      <span className="text-[11px] text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {annualCalendar.map((m) => (
                <div key={`${m.year}-${m.month}`} className="flex items-start gap-4">
                  <div className="w-10 shrink-0 pt-1">
                    <p className="text-xs font-semibold text-foreground">{MONTHS_SHORT[m.month]}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.year}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    {m.days.map((day) => {
                      let bg = "bg-muted border border-border/50"
                      if (day.percentage === 100) bg = "bg-[#1D9E75]"
                      else if (day.percentage >= 50) bg = "bg-[#EF9F27]"
                      else if (day.percentage >= 0) bg = "bg-destructive"
                      return (
                        <Tooltip key={day.dateStr}>
                          <TooltipTrigger asChild>
                            <div className={`h-5 flex-1 min-w-[10px] rounded-sm transition-all duration-150 hover:opacity-80 ${bg}`} />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">
                              {day.dateStr.split("-").reverse().join("/")}
                              {" • "}
                              {day.percentage >= 0 ? `${day.percentage}%` : "Sem dados"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PrescriptionForm — mesma lógica do DoctorNewPrescription
// ─────────────────────────────────────────────────────────────
function PrescriptionForm({
  doctorId,
  patientId,
  token,
  onSave,
}: {
  doctorId: number
  patientId: number
  token: string
  onSave: () => void
}) {
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [medications, setMedications] = useState<MedicationForm[]>([createEmptyMedication()])
  const [collapsedMeds, setCollapsedMeds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  function updateMedication(id: string, field: keyof MedicationForm, value: string) {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  function addMedication() {
    setMedications((prev) => [...prev, createEmptyMedication()])
  }

  function removeMedication(id: string) {
    if (medications.length === 1) {
      toast.error("A prescrição deve ter ao menos um medicamento")
      return
    }
    setMedications((prev) => prev.filter((m) => m.id !== id))
    setCollapsedMeds((prev) => { prev.delete(id); return new Set(prev) })
  }

  function toggleCollapse(id: string) {
    setCollapsedMeds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function addSchedule(medId: string) {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? { ...m, schedules: [...m.schedules, { scheduled_time: "" }] }
          : m
      )
    )
  }

  function updateSchedule(medId: string, index: number, value: string) {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id !== medId) return m
        const schedules = [...m.schedules]
        schedules[index] = { scheduled_time: value }
        return { ...m, schedules }
      })
    )
  }

  function removeSchedule(medId: string, index: number) {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id !== medId) return m
        if (m.schedules.length === 1) {
          toast.error("O medicamento deve ter ao menos um horário")
          return m
        }
        return { ...m, schedules: m.schedules.filter((_, i) => i !== index) }
      })
    )
  }

  async function handleSubmit() {
    for (const med of medications) {
      if (!med.name || !med.dosage || !med.start_date || !med.end_date) {
        toast.error(`Preencha todos os campos obrigatórios do medicamento "${med.name || "sem nome"}"`)
        return
      }
      if (med.end_date < med.start_date) {
        toast.error(`A data de fim não pode ser anterior à de início em "${med.name}"`)
        return
      }
      for (const s of med.schedules) {
        if (!s.scheduled_time) {
          toast.error(`Preencha todos os horários do medicamento "${med.name}"`)
          return
        }
      }
    }

    setLoading(true)
    try {
      const body = {
        doctor_id: doctorId,
        patient_id: patientId,
        notes: prescriptionNotes || null,
        medications: medications.map(({ id, ...med }) => med),
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prescriptions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.detail || "Erro ao criar prescrição")
        return
      }

      onSave()
    } catch {
      toast.error("Erro ao criar prescrição")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Observações gerais</Label>
        <Textarea
          placeholder="Instruções gerais da prescrição (opcional)"
          value={prescriptionNotes}
          onChange={(e) => setPrescriptionNotes(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-3">
        {medications.map((med, medIndex) => {
          const isCollapsed = collapsedMeds.has(med.id)
          return (
            <Card key={med.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-primary" />
                    {med.name
                      ? `${med.name}${med.dosage ? ` — ${med.dosage}` : ""}`
                      : `Medicamento ${medIndex + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => toggleCollapse(med.id)}
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeMedication(med.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isCollapsed && (
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="Ex: Metformina"
                        value={med.name}
                        onChange={(e) => updateMedication(med.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Dosagem <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="Ex: 850mg"
                        value={med.dosage}
                        onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Data de início <span className="text-destructive">*</span></Label>
                      <Input
                        type="date"
                        value={med.start_date}
                        onChange={(e) => updateMedication(med.id, "start_date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Data de fim <span className="text-destructive">*</span></Label>
                      <Input
                        type="date"
                        value={med.end_date}
                        min={med.start_date}
                        onChange={(e) => updateMedication(med.id, "end_date", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Indicação de uso</Label>
                      <Input
                        placeholder="Ex: Em jejum, com água"
                        value={med.indication}
                        onChange={(e) => updateMedication(med.id, "indication", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Observações</Label>
                      <Input
                        placeholder="Ex: Evitar com álcool"
                        value={med.notes}
                        onChange={(e) => updateMedication(med.id, "notes", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      Horários <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {med.schedules.map((schedule, schedIndex) => (
                        <div key={schedIndex} className="flex items-center gap-1">
                          <Input
                            type="time"
                            value={schedule.scheduled_time}
                            onChange={(e) => updateSchedule(med.id, schedIndex, e.target.value)}
                            className="w-32"
                          />
                          {med.schedules.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => removeSchedule(med.id, schedIndex)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-9 text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => addSchedule(med.id)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Horário
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}

        <Button
          variant="outline"
          className="w-full gap-2 border-dashed text-muted-foreground hover:text-foreground"
          onClick={addMedication}
        >
          <Plus className="w-4 h-4" />
          Adicionar Medicamento
        </Button>
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Prescrição"}
      </Button>
    </div>
  )
}