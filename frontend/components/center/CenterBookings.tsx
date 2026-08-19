"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DoctorSelect } from "@/components/shared/DoctorSelect"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
import { UserRound, Clock, Phone } from "lucide-react"

type Booking = {
  id: string
  date: string
  timeSlot: string
  patientName: string
  patientPhone: string
  status: "BOOKED" | "CANCELLED"
  paid: boolean
  doctor: { id: string; name: string; specialty: string }
}

function todayISO(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function hasSlotPassed(dateStr: string, timeSlot: string): boolean {
  const [startTime] = timeSlot.split("-")
  const [hours, minutes] = startTime.split(":").map(Number)
  const slotDateTime = new Date(dateStr)
  slotDateTime.setHours(hours, minutes, 0, 0)
  return slotDateTime.getTime() < Date.now()
}

export function CenterBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [date, setDate] = useState(todayISO())
  const [doctorId, setDoctorId] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (date) params.append("date", date)
    if (doctorId) params.append("doctorId", doctorId)

    apiFetch(`/center/bookings?${params.toString()}`)
      .then(setBookings)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClearFilters = () => {
    setSearch("")
    setDoctorId("")
    setTimeout(load, 0)
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return
    setActionLoading(id)
    try {
      await apiFetch(`/center/bookings/${id}/cancel`, { method: "PUT" })
      load()
    } catch (err: any) {
      alert(err.message || "Failed to cancel")
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id)
    try {
      await apiFetch(`/center/bookings/${id}/paid`, { method: "PUT" })
      load()
    } catch (err: any) {
      alert(err.message || "Failed to update payment status")
    } finally {
      setActionLoading(null)
    }
  }

  const hasActiveFilter = search || doctorId

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 space-y-3 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by doctor or patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />

          <DoctorSelect value={doctorId} onChange={setDoctorId} />

          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />

          <Button onClick={load} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>

          {hasActiveFilter && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {!loading && bookings.length === 0 && (
          <div className="h-full">
            <NoDataAvailable message="No bookings found." />
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="grid gap-3">
            {bookings.map((b) => {
              const canCancel = b.status === "BOOKED" && !b.paid && !hasSlotPassed(b.date, b.timeSlot)

              return (
                <Card key={b.id} className="p-3 flex flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserRound className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight truncate">{b.patientName}</p>
                      <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple mt-0.5">
                        <Phone className="h-3 w-3 text-purple-600 dark:text-purple" />
                        {b.patientPhone}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mt-0.5 truncate">
                        {b.doctor.name} - {b.doctor.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                          {formatDate(b.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-muted px-2.5 py-1 rounded-md">
                          <Clock className="h-3 w-3" />
                          {b.timeSlot}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex gap-1.5">
                      <Badge className={b.status === "CANCELLED" ? "bg-red-500 hover:bg-red-500" : "bg-teal-600 hover:bg-teal-600"}>
                        {b.status === "CANCELLED" ? "Cancelled" : "Booked"}
                      </Badge>
                      <Badge className={b.paid ? "bg-green-600 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-500"}>
                        {b.paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                    <div className="flex gap-1.5">
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          disabled={actionLoading === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                      {!b.paid && b.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          disabled={actionLoading === b.id}
                          onClick={() => handleMarkPaid(b.id)}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}