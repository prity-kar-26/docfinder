"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DoctorSelect } from "@/components/shared/DoctorSelect"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string }

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function getMinDateForSlot(slot: Slot): string {
  const now = new Date()
  const currentDay = now.getDay()
  let daysUntil = (slot.dayOfWeek - currentDay + 7) % 7
  const candidate = new Date(now)
  candidate.setDate(now.getDate() + daysUntil)
  const [hours, minutes] = slot.startTime.split(":").map(Number)
  const slotDateTime = new Date(candidate)
  slotDateTime.setHours(hours, minutes, 0, 0)
  const hoursUntil = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (daysUntil === 0 && hoursUntil < 0) candidate.setDate(candidate.getDate() + 7)
  const year = candidate.getFullYear()
  const month = String(candidate.getMonth() + 1).padStart(2, "0")
  const day = String(candidate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function CreateBookingModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [doctorId, setDoctorId] = useState("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotId, setSlotId] = useState("")
  const [date, setDate] = useState("")
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!doctorId) {
      setSlots([])
      setSlotId("")
      return
    }
    apiFetch(`/center/doctors/${doctorId}/availability`)
      .then(setSlots)
      .catch((err) => console.error(err))
  }, [doctorId])

  const selectedSlot = slots.find((s) => s.id === slotId) || null

  const resetForm = () => {
    setDoctorId("")
    setSlots([])
    setSlotId("")
    setDate("")
    setPatientName("")
    setPatientPhone("")
    setError("")
  }

  const handleSubmit = async () => {
    if (!doctorId || !slotId || !date || !patientName.trim() || !patientPhone.trim()) {
      setError("All fields are required")
      return
    }
    if (!selectedSlot) return

    setSaving(true)
    setError("")
    try {
      await apiFetch("/center/bookings", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          date,
          timeSlot: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
          patientName,
          patientPhone,
        }),
      })
      resetForm()
      setOpen(false)
      onCreated()
    } catch (err: any) {
      setError(err.message || "Failed to create booking")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs border border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
        <Plus className="h-4 w-4" />
        Create New Booking
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block">Doctor</Label>
            <DoctorSelect value={doctorId} onChange={setDoctorId} className="w-full" />
          </div>

          {doctorId && (
            <div>
              <Label htmlFor="slot-picker" className="mb-1 block">Time Slot</Label>
              <select
                id="slot-picker"
                value={slotId}
                onChange={(e) => { setSlotId(e.target.value); setDate("") }}
                className="w-full border rounded-md h-9 px-2 bg-background text-sm"
              >
                <option value="">Select a slot</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {dayNames[s.dayOfWeek]} — {s.startTime} to {s.endTime}
                  </option>
                ))}
              </select>
              {doctorId && slots.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">This doctor has no availability slots set up yet.</p>
              )}
            </div>
          )}

          {selectedSlot && (
            <div>
              <Label htmlFor="booking-date" className="mb-1 block">Date</Label>
              <Input
                id="booking-date"
                type="date"
                value={date}
                min={getMinDateForSlot(selectedSlot)}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="patient-name" className="mb-1 block">Patient Name</Label>
            <Input id="patient-name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="patient-phone" className="mb-1 block">Patient Phone Number</Label>
            <Input id="patient-phone" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}