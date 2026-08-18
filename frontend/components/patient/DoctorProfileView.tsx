"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserRound, CalendarDays, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Label } from "../ui/label"
import { NoDataAvailable } from "../shared/NoDataAvailable"

type SlotBlock = { id: string; date: string }
type Availability = { id: string; dayOfWeek: number; startTime: string; endTime: string; slotBlocks: SlotBlock[] }
type DoctorDetail = {
  id: string
  name: string
  specialty: string
  fee: number
  bio: string | null
  center: { city: string | null; clinicAddress: string | null; user: { name: string } }
  availability: Availability[]
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const dayColors = [
  "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
]

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getMinDateForSlot(slot: Availability): string {
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

export function DoctorProfileView({ doctorId }: { doctorId: string }) {
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [openSlotId, setOpenSlotId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [booking, setBooking] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    apiFetch(`/doctors/${doctorId}`)
      .then(setDoctor)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [doctorId])

  if (loading) return <p>Loading...</p>
  if (!doctor) return <p>Doctor not found.</p>

  const handleBookClick = (slotId: string) => {
    setOpenSlotId(openSlotId === slotId ? null : slotId)
    setSelectedDate("")
    setMessage(null)
  }

  const isDateFull = (slot: Availability, dateStr: string) => {
    if (!dateStr) return false
    const picked = new Date(dateStr)
    return slot.slotBlocks.some((b) => sameDate(new Date(b.date), picked))
  }

  const handleConfirm = async (slot: Availability) => {
    if (!selectedDate || !patientName.trim() || !patientPhone.trim()) {
      setMessage({ type: "error", text: "Please fill in date, name, and phone number" })
      return
    }
    setBooking(true)
    setMessage(null)
    try {
      await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          doctorId: doctor.id,
          date: selectedDate,
          timeSlot: `${slot.startTime}-${slot.endTime}`,
          patientName,
          patientPhone,
        }),
      })
      setMessage({ type: "success", text: "Booking confirmed!" })
      setOpenSlotId(null)
      setPatientName("")
      setPatientPhone("")
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to book." })
    } finally {
      setBooking(false)
    }
  }

  return (
    // <div className="space-y-6 max-w-3xl mx-auto">
    <div className="space-y-6">
      {/* Doctor header card */}
      <Card className="p-5 flex flex-row items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <UserRound className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold leading-tight">{doctor.name}</h1>
            <Badge className="text-base px-4 py-1.5 bg-blue-600 text-primary-foreground flex-shrink-0">
              ₹{doctor.fee}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            <p className="text-sm text-muted-foreground">{doctor.center.user.name}</p>
          </div>
        </div>
      </Card>

      {/* Availability */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Available Slots
        </h2>

        {doctor.availability.length === 0 && (
          // <Card className="p-6 text-center text-sm text-muted-foreground">
          //   No availability set yet.
          // </Card>
          <NoDataAvailable message="No availability set yet." />
        )}

        <div className="grid gap-3">
          {doctor.availability.map((slot) => {
            const full = isDateFull(slot, selectedDate)
            const isOpen = openSlotId === slot.id

            return (
              <Card key={slot.id} className={`p-4 transition-colors`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${dayColors[slot.dayOfWeek]}`}>
                      {dayNames[slot.dayOfWeek]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-muted px-2.5 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                  <Button size="sm" variant={isOpen ? "outline" : "default"} onClick={() => handleBookClick(slot.id)}>
                    {isOpen ? "Close" : "Book"}
                  </Button>
                </div>

                {isOpen && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3 items-end">
                      <div className="flex-1 min-w-[160px]">
                        <Label htmlFor={`date-${slot.id}`} className="text-xs text-muted-foreground mb-1 block">Booking Date <span className="text-red-500">*</span></Label>
                        <Input
                          id={`date-${slot.id}`}
                          type="date"
                          value={selectedDate}
                          min={getMinDateForSlot(slot)}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <Label htmlFor={`name-${slot.id}`} className="text-xs text-muted-foreground mb-1 block">Patient Name <span className="text-red-500">*</span></Label>
                        <Input
                          id={`name-${slot.id}`}
                          placeholder="Full name"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <Label htmlFor={`phone-${slot.id}`} className="text-xs text-muted-foreground mb-1 block">Contact Number <span className="text-red-500">*</span></Label>
                        <Input
                          id={`phone-${slot.id}`}
                          placeholder="10-digit number"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                        />
                      </div>
                      <Button onClick={() => handleConfirm(slot)} disabled={booking || full}>
                        {booking ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </div>
                    {full && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        This slot is full on {formatDate(selectedDate)}. Please choose a different date.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {message && (
        <Card className={`p-3 flex items-center gap-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </Card>
      )}
    </div>
  )
}