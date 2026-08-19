"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type DoctorOption = { id: string; name: string; specialty: string }

export function DoctorSelect({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (doctorId: string) => void
  className?: string
}) {
  const [doctors, setDoctors] = useState<DoctorOption[]>([])

  useEffect(() => {
    apiFetch("/center/doctors")
      .then(setDoctors)
      .catch((err) => console.error(err))
  }, [])

  const getLabel = (val: string | null) => {
    if (!val || val === "all") return "All Doctors"
    const doc = doctors.find((d) => d.id === val)
    return doc ? `${doc.name} (${doc.specialty})` : "All Doctors"
  }

  return (
    <Select value={value || "all"} onValueChange={(v) => onChange(!v || v === "all" ? "" : v)}>
      <SelectTrigger className={className ?? "w-[220px]"}>
        <SelectValue placeholder="All Doctors">
          {(val: string | null) => getLabel(val)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Doctors</SelectItem>
        {doctors.map((d) => (
          <SelectItem key={d.id} value={d.id}>
            {d.name} ({d.specialty})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}