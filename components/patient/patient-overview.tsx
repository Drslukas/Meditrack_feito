"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Flame,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// -------------------------
// TYPES
// -------------------------

interface Dose {
  dose_id: number
  medication_name: string
  dosage: string
  indication: string | null
  scheduled_time: string
  status: "pending" | "taken"
}

interface DailyAdherence {
  date: string
  total_doses: number
  taken_doses: number
  adherence: number
}

interface PatientStats {
  general_adherence: number
  missed_doses: number
  consecutive_days: number
  total_doses: number
  taken_doses: number
  daily_adherence: DailyAdherence[]
  weekly_adherence: {
    week: string
    total_doses: number
    taken_doses: number
    adherence: number
  }[]
}

// -------------------------
// HELPERS
// -------------------------

function formatWeeklyChartData(weekly: PatientStats["weekly_adherence"]) {
  return weekly.map((w, i) => ({
    day: `Sem ${i + 1}`,
    percentage: w.adherence,
  }))
}

function getTodayTaken(doses: Dose[]) {
  return doses.filter((d) => d.status === "taken").length
}

// -------------------------
// COMPONENT
// -------------------------

export function PatientOverview() {
  const { user, token } = useAuth()
  const patientId = user?.user_id

  const [doses, setDoses] = useState<Dose[]>([])
  const [stats, setStats] = useState<PatientStats | null>(null)
  const [loadingDoses, setLoadingDoses] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [takingDose, setTakingDose] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch today's doses
  const fetchDoses = useCallback(async () => {
    if (!patientId || !token) return
    setLoadingDoses(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/doses/today/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error("Erro ao buscar doses")
      const data: Dose[] = await res.json()
      setDoses(data)
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar as doses de hoje.")
    } finally {
      setLoadingDoses(false)
    }
  }, [patientId, token])

  // Fetch patient stats
  const fetchStats = useCallback(async () => {
    if (!patientId || !token) return
    setLoadingStats(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error("Erro ao buscar estatísticas")
      const data: PatientStats = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar as estatísticas.")
    } finally {
      setLoadingStats(false)
    }
  }, [patientId, token])

  useEffect(() => {
    fetchDoses()
    fetchStats()
  }, [fetchDoses, fetchStats])

  // Mark dose as taken
  async function handleTakeDose(doseId: number) {
    if (!patientId || !token) return
    setTakingDose(doseId)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/doses/${doseId}/take?patient_id=${patientId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? "Erro ao registrar dose")
      }
      // Atualiza o estado local imediatamente sem refetch
      setDoses((prev) =>
        prev.map((d) =>
          d.dose_id === doseId ? { ...d, status: "taken" } : d
        )
      )
      toast.success("Medicamento marcado como tomado!")
      // Atualiza stats em background
      fetchStats()
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao registrar dose")
    } finally {
      setTakingDose(null)
    }
  }

  // Derived values
  const todayTaken = getTodayTaken(doses)
  const todayTotal = doses.length
  const todayPercentage =
    todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0
  const weeklyChartData = stats ? formatWeeklyChartData(stats.weekly_adherence) : []

  const isLoading = loadingDoses || loadingStats

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Olá, {user?.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Confira seu resumo de medicamentos de hoje.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {loadingStats ? "—" : `${stats?.general_adherence ?? 0}%`}
                </p>
                <p className="text-xs text-muted-foreground">Adesão geral</p>
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
                  {loadingDoses ? "—" : `${todayTaken}/${todayTotal}`}
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
                <p className="text-2xl font-bold text-foreground">
                  {loadingStats ? "—" : stats?.consecutive_days ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Dias seguidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
                <Clock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {loadingStats ? "—" : stats?.missed_doses ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Doses perdidas</p>
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
              variant={todayPercentage === 100 ? "default" : "secondary"}
              className={todayPercentage === 100 ? "bg-success text-success-foreground" : ""}
            >
              {loadingDoses ? "—" : `${todayPercentage}%`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={todayPercentage} className="h-2 mb-4" />

          {loadingDoses ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando doses...</span>
            </div>
          ) : doses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma dose programada para hoje.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {doses.map((dose) => (
                <div
                  key={dose.dose_id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${dose.status === "taken"
                      ? "bg-success/5 border-success/20"
                      : "bg-card border-border"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {dose.status === "taken" ? (
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {dose.medication_name} - {dose.dosage}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dose.scheduled_time}
                        {dose.indication && ` — ${dose.indication}`}
                      </p>
                    </div>
                  </div>
                  {dose.status === "pending" && (
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={takingDose === dose.dose_id}
                      onClick={() => handleTakeDose(dose.dose_id)}
                    >
                      {takingDose === dose.dose_id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Tomar"
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Adesão Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando gráfico...</span>
            </div>
          ) : weeklyChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-muted-foreground">Sem dados semanais disponíveis.</p>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
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
                    dataKey="percentage"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}