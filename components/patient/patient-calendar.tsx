"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// -------------------------
// TYPES
// -------------------------

interface DailyAdherence {
  date: string
  total_doses: number
  taken_doses: number
  adherence: number
}

// -------------------------
// CONSTANTS
// -------------------------

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

// -------------------------
// HELPERS
// -------------------------

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function getStatusColor(adherence: number, total: number, dateStr: string) {
  const todayStr = new Date().toISOString().split("T")[0]
  if (dateStr > todayStr) return "bg-muted"
  if (total === 0) return "bg-muted"
  if (adherence === 100) return "bg-success"
  if (adherence >= 50) return "bg-warning"
  return "bg-destructive"
}

// -------------------------
// COMPONENT
// -------------------------

export function PatientCalendar() {
  const { user, token } = useAuth()
  const patientId = user?.user_id

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dailyAdherence, setDailyAdherence] = useState<DailyAdherence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch stats (contains daily_adherence for last 30 days)
  const fetchAdherence = useCallback(async () => {
    if (!patientId || !token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error("Erro ao buscar histórico")
      const data = await res.json()
      setDailyAdherence(data.daily_adherence ?? [])
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar o histórico.")
    } finally {
      setLoading(false)
    }
  }, [patientId, token])

  useEffect(() => {
    fetchAdherence()
  }, [fetchAdherence])

  // Map date string -> adherence data for O(1) lookup
  const adherenceMap = useMemo(() => {
    const map: Record<string, DailyAdherence> = {}
    for (const d of dailyAdherence) {
      map[d.date] = d
    }
    return map
  }, [dailyAdherence])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const calendarDays = useMemo(() => {
    const days: { day: number; dateStr: string }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      days.push({ day: d, dateStr })
    }
    return days
  }, [currentYear, currentMonth, daysInMonth])

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null
    return adherenceMap[selectedDate] ?? null
  }, [selectedDate, adherenceMap])

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    setSelectedDate(null)
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    setSelectedDate(null)
  }

  const todayStr = today.toISOString().split("T")[0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Calendário</h1>
        <p className="text-muted-foreground mt-1">
          Visualize seu histórico de adesão dia a dia.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {[
          { color: "bg-success", label: "Completo" },
          { color: "bg-warning", label: "Parcial" },
          { color: "bg-destructive", label: "Perdido" },
          { color: "bg-muted border border-border", label: "Futuro / Sem dados" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-base text-foreground">
              {MONTHS[currentMonth]} {currentYear}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando calendário...</span>
            </div>
          ) : (
            <TooltipProvider>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {calendarDays.map(({ day, dateStr }) => {
                  const data = adherenceMap[dateStr]
                  const isToday = dateStr === todayStr
                  const isSelected = dateStr === selectedDate
                  const statusColor = getStatusColor(
                    data?.adherence ?? 0,
                    data?.total_doses ?? 0,
                    dateStr
                  )

                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""
                            } ${isToday ? "font-bold" : ""}`}
                        >
                          <span className="text-foreground">{day}</span>
                          {data && data.total_doses > 0 && (
                            <div className={`w-2 h-2 rounded-full mt-0.5 ${statusColor}`} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {data && data.total_doses > 0
                          ? `${data.taken_doses}/${data.total_doses} tomados (${data.adherence}%)`
                          : "Sem dados para este dia"}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground">
              Detalhes — {selectedDate.split("-").reverse().join("/")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDayData ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum dado registrado para este dia.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl font-bold text-foreground">
                    {selectedDayData.adherence}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedDayData.taken_doses} de {selectedDayData.total_doses} doses tomadas
                  </span>
                </div>

                {/* Progress bar for selected day */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${selectedDayData.adherence === 100
                        ? "bg-success"
                        : selectedDayData.adherence >= 50
                          ? "bg-warning"
                          : "bg-destructive"
                      }`}
                    style={{ width: `${selectedDayData.adherence}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  O detalhamento por medicamento de dias anteriores estará disponível em breve.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}