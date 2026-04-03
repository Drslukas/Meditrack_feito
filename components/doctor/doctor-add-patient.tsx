"use client"

import { useState } from "react"
import { ArrowLeft, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastrar Novo Paciente</h1>
          <p className="text-muted-foreground">
            Adicione um novo paciente ao seu quadro de acompanhamento
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Dados do Paciente</CardTitle>
          </div>
          <CardDescription>
            Preencha as informações do novo paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Nome do paciente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <PatternFormat
                format="(##) #########"
                value={phone}
                onValueChange={(values) => setPhone(values.value)}
                placeholder="(00) 00000-0000"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <PatternFormat
                format="###.###.###-##"
                value={cpf}
                onValueChange={(values) => setCpf(values.value)}
                placeholder="000.000.000-00"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar Paciente"}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}