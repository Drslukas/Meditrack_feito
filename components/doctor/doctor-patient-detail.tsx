"use client"

import { useState, useMemo } from "react"
import {
  ArrowLeft,
  TrendingUp,
  Flame,
  AlertTriangle,
  Calendar,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  type Patient,
  getOverallAdherence,
  getStreak,
  getMonthlyAdherence,
  getWeeklyAdherence,
  getAdherenceForDate,
} from "@/lib/mock-data"
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

interface DoctorPatientDetailProps {
  patient: Patient
  onBack: () => void
}

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export function DoctorPatientDetail({ patient, onBack }: DoctorPatientDetailProps) {
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)

  const overallAdherence = useMemo(() => getOverallAdherence(patient.logs), [patient.logs])
  const streak = useMemo(() => getStreak(patient.logs), [patient.logs])
  const monthlyData = useMemo(() => getMonthlyAdherence(patient.logs), [patient.logs])
  const weeklyData = useMemo(() => getWeeklyAdherence(patient.logs), [patient.logs])

  const weeklyAvg = useMemo(() => {
    const sum = weeklyData.reduce((acc, d) => acc + d.percentage, 0)
    return weeklyData.length > 0 ? Math.round(sum / weeklyData.length) : 0
  }, [weeklyData])

  const missedDoses = useMemo(() => {
    const pastLogs = patient.logs.filter((l) => {
      const today = new Date().toISOString().split("T")[0]
      return l.date < today && !l.taken
    })
    return pastLogs.length
  }, [patient.logs])

  // Mini annual calendar
  const annualCalendar = useMemo(() => {
    const today = new Date()
    const months: { month: number; year: number; days: { dateStr: string; percentage: number; total: number }[] }[] = []
    for (let m = 5; m >= 0; m--) {
      const date = new Date(today.getFullYear(), today.getMonth() - m, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const days = []
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        const adherence = getAdherenceForDate(patient.logs, dateStr)
        days.push({ dateStr, percentage: adherence.percentage, total: adherence.total })
      }
      months.push({ month, year, days })
    }
    return months
  }, [patient.logs])

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
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
              <p className="text-sm text-muted-foreground">{patient.age} anos</p>
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
              <DialogTitle className="text-foreground">Nova Prescricao</DialogTitle>
            </DialogHeader>
            <PrescriptionForm
              onSave={() => {
                setPrescriptionOpen(false)
                toast.success("Prescricao salva com sucesso!")
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Patient Info */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-3.5 h-3.5" />
          <span>{patient.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          <span>{patient.phone}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallAdherence}%</p>
                <p className="text-xs text-muted-foreground">Adesao geral</p>
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
                <p className="text-2xl font-bold text-foreground">{weeklyAvg}%</p>
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
                <p className="text-2xl font-bold text-foreground">{missedDoses}</p>
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
                <p className="text-2xl font-bold text-foreground">{streak}</p>
                <p className="text-xs text-muted-foreground">Dias seguidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="medications">Medicamentos</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4 mt-4">
          {/* 30 day chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Tendencia de Adesao - 30 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Adesao"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
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
              <CardTitle className="text-base text-foreground">Adesao Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, "Adesao"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
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

        <TabsContent value="medications" className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.medications.map((med) => (
              <Card key={med.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage}</p>
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {med.timesPerDay}x/dia
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Horarios: {med.times.join(", ")}</span>
                    </div>
                    {med.fasting && (
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Em jejum</span>
                      </div>
                    )}
                    {med.instructions && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-1">
                        {med.instructions}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">Historico de Adesao - 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 text-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-warning" />
                  <span className="text-xs text-muted-foreground">{'50-99%'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                  <span className="text-xs text-muted-foreground">{'<50%'}</span>
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
                          const todayStr = new Date().toISOString().split("T")[0]
                          let bg = "bg-muted"
                          if (day.dateStr <= todayStr && day.total > 0) {
                            if (day.percentage === 100) bg = "bg-success"
                            else if (day.percentage >= 50) bg = "bg-warning"
                            else bg = "bg-destructive"
                          }
                          return (
                            <Tooltip key={day.dateStr}>
                              <TooltipTrigger asChild>
                                <div className={`w-3 h-3 rounded-sm ${bg} cursor-default`} />
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                {day.dateStr.split("-").reverse().join("/")} - {day.percentage}%
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
function PrescriptionForm({ onSave }: { onSave: () => void }) {
  const [medications, setMedications] = useState([
    { name: "", dosage: "", timesPerDay: 1, times: ["08:00"], fasting: false, instructions: "" },
  ])

  function addMedication() {
    setMedications([
      ...medications,
      { name: "", dosage: "", timesPerDay: 1, times: ["08:00"], fasting: false, instructions: "" },
    ])
  }

  function removeMedication(index: number) {
    if (medications.length === 1) return
    setMedications(medications.filter((_, i) => i !== index))
  }

  function updateMedication(index: number, field: string, value: string | number | boolean | string[]) {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  function addTime(medIndex: number) {
    const updated = [...medications]
    updated[medIndex].times = [...updated[medIndex].times, "12:00"]
    updated[medIndex].timesPerDay = updated[medIndex].times.length
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
    updated[medIndex].timesPerDay = updated[medIndex].times.length
    setMedications(updated)
  }

  return (
    <div className="flex flex-col gap-6">
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
            <Label className="text-xs text-foreground">Horarios</Label>
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
                Adicionar horario
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
            <Label className="text-xs text-foreground">Instrucoes especiais</Label>
            <Textarea
              placeholder="Observacoes adicionais..."
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
        onClick={onSave}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Salvar prescricao
      </Button>
    </div>
  )
}
