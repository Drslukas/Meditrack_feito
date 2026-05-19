"use client"

import { useState } from "react"
import { UserPlus, User, Phone, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { PatternFormat } from "react-number-format"

interface DoctorAddPatientProps {
  onBack: () => void
  onPatientAdded: () => void
}

export function DoctorAddPatient({ onBack, onPatientAdded }: DoctorAddPatientProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [cpf, setCpf] = useState("")
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cpf,
          birth_date: birthDate,
          phone,
          doctor_id: user?.user_id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.detail || "Erro ao cadastrar paciente")
        return
      }

      toast.success("Paciente cadastrado com sucesso!")
      onPatientAdded()

    } catch (err) {
      console.error(err)
      toast.error("Erro ao cadastrar paciente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Cadastrar Paciente</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Preencha os dados abaixo para adicionar um novo paciente
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Dados do Paciente</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Informações pessoais e de contato
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Seção: Informações pessoais */}
            <div className="space-y-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Informações pessoais
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Nome do paciente"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm">Data de nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm">CPF</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <PatternFormat
                    id="cpf"
                    format="###.###.###-##"
                    value={cpf}
                    onValueChange={(values) => setCpf(values.value)}
                    placeholder="000.000.000-00"
                    className="w-full border border-input rounded-md px-3 py-2 pl-9 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            {/* Divisor */}
            <div className="h-px bg-border" />

            {/* Seção: Contato */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contato
              </p>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Telefone (WhatsApp)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <PatternFormat
                    id="phone"
                    format="(##) #########"
                    value={phone}
                    onValueChange={(values) => setPhone(values.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full border border-input rounded-md px-3 py-2 pl-9 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Este número receberá os lembretes de medicamentos via WhatsApp
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Cadastrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Cadastrar Paciente
                  </span>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onBack} className="px-6">
                Cancelar
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}