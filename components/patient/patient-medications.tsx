"use client"

import { Clock, AlertTriangle, Pill } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "@/lib/mock-data"

export function PatientMedications({ patient }: { patient: Patient }) {
  // Group medications by time
  const timeGroups: Record<string, typeof patient.medications> = {}
  for (const med of patient.medications) {
    for (const time of med.times) {
      if (!timeGroups[time]) timeGroups[time] = []
      timeGroups[time].push(med)
    }
  }

  const sortedTimes = Object.keys(timeGroups).sort()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Medicamentos</h1>
        <p className="text-muted-foreground mt-1">
          Sua lista completa de medicamentos e horarios.
        </p>
      </div>

      {/* All medications grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patient.medications.map((med) => (
          <Card key={med.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Pill className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-base text-foreground">{med.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{med.dosage}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{med.timesPerDay}x ao dia - {med.times.join(", ")}</span>
                </div>
                {med.fasting && (
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Em jejum</span>
                  </div>
                )}
                {med.instructions && (
                  <p className="text-muted-foreground text-xs mt-1 bg-muted/50 p-2 rounded">
                    {med.instructions}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule by time */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Horarios do dia</h2>
        <div className="flex flex-col gap-3">
          {sortedTimes.map((time) => (
            <Card key={time}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">{time}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {timeGroups[time].map((med) => (
                    <div
                      key={`${time}-${med.id}`}
                      className="flex items-center justify-between p-2 rounded border border-border"
                    >
                      <span className="text-sm text-foreground font-medium">{med.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{med.dosage}</span>
                        {med.fasting && (
                          <Badge variant="outline" className="text-xs border-warning text-warning">
                            Jejum
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
