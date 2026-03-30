"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  type Patient,
  getAdherenceForDate,
} from "@/lib/mock-data"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function PatientCalendar({ patient }: { patient: Patient }) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const calendarDays = useMemo(() => {
    const days: { day: number; dateStr: string; adherence: ReturnType<typeof getAdherenceForDate> }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      days.push({
        day: d,
        dateStr,
        adherence: getAdherenceForDate(patient.logs, dateStr),
      })
    }
    return days
  }, [patient.logs, currentYear, currentMonth, daysInMonth])

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null
    const adherence = getAdherenceForDate(patient.logs, selectedDate)
    const dayLogs = patient.logs.filter((l) => l.date === selectedDate)
    const meds = dayLogs.map((log) => {
      const med = patient.medications.find((m) => m.id === log.medicationId)
      return { ...log, medicationName: med?.name ?? "Desconhecido", dosage: med?.dosage ?? "" }
    })
    return { adherence, meds }
  }, [selectedDate, patient.logs, patient.medications])

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

  function getStatusColor(percentage: number, total: number, dateStr: string) {
    const todayStr = today.toISOString().split("T")[0]
    if (dateStr > todayStr) return "bg-muted"
    if (total === 0) return "bg-muted"
    if (percentage === 100) return "bg-success"
    if (percentage >= 50) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Calendario</h1>
        <p className="text-muted-foreground mt-1">
          Visualize seu historico de adesao dia a dia.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Completo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Parcial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Perdido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted border border-border" />
          <span className="text-muted-foreground">Futuro</span>
        </div>
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

          {/* Calendar grid */}
          <TooltipProvider>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {calendarDays.map(({ day, dateStr, adherence }) => {
                const isToday = dateStr === today.toISOString().split("T")[0]
                const isSelected = dateStr === selectedDate
                const statusColor = getStatusColor(
                  adherence.percentage,
                  adherence.total,
                  dateStr
                )

                return (
                  <Tooltip key={dateStr}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-1"
                            : ""
                        } ${isToday ? "font-bold" : ""}`}
                      >
                        <span className="text-foreground">{day}</span>
                        {adherence.total > 0 && (
                          <div className={`w-2 h-2 rounded-full mt-0.5 ${statusColor}`} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      {adherence.total > 0
                        ? `${adherence.taken}/${adherence.total} tomados (${adherence.percentage}%)`
                        : "Sem medicamentos registrados"}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDayData && selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-foreground">
              Detalhes - {selectedDate.split("-").reverse().join("/")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-foreground">
                {selectedDayData.adherence.percentage}%
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedDayData.adherence.taken} de {selectedDayData.adherence.total} medicamentos tomados
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {selectedDayData.meds.map((med, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                    med.taken
                      ? "bg-success/5 border-success/20"
                      : "bg-destructive/5 border-destructive/20"
                  }`}
                >
                  <div>
                    <span className="font-medium text-foreground">{med.medicationName}</span>
                    <span className="text-muted-foreground ml-2">{med.dosage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{med.time}</span>
                    <span
                      className={`text-xs font-medium ${
                        med.taken ? "text-success" : "text-destructive"
                      }`}
                    >
                      {med.taken ? "Tomado" : "Nao tomado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
