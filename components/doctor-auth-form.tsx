"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export function DoctorAuthForm({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { loginAsDoctor } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const success = await loginAsDoctor(email, password)
      if (!success) {
        setError("Email ou senha incorretos")
      }
    } catch (err) {
      console.error(err)
      setError("Ocorreu um erro ao tentar fazer login")
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
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              {mode === "login" ? "Entrar como Médico" : "Cadastro de Médico"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === "login"
                ? "Acesse para monitorar seus pacientes"
                : "Crie sua conta profissional"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="doc-email" className="text-foreground">E-mail profissional</Label>
                <Input
                  id="doc-email"
                  type="email"
                  placeholder="seu@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="doc-password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="doc-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button type="submit" className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Entrar
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-2">
                Não tem conta?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setMode("register")}
                >
                  Cadastre-se
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}