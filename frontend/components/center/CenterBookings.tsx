"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"

type Booking = {
  id: string
  date: string
  timeSlot: string
  patientName: string
  patientPhone: string
  status: "BOOKED" | "CANCELLED"
  paid: boolean
  doctor: { name: string; specialty: string }
}

export function CenterBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (date) params.append("date", date)

    apiFetch(`/center/bookings?${params.toString()}`)
      .then(setBookings)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

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

  const handleTogglePaid = async (id: string) => {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by doctor or patient name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-auto"
        />
        <Button onClick={load} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {!loading && bookings.length === 0 && (
        <NoDataAvailable message="No bookings found." />
      )}

      <div className="grid gap-3">
        {bookings.map((b) => (
          <Card key={b.id} className="p-4 flex items-start justify-between">
            <div>
              <p className="font-medium">{b.patientName}</p>
              <p className="text-sm text-muted-foreground">{b.patientPhone}</p>
              <p className="text-sm mt-1">
                Dr. {b.doctor.name} ({b.doctor.specialty})
              </p>
              <p className="text-sm">
                {new Date(b.date).toDateString()} — {b.timeSlot}
              </p>
              <p className={`text-sm mt-1 font-medium ${b.status === "CANCELLED" ? "text-gray-500" : "text-green-600"}`}>
                {b.status}
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              {b.status !== "CANCELLED" && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={actionLoading === b.id}
                  onClick={() => handleCancel(b.id)}
                >
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                variant={b.paid ? "outline" : "default"}
                disabled={actionLoading === b.id}
                onClick={() => handleTogglePaid(b.id)}
              >
                {b.paid ? "Paid ✓" : "Mark as Paid"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}