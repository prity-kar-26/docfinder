"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
import { AvailabilitySlotModal } from "./AvailabilitySlotModal"

type Doctor = { id: string; name: string; specialty: string }

export function DoctorsAvailabilityList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch("/center/doctors")
      .then(setDoctors)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (doctors.length === 0) return <NoDataAvailable message="No doctors listed yet. Add a doctor first." />

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {doctors.map((doctor) => (
        <Card key={doctor.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
          </div>
          <AvailabilitySlotModal doctorId={doctor.id} doctorName={doctor.name} />
        </Card>
      ))}
    </div>
  )
}