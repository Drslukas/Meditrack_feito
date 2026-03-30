"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, Pill } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export function PatientAuthForm({ onBack }: { onBack: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { loginAsPatient } = useAuth()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Simulação de login - apenas navega para o dashboard
    // Como estamos focando apenas no front-end, usamos credenciais fixas
    const success = loginAsPatient("demo@email.com", "demo")
    if (!success) {
      // Fallback: força login com primeiro paciente para demo
      loginAsPatient("carla.mendes@email.com", "senha123")
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
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Entrar
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-2">
                Para se cadastrar, entre em contato com seu médico. A senha será definida pelo médico responsável.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
