"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { CalendarCheck, CalendarDays, Clock } from "lucide-react"

type Booking = {
  id: string
  date: string
  timeSlot: string
  status: "BOOKED" | "CANCELLED"
  paid: boolean
  doctor: {
    name: string
    specialty: string
    center: { user: { name: string } }
  }
}

function hasSlotPassed(dateStr: string, timeSlot: string): boolean {
  const [startTime] = timeSlot.split("-")
  const [hours, minutes] = startTime.split(":").map(Number)
  const slotDateTime = new Date(dateStr)
  slotDateTime.setHours(hours, minutes, 0, 0)
  return slotDateTime.getTime() < Date.now()
}

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = () => {
    apiFetch("/bookings")
      .then(setBookings)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleCancel = async (id: string) => {
    setActionLoading(id)
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: "PUT" })
      load()
    } catch (err: any) {
      alert(err.message || "Failed to cancel")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <p>Loading...</p>
  if (bookings.length === 0) return <NoDataAvailable message="No data available." />

  return (
    <div className="grid gap-3">
      {bookings.map((b) => {
        const canCancel = b.status === "BOOKED" && !b.paid && !hasSlotPassed(b.date, b.timeSlot)
        // const isPast = hasSlotPassed(b.date, b.timeSlot)

        return (
          <Card key={b.id} className="p-4 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold leading-tight">{b.doctor.name}</p>
                <p className="text-sm text-muted-foreground">{b.doctor.specialty} · {b.doctor.center.user.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(b.date)}
                  </span>
                  <span className="flex items-center gap-1 text-purple-500 dark:text-purple-500">
                    <Clock className="h-3.5 w-3.5" />
                    {b.timeSlot}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <Badge variant={b.status === "CANCELLED" ? "outline" : "default"}>
                  {b.status === "CANCELLED" ? "Cancelled" : "Booked"}
                </Badge>
                <Badge className={b.paid ? "bg-green-600 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-500"}>
                  {b.paid ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger
                    className="text-xs text-red-500 border border-red-500/60 bg-transparent hover:bg-red-500/10 px-2 py-1 rounded-full transition-colors disabled:opacity-50"
                    disabled={actionLoading === b.id}
                  >
                    Cancel Booking
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your appointment with <span className="font-semibold text-foreground">{b.doctor.name}</span> on{" "}
                        <span className="font-semibold text-foreground">{formatDate(b.date)}</span> at {b.timeSlot} will be cancelled. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCancel(b.id)}>
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {/* {isPast && (
                <p className="text-xs text-muted-foreground">This slot has passed.</p>
              )} */}
            </div>
          </Card>
        )
      })}
    </div>
  )
}