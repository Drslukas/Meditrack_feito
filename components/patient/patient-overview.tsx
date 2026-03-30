"use client"

import { useState, useMemo } from "react"
import {
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Flame,
  MessageCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  type Patient,
  type MedicationLog,
  getAdherenceForDate,
  getOverallAdherence,
  getStreak,
  getWeeklyAdherence,
} from "@/lib/mock-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function PatientOverview({ patient }: { patient: Patient }) {
  const today = new Date().toISOString().split("T")[0]
  const [logs, setLogs] = useState<MedicationLog[]>(patient.logs)

  const todayAdherence = useMemo(() => getAdherenceForDate(logs, today), [logs, today])
  const overallAdherence = useMemo(() => getOverallAdherence(logs), [logs])
  const streak = useMemo(() => getStreak(logs), [logs])
  const weeklyData = useMemo(() => getWeeklyAdherence(logs), [logs])

  const todayMeds = useMemo(() => {
    return patient.medications.flatMap((med) =>
      med.times.map((time) => {
        const log = logs.find(
          (l) => l.date === today && l.medicationId === med.id && l.time === time
        )
        return {
          medication: med,
          time,
          taken: log?.taken ?? false,
          logId: `${today}-${med.id}-${time}`,
        }
      })
    ).sort((a, b) => a.time.localeCompare(b.time))
  }, [patient.medications, logs, today])

  function markAsTaken(medId: string, time: string) {
    setLogs((prev) => {
      const idx = prev.findIndex(
        (l) => l.date === today && l.medicationId === medId && l.time === time
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], taken: true, takenAt: new Date().toISOString() }
        return updated
      }
      return [
        ...prev,
        {
          date: today,
          medicationId: medId,
          time,
          taken: true,
          takenAt: new Date().toISOString(),
        },
      ]
    })
    toast.success("Medicamento marcado como tomado!")
  }

  function sendWhatsAppReminder() {
    toast.success("Lembrete enviado via WhatsApp!")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Ola, {patient.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Confira seu resumo de medicamentos de hoje.
        </p>
      </div>

      {/* Stats Cards */}
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
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {todayAdherence.taken}/{todayAdherence.total}
                </p>
                <p className="text-xs text-muted-foreground">Hoje</p>
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{patient.medications.length}</p>
                <p className="text-xs text-muted-foreground">Medicamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-foreground">Progresso de Hoje</CardTitle>
            <Badge
              variant={todayAdherence.percentage === 100 ? "default" : "secondary"}
              className={todayAdherence.percentage === 100 ? "bg-success text-success-foreground" : ""}
            >
              {todayAdherence.percentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={todayAdherence.percentage} className="h-2 mb-4" />
          <div className="flex flex-col gap-3">
            {todayMeds.map((item) => (
              <div
                key={item.logId}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  item.taken
                    ? "bg-success/5 border-success/20"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.taken ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.medication.name} - {item.medication.dosage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.time}
                      {item.medication.fasting && " - Em jejum"}
                    </p>
                  </div>
                </div>
                {!item.taken && (
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => markAsTaken(item.medication.id, item.time)}
                  >
                    Tomar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Chart + WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground">Adesao Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
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
                    dot={{ fill: "var(--primary)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground">Lembretes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ative lembretes por WhatsApp para ser notificado antes de cada horario de medicamento.
            </p>
            <Button
              className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90"
              onClick={sendWhatsAppReminder}
            >
              <MessageCircle className="w-4 h-4" />
              Ativar WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
