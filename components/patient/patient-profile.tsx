"use client"

import { useEffect, useState } from "react"
import { Phone, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Patient = {
  name: string
  cpf: string
  phone: string
  birth_date: string
}

function calculateAge(birth: string) {
  const today = new Date()
  const birthDate = new Date(birth)

  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function PatientProfile({ userId }: { userId: number }) {

  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile/${userId}`)
      const data = await res.json()
      setPatient(data)
    }

    loadProfile()
  }, [userId])

  if (!patient) return <div>Carregando...</div>

  const age = calculateAge(patient.birth_date)

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p>Suas informações pessoais.</p>
      </div>

      <Card className="max-w-lg">

        <CardHeader>
          <div className="flex items-center gap-4">

            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <User className="w-8 h-8 text-primary" />
            </div>

            <div>
              <CardTitle>{patient.name}</CardTitle>
              <p>{age} anos</p>
            </div>

          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">

          <div>
            <strong>CPF:</strong> {patient.cpf}
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {patient.phone}
          </div>

        </CardContent>

      </Card>

    </div>
  )
}