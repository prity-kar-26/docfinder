"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AddDoctorModal } from "./AddDoctorModal"
import { EditDoctorModal } from "./EditDoctorModal"
import { DoctorAvailabilityDrawer } from "./DoctorAvailabilityDrawer"
import { Pencil, Menu, Phone, Search } from "lucide-react"

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
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        apiFetch("/center/doctors")
            .then(setDoctors)
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>

    const filteredDoctors = doctors.filter((doctor) => {
        const query = searchQuery.toLowerCase()
        return (
            doctor.name.toLowerCase().includes(query) ||
            doctor.specialty.toLowerCase().includes(query)
        )
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name or specialty..."
                    className="pl-8 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Existing Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <AddDoctorModal onAdded={(doctor) => setDoctors((prev) => [...prev, doctor])} />
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                        <Card
                            key={doctor.id}
                            className="p-4 flex flex-row items-start justify-between gap-2 hover:shadow-sm hover:border-primary/40 transition-all"
                        >
                            <div className="min-w-0">
                                <p className="font-semibold leading-tight truncate text-sm">{doctor.name}</p>
                                <p className="text-sm text-muted-foreground truncate mt-1">{doctor.specialty}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs text-purple-600 dark:text-purple-400">{doctor.phone}</span>
                                </div>
                                <Badge className="mt-1.5 bg-blue-600 hover:bg-blue-600 text-xs">₹{doctor.fee}</Badge>
                            </div>

                            <div className="flex flex-row gap-1.5 flex-shrink-0">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 dark:border-green-600 dark:text-green-500 rounded-md"
                                    aria-label="Edit doctor"
                                    onClick={() => setEditingDoctor(doctor)}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 dark:border-amber-600 dark:text-amber-500 rounded-md"
                                    aria-label="View availability"
                                    onClick={() => {
                                        setAvailabilityDoctor(doctor)
                                        setDrawerOpen(true)
                                    }}
                                >
                                    <Menu className="h-3 w-3" />
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground col-span-full">
                        No doctors found matching "<span className="font-bold text-foreground">{searchQuery}</span>".
                    </p>
                )}

                {/* <AddDoctorModal onAdded={(doctor) => setDoctors((prev) => [...prev, doctor])} /> */}

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
        </div>
    )
}