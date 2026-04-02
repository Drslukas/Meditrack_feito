export interface Medication {
  id: string
  name: string
  dosage: string
  timesPerDay: number
  times: string[]
  fasting: boolean
  instructions?: string
}

export interface MedicationLog {
  date: string // YYYY-MM-DD
  medicationId: string
  time: string
  taken: boolean
  takenAt?: string
}

export interface Patient {
  id: string
  name: string
  cpf: string
  birthDate: string
  phone?: string
  avatar?: string
  medications: Medication[]
  logs: MedicationLog[]
}

export interface Doctor {
  id: string
  name: string
  email: string
  password: string
  crm: string
  specialty: string
  patients: string[] // patient IDs
}

// Helper to generate adherence logs for a patient
function generateLogs(
  medications: Medication[],
  daysBack: number
): MedicationLog[] {
  const logs: MedicationLog[] = []
  const today = new Date()

  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    for (const med of medications) {
      for (const time of med.times) {
        // Simulate realistic adherence: ~85% taken
        const rand = Math.random()
        const taken = i === 0 ? false : rand < 0.85
        logs.push({
          date: dateStr,
          medicationId: med.id,
          time,
          taken,
          takenAt: taken
            ? `${dateStr}T${time.replace(":", "")}${String(Math.floor(Math.random() * 30)).padStart(2, "0")}`
            : undefined,
        })
      }
    }
  }
  return logs
}

const medicationsCarla: Medication[] = [
  {
    id: "med-1",
    name: "Losartana",
    dosage: "50mg",
    timesPerDay: 2,
    times: ["08:00", "20:00"],
    fasting: false,
    instructions: "Tomar com agua",
  },
  {
    id: "med-2",
    name: "Metformina",
    dosage: "850mg",
    timesPerDay: 2,
    times: ["07:00", "19:00"],
    fasting: false,
    instructions: "Tomar apos as refeicoes",
  },
  {
    id: "med-3",
    name: "Sinvastatina",
    dosage: "20mg",
    timesPerDay: 1,
    times: ["22:00"],
    fasting: false,
    instructions: "Tomar antes de dormir",
  },
]

const medicationsJoao: Medication[] = [
  {
    id: "med-4",
    name: "Omeprazol",
    dosage: "20mg",
    timesPerDay: 1,
    times: ["07:00"],
    fasting: true,
    instructions: "Tomar em jejum 30 min antes do cafe",
  },
  {
    id: "med-5",
    name: "Atenolol",
    dosage: "25mg",
    timesPerDay: 1,
    times: ["08:00"],
    fasting: false,
  },
]

const medicationsMaria: Medication[] = [
  {
    id: "med-6",
    name: "Levotiroxina",
    dosage: "75mcg",
    timesPerDay: 1,
    times: ["06:00"],
    fasting: true,
    instructions: "Em jejum, esperar 30 min para comer",
  },
  {
    id: "med-7",
    name: "Rivotril",
    dosage: "0,5mg",
    timesPerDay: 1,
    times: ["22:00"],
    fasting: false,
    instructions: "Tomar antes de dormir",
  },
  {
    id: "med-8",
    name: "Citalopram",
    dosage: "20mg",
    timesPerDay: 1,
    times: ["08:00"],
    fasting: false,
  },
]

const medicationsAna: Medication[] = [
  {
    id: "med-9",
    name: "Insulina NPH",
    dosage: "20UI",
    timesPerDay: 2,
    times: ["07:00", "21:00"],
    fasting: false,
    instructions: "Aplicar subcutaneo",
  },
  {
    id: "med-10",
    name: "Glibenclamida",
    dosage: "5mg",
    timesPerDay: 2,
    times: ["07:30", "19:30"],
    fasting: false,
    instructions: "Tomar antes das refeicoes",
  },
]

const medicationsCarlos: Medication[] = [
  {
    id: "med-11",
    name: "Aspirina",
    dosage: "100mg",
    timesPerDay: 1,
    times: ["12:00"],
    fasting: false,
    instructions: "Tomar apos o almoco",
  },
  {
    id: "med-12",
    name: "Enalapril",
    dosage: "10mg",
    timesPerDay: 2,
    times: ["08:00", "20:00"],
    fasting: false,
  },
  {
    id: "med-13",
    name: "Furosemida",
    dosage: "40mg",
    timesPerDay: 1,
    times: ["08:00"],
    fasting: false,
    instructions: "Tomar pela manha",
  },
]

export const patients: Patient[] = [
  {
    id: "p-1",
    name: "Carla Mendes",
    cpf: "123.456.789-01",
    birthDate: "1961-10-12", // YYYY-MM-DD
    phone: "(11) 98765-4321", // opcional
    medications: medicationsCarla,
    logs: generateLogs(medicationsCarla, 180),
  },
  {
    id: "p-2",
    name: "Joao Silva",
    cpf: "234.567.890-12",
    birthDate: "1978-05-15",
    phone: "(11) 91234-5678",
    medications: medicationsJoao,
    logs: generateLogs(medicationsJoao, 180),
  },
  {
    id: "p-3",
    name: "Maria Oliveira",
    cpf: "345.678.901-23",
    birthDate: "1968-08-20",
    phone: "(21) 99876-5432",
    medications: medicationsMaria,
    logs: generateLogs(medicationsMaria, 180),
  },
  {
    id: "p-4",
    name: "Ana Costa",
    cpf: "456.789.012-34",
    birthDate: "1955-03-10",
    phone: "(31) 98765-1234",
    medications: medicationsAna,
    logs: generateLogs(medicationsAna, 180),
  },
  {
    id: "p-5",
    name: "Carlos Ferreira",
    phone: "(41) 91234-8765",
    cpf: "567.890.123-45",
    birthDate: "1955-03-10",
    medications: medicationsCarlos,
    logs: generateLogs(medicationsCarlos, 180),
  },
]

export const doctors: Doctor[] = [
  {
    id: "d-1",
    name: "Dr. Ricardo Santos",
    email: "ricardo.santos@clinica.com",
    password: "senha123",
    crm: "CRM/SP 123456",
    specialty: "Cardiologia",
    patients: ["p-1", "p-2", "p-3", "p-4", "p-5"],
  },
]

// Utility functions
export function calculatePatientAdherence(patient: Patient): number {
  return getOverallAdherence(patient.logs)
}

export function getAdherenceForDate(
  logs: MedicationLog[],
  date: string
): { total: number; taken: number; percentage: number } {
  const dayLogs = logs.filter((l) => l.date === date)
  const total = dayLogs.length
  const taken = dayLogs.filter((l) => l.taken).length
  return {
    total,
    taken,
    percentage: total > 0 ? Math.round((taken / total) * 100) : 0,
  }
}

export function getOverallAdherence(
  logs: MedicationLog[]
): number {
  const pastLogs = logs.filter((l) => {
    const today = new Date().toISOString().split("T")[0]
    return l.date < today
  })
  if (pastLogs.length === 0) return 0
  const taken = pastLogs.filter((l) => l.taken).length
  return Math.round((taken / pastLogs.length) * 100)
}

export function getStreak(logs: MedicationLog[]): number {
  const today = new Date()
  let streak = 0

  for (let i = 1; i <= 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const dayLogs = logs.filter((l) => l.date === dateStr)

    if (dayLogs.length === 0) break
    const allTaken = dayLogs.every((l) => l.taken)
    if (!allTaken) break
    streak++
  }

  return streak
}

export function getWeeklyAdherence(
  logs: MedicationLog[]
): { day: string; percentage: number }[] {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
  const today = new Date()
  const result = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const adherence = getAdherenceForDate(logs, dateStr)
    result.push({
      day: days[date.getDay()],
      percentage: adherence.percentage,
    })
  }

  return result
}

export function getMonthlyAdherence(
  logs: MedicationLog[]
): { date: string; percentage: number }[] {
  const today = new Date()
  const result = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const adherence = getAdherenceForDate(logs, dateStr)
    result.push({
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      percentage: adherence.percentage,
    })
  }

  return result
}
