"use client"

import { useState } from "react"
import { ArrowLeft, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export function PatientAuthForm({ onBack }: { onBack: () => void }) {
  const [cpf, setCpf] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { loginAsPatient } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const success = await loginAsPatient(cpf, birthDate)
      if (!success) {
        setError("CPF ou data de nascimento incorretos")
      }
    } catch (err) {
      console.error(err)
      setError("Ocorreu um erro ao tentar fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <Card className="border-2 border-border">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-3">
              <Pill className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              Entrar como Paciente
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse sua conta para gerenciar seus medicamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cpf" className="text-foreground">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="123.456.789-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="birthDate" className="text-foreground">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-2">
                Para se cadastrar, entre em contato com seu médico.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}