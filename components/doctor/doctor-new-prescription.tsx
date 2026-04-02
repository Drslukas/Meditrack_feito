"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2, Clock, Pill, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

// Tipo simples de paciente (vem do GET /patients/doctor/:id)
interface PatientSimple {
    id: number
    name: string
    cpf: string
    birth_date: string
    phone: string
}

interface MedicationSchedule {
    scheduled_time: string
}

interface MedicationForm {
    id: string // apenas para controle local
    name: string
    dosage: string
    indication: string
    notes: string
    start_date: string
    end_date: string
    schedules: MedicationSchedule[]
}

interface DoctorNewPrescriptionProps {
    patients: PatientSimple[]
    onBack: () => void
    onPrescriptionCreated: () => void
}

function createEmptyMedication(): MedicationForm {
    return {
        id: crypto.randomUUID(),
        name: "",
        dosage: "",
        indication: "",
        notes: "",
        start_date: "",
        end_date: "",
        schedules: [{ scheduled_time: "" }],
    }
}

export function DoctorNewPrescription({
    patients,
    onBack,
    onPrescriptionCreated,
}: DoctorNewPrescriptionProps) {
    const { user, token } = useAuth()
    const [patientId, setPatientId] = useState<string>("")
    const [prescriptionNotes, setPrescriptionNotes] = useState("")
    const [medications, setMedications] = useState<MedicationForm[]>([createEmptyMedication()])
    const [collapsedMeds, setCollapsedMeds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)

    // ── Medicamento ──────────────────────────────────────────────
    function updateMedication(id: string, field: keyof MedicationForm, value: string) {
        setMedications((prev) =>
            prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        )
    }

    function addMedication() {
        setMedications((prev) => [...prev, createEmptyMedication()])
    }

    function removeMedication(id: string) {
        if (medications.length === 1) {
            toast.error("A prescrição deve ter ao menos um medicamento")
            return
        }
        setMedications((prev) => prev.filter((m) => m.id !== id))
        setCollapsedMeds((prev) => { prev.delete(id); return new Set(prev) })
    }

    function toggleCollapse(id: string) {
        setCollapsedMeds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    // ── Horários ─────────────────────────────────────────────────
    function addSchedule(medId: string) {
        setMedications((prev) =>
            prev.map((m) =>
                m.id === medId
                    ? { ...m, schedules: [...m.schedules, { scheduled_time: "" }] }
                    : m
            )
        )
    }

    function updateSchedule(medId: string, index: number, value: string) {
        setMedications((prev) =>
            prev.map((m) => {
                if (m.id !== medId) return m
                const schedules = [...m.schedules]
                schedules[index] = { scheduled_time: value }
                return { ...m, schedules }
            })
        )
    }

    function removeSchedule(medId: string, index: number) {
        setMedications((prev) =>
            prev.map((m) => {
                if (m.id !== medId) return m
                if (m.schedules.length === 1) {
                    toast.error("O medicamento deve ter ao menos um horário")
                    return m
                }
                const schedules = m.schedules.filter((_, i) => i !== index)
                return { ...m, schedules }
            })
        )
    }

    // ── Submit ────────────────────────────────────────────────────
    async function handleSubmit() {
        if (!patientId) {
            toast.error("Selecione um paciente")
            return
        }

        for (const med of medications) {
            if (!med.name || !med.dosage || !med.start_date || !med.end_date) {
                toast.error(`Preencha todos os campos obrigatórios do medicamento "${med.name || "sem nome"}"`)
                return
            }
            if (med.end_date < med.start_date) {
                toast.error(`A data de fim não pode ser anterior à de início em "${med.name}"`)
                return
            }
            for (const s of med.schedules) {
                if (!s.scheduled_time) {
                    toast.error(`Preencha todos os horários do medicamento "${med.name}"`)
                    return
                }
            }
        }

        setLoading(true)
        try {
            const body = {
                doctor_id: user?.user_id,
                patient_id: parseInt(patientId),
                notes: prescriptionNotes || null,
                medications: medications.map(({ id, ...med }) => med),
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prescriptions/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.detail || "Erro ao criar prescrição")
                return
            }

            toast.success("Prescrição criada com sucesso!")
            onPrescriptionCreated()
        } catch (err) {
            console.error(err)
            toast.error("Erro ao criar prescrição")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Nova Prescrição</h1>
                    <p className="text-muted-foreground">Defina os medicamentos e horários do tratamento</p>
                </div>
            </div>

            {/* Paciente */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Dados da Prescrição
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Paciente <span className="text-destructive">*</span></Label>
                        <Select value={patientId} onValueChange={setPatientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o paciente..." />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.length === 0 ? (
                                    <SelectItem value="__empty__" disabled>
                                        Nenhum paciente cadastrado
                                    </SelectItem>
                                ) : (
                                    patients.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Observações gerais</Label>
                        <Textarea
                            placeholder="Instruções gerais da prescrição (opcional)"
                            value={prescriptionNotes}
                            onChange={(e) => setPrescriptionNotes(e.target.value)}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Medicamentos */}
            <div className="space-y-4">
                {medications.map((med, medIndex) => {
                    const isCollapsed = collapsedMeds.has(med.id)
                    return (
                        <Card key={med.id} className="border-border">
                            {/* Cabeçalho do medicamento */}
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Pill className="w-4 h-4 text-primary" />
                                        {med.name
                                            ? `${med.name}${med.dosage ? ` — ${med.dosage}` : ""}`
                                            : `Medicamento ${medIndex + 1}`}
                                    </CardTitle>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground"
                                            onClick={() => toggleCollapse(med.id)}
                                        >
                                            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeMedication(med.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {!isCollapsed && (
                                <CardContent className="space-y-4">
                                    {/* Nome + Dosagem */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nome do medicamento <span className="text-destructive">*</span></Label>
                                            <Input
                                                placeholder="Ex: Metformina"
                                                value={med.name}
                                                onChange={(e) => updateMedication(med.id, "name", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dosagem <span className="text-destructive">*</span></Label>
                                            <Input
                                                placeholder="Ex: 850mg"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Período */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Data de início <span className="text-destructive">*</span></Label>
                                            <Input
                                                type="date"
                                                value={med.start_date}
                                                onChange={(e) => updateMedication(med.id, "start_date", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data de fim <span className="text-destructive">*</span></Label>
                                            <Input
                                                type="date"
                                                value={med.end_date}
                                                min={med.start_date}
                                                onChange={(e) => updateMedication(med.id, "end_date", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Indicação + Observações */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Indicação de uso</Label>
                                            <Input
                                                placeholder="Ex: Em jejum, com água"
                                                value={med.indication}
                                                onChange={(e) => updateMedication(med.id, "indication", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Observações</Label>
                                            <Input
                                                placeholder="Ex: Evitar com álcool"
                                                value={med.notes}
                                                onChange={(e) => updateMedication(med.id, "notes", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Horários */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            Horários <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {med.schedules.map((schedule, schedIndex) => (
                                                <div key={schedIndex} className="flex items-center gap-1">
                                                    <Input
                                                        type="time"
                                                        value={schedule.scheduled_time}
                                                        onChange={(e) => updateSchedule(med.id, schedIndex, e.target.value)}
                                                        className="w-32"
                                                    />
                                                    {med.schedules.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                            onClick={() => removeSchedule(med.id, schedIndex)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1 h-9 text-primary border-primary/30 hover:bg-primary/5"
                                                onClick={() => addSchedule(med.id)}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Horário
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )
                })}

                {/* Botão adicionar medicamento */}
                <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed text-muted-foreground hover:text-foreground"
                    onClick={addMedication}
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Medicamento
                </Button>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pb-8">
                <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Prescrição"}
                </Button>
                <Button variant="outline" onClick={onBack}>
                    Cancelar
                </Button>
            </div>
        </div>
    )
}