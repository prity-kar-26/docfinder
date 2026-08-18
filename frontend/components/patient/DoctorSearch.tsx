"use client"

import { useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
import { Stethoscope } from "lucide-react"

type Doctor = {
    id: string
    name: string
    specialty: string
    fee: number
    bio: string
    center: {
        city: string | null
        clinicAddress: string | null
        user: { name: string }
    }
}

export function DoctorSearch() {
    const [doctorName, setDoctorName] = useState("")
    const [centerName, setCenterName] = useState("")
    const [specialty, setSpecialty] = useState("")
    const [city, setCity] = useState("")
    const [date, setDate] = useState("")
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (doctorName) params.append("doctorName", doctorName)
            if (centerName) params.append("centerName", centerName)
            if (specialty) params.append("specialty", specialty)
            if (city) params.append("city", city)
            if (date) params.append("date", date)

            const data = await apiFetch(`/doctors/search?${params.toString()}`)
            setDoctors(data)
            setHasSearched(true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleClearFilters = () => {
        setDoctorName("")
        setCenterName("")
        setSpecialty("")
        setCity("")
        setDate("")
        setDoctors([])
        setHasSearched(false)
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 space-y-3 pb-4 w-full">
                <div className="flex flex-wrap items-center gap-3 w-full">
                    <Input placeholder="Doctor name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="flex-1 min-w-[160px]" />
                    <Input placeholder="Center name" value={centerName} onChange={(e) => setCenterName(e.target.value)} className="flex-1 min-w-[160px]" />
                    <Input placeholder="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="flex-1 min-w-[160px]" />
                    <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="flex-1 min-w-[140px]" />
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </Button>
                    {(doctorName || centerName || specialty || city || date) && (
                        <Button variant="outline" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1">
                {!hasSearched && (
                    <div className="h-full">
                        <NoDataAvailable message="Search doctors to see the doctor list according to your need" />
                    </div>
                )}

                {hasSearched && doctors.length === 0 && (
                    <div className="h-full">
                        <NoDataAvailable message="No data available." />
                    </div>
                )}

                {hasSearched && doctors.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <p className="text-muted-foreground">
                                {!specialty && <><strong>Tip:</strong> add a specialty to narrow down your results.</>}
                            </p>
                            <p className="text-red-500">*Click on a card to book the doctor.</p>
                        </div>
                        <div className="grid gap-3">
                            {doctors.map((doctor) => (
                                <Link key={doctor.id} href={`/patient/dashboard/doctors/${doctor.id}`}>
                                    <Card className="p-3 flex flex-row items-center gap-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Stethoscope className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold leading-tight">{doctor.name}</h3>
                                                <Badge variant="destructive" className="text-base px-3 py-1">₹{doctor.fee}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{doctor.specialty} - {doctor.bio}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {doctor.center.user.name} - {doctor.center.city}
                                            </p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}