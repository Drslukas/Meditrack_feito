"use client"

import { useState, useMemo } from "react"
import { Search, Users, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Patient } from "./doctor-dashboard"

interface DoctorPatientsListProps {
  patients: Patient[]
  onSelectPatient: (patient: Patient) => void
}

export function DoctorPatientsList({ patients, onSelectPatient }: DoctorPatientsListProps) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "adherence" | "age">("name")
  const [filterAdherence, setFilterAdherence] = useState<"all" | "high" | "medium" | "low">("all")

  const filteredPatients = useMemo(() => {
    let result = [...patients]

    // Filtro por busca
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por nível de adesão
    if (filterAdherence !== "all") {
      result = result.filter((p) => {
        if (filterAdherence === "high") return p.adherence >= 80
        if (filterAdherence === "medium") return p.adherence >= 50 && p.adherence < 80
        return p.adherence < 50
      })
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "adherence") return b.adherence - a.adherence
      if (sortBy === "age") return (b.age ?? 0) - (a.age ?? 0)
      return 0
    })

    return result
  }, [patients, search, sortBy, filterAdherence])

  function getAdherenceBadge(adherence: number) {
    if (adherence >= 80) {
      return (
        <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
          <TrendingUp className="w-3 h-3 mr-1" />
          {adherence}%
        </Badge>
      )
    }
    if (adherence >= 50) {
      return (
        <Badge className="bg-warning/10 text-warning-foreground border-warning/20 hover:bg-warning/20">
          <Minus className="w-3 h-3 mr-1" />
          {adherence}%
        </Badge>
      )
    }
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
        <TrendingDown className="w-3 h-3 mr-1" />
        {adherence}%
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e acompanhe todos os seus pacientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                <p className="text-sm text-muted-foreground">Total de Pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {patients.filter((p) => p.adherence >= 80).length}
                </p>
                <p className="text-sm text-muted-foreground">Alta Adesão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {patients.filter((p) => p.adherence < 50).length}
                </p>
                <p className="text-sm text-muted-foreground">Necessitam Atenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="adherence">Adesão</SelectItem>
                <SelectItem value="age">Idade</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAdherence} onValueChange={(v) => setFilterAdherence(v as typeof filterAdherence)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar adesão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="high">Alta (80%+)</SelectItem>
                <SelectItem value="medium">Média (50-79%)</SelectItem>
                <SelectItem value="low">Baixa (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filteredPatients.length} paciente{filteredPatients.length !== 1 ? "s" : ""} encontrado{filteredPatients.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum paciente encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.patient_id}
                  onClick={() => onSelectPatient(patient)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{patient.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {patient.age ? `${patient.age} anos - ` : ""}{patient.active_medications} medicamento{patient.active_medications !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {getAdherenceBadge(patient.adherence)}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}