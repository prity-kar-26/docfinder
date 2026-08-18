"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string }

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function AvailabilitySlotModal({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const [open, setOpen] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  const [dayOfWeek, setDayOfWeek] = useState("1")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiFetch(`/center/doctors/${doctorId}/availability`)
      .then(setSlots)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  const resetForm = () => {
    setDayOfWeek("1")
    setStartTime("")
    setEndTime("")
    setEditingId(null)
    setError("")
  }

  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      setError("Start and end time are required")
      return
    }
    if (endTime <= startTime) {
      setError("End time must be after start time")
      return
    }

    setSaving(true)
    setError("")
    try {
      if (editingId) {
        await apiFetch(`/center/availability/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ dayOfWeek: Number(dayOfWeek), startTime, endTime }),
        })
      } else {
        await apiFetch(`/center/doctors/${doctorId}/availability`, {
          method: "POST",
          body: JSON.stringify({ dayOfWeek: Number(dayOfWeek), startTime, endTime }),
        })
      }
      resetForm()
      load()
    } catch (err: any) {
      setError(err.message || "Failed to save slot")
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = (slot: Slot) => {
    setEditingId(slot.id)
    setDayOfWeek(String(slot.dayOfWeek))
    setStartTime(slot.startTime)
    setEndTime(slot.endTime)
    setError("")
  }

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/center/availability/${id}`, { method: "DELETE" })
      load()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger className="p-2 rounded-md hover:bg-muted" aria-label={`Manage ${doctorName}'s slots`}>
        <Plus className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{doctorName}'s Availability</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-2">
          {/* Left: add/edit form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="slot-day">Day</Label>
              <select
                id="slot-day"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full border rounded-md h-9 px-2 bg-background"
              >
                {dayNames.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="slot-start">Start Time</Label>
              <Input id="slot-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="slot-end">End Time</Label>
              <Input id="slot-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleSubmit} disabled={saving} className="w-full">
              {saving ? "Saving..." : editingId ? "Update Slot" : "Add Slot"}
            </Button>
            {editingId && (
              <Button variant="outline" className="w-full" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>

          {/* Right: existing slots */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!loading && slots.length === 0 && (
              <p className="text-sm text-muted-foreground">No slots added yet.</p>
            )}
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between border rounded-md p-2 text-sm">
                <span>{dayNames[slot.dayOfWeek]} — {slot.startTime} to {slot.endTime}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" aria-label="Edit slot" onClick={() => handleEditClick(slot)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger className="p-2 rounded-md hover:bg-muted text-red-500" aria-label="Delete slot">
                      <Trash2 className="h-3.5 w-3.5" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this slot?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(slot.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}