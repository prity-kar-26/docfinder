"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddDoctorModal } from "./AddDoctorModal"
import { Pencil, Menu } from "lucide-react"
import { EditDoctorModal } from "./EditDoctorModal"
import { DoctorAvailabilityDrawer } from "./DoctorAvailabilityDrawer"

type Doctor = {
    id: string
    name: string
    specialty: string
    phone: string
    fee: number
    bio: string | null
    email: string | null
}

export function DoctorsList() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)

    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
    const [availabilityDoctor, setAvailabilityDoctor] = useState<Doctor | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        apiFetch("/center/doctors")
            .then(setDoctors)
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {doctors.map((doctor) => (
                <Card key={doctor.id} className="p-4 h-40 flex flex-col justify-between">
                    <div>
                        <p className="font-semibold">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        <p className="text-sm mt-1">₹{doctor.fee}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button size="icon" variant="ghost" aria-label="Edit doctor" onClick={() => setEditingDoctor(doctor)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label="View availability"
                            onClick={() => {
                                setAvailabilityDoctor(doctor)
                                setDrawerOpen(true)
                            }}
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            ))}

            <AddDoctorModal onAdded={(doctor) => setDoctors((prev) => [...prev, doctor])} />

            <EditDoctorModal
                doctor={editingDoctor}
                open={!!editingDoctor}
                onOpenChange={(o) => !o && setEditingDoctor(null)}
                onUpdated={(updated) => setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
            />

            <DoctorAvailabilityDrawer
                doctorId={availabilityDoctor?.id ?? null}
                doctorName={availabilityDoctor?.name ?? ""}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
        </div>
    )
}