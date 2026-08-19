"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Clock } from "lucide-react"
import { dayColors, dayNames } from "@/lib/utils"

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string }

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
      <DialogTrigger
        className="h-7 w-7 flex items-center justify-center rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:border-blue-600 dark:text-blue-500 transition-colors flex-shrink-0"
        aria-label={`Manage ${doctorName}'s slots`}
      >
        <Plus className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="w-[950px] sm:max-w-[800px] max-h-[600px] p-6">
        <DialogHeader>
          <DialogTitle><strong>{doctorName}</strong>'s Availability</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-2">
          {/* Left: add/edit form */}
          <div className="space-y-3 pr-6 border-r">
            <div>
              <Label htmlFor="slot-day" className="pb-1">Day<span className="text-red-500">*</span></Label>
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
              <Label htmlFor="slot-start" className="pb-1">Start Time<span className="text-red-500">*</span></Label>
              <Input id="slot-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="slot-end" className="pb-1">End Time<span className="text-red-500">*</span></Label>
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
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!loading && slots.length === 0 && (
              <p className="text-sm text-muted-foreground">No slots added yet.</p>
            )}
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between border rounded-md p-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${dayColors[slot.dayOfWeek]}`}>
                    {dayNames[slot.dayOfWeek]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-muted px-2.5 py-1 rounded-md">
                    <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 rounded-md border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    aria-label="Edit slot"
                    onClick={() => handleEditClick(slot)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      className="h-7 w-7 flex items-center justify-center rounded-md border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      aria-label="Delete slot"
                    >
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