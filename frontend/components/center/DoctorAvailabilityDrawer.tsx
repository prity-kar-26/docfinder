"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

type SlotBlock = { id: string; date: string }
type Slot = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotBlocks: SlotBlock[]
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatDateLocal(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function SlotRow({ slot, onSlotUpdate }: { slot: Slot; onSlotUpdate: (slot: Slot) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [toggling, setToggling] = useState(false)
  const [feedback, setFeedback] = useState("")

  const isFullOnSelected = selectedDate
    ? slot.slotBlocks.some((b) => sameDate(new Date(b.date), selectedDate))
    : false

  const handleToggle = async () => {
    if (!selectedDate) return
    setToggling(true)
    setFeedback("")
    try {
      const isoDate = formatDateLocal(selectedDate)
      const result = await apiFetch(`/center/availability/${slot.id}/toggle`, {
        method: "PUT",
        body: JSON.stringify({ date: isoDate }),
      })

      const newBlocks = result.full
        ? [...slot.slotBlocks, { id: `${slot.id}-${isoDate}`, date: isoDate }]
        : slot.slotBlocks.filter((b) => !sameDate(new Date(b.date), selectedDate))

      onSlotUpdate({ ...slot, slotBlocks: newBlocks })
      setFeedback(result.full ? "Marked as Full ✓" : "Marked as Free ✓")
    } catch (err: any) {
      setFeedback(err.message || "Failed to update")
    } finally {
      setToggling(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="flex items-center justify-between border rounded-md p-3">
      <div>
        <p className="text-sm font-medium">{dayNames[slot.dayOfWeek]}</p>
        <p className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
      </div>

      <Popover onOpenChange={() => setFeedback("")}>
        <PopoverTrigger className="p-2 rounded-md hover:bg-muted" aria-label="Manage dates">
          <Clock className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setFeedback("") }}
            disabled={(date) => date.getDay() !== slot.dayOfWeek || date < today}
          />
          {selectedDate && (
            <>
              <Button
                className="w-full mt-2"
                variant={isFullOnSelected ? "outline" : "destructive"}
                disabled={toggling}
                onClick={handleToggle}
              >
                {toggling ? "Updating..." : isFullOnSelected ? "Mark as Free" : "Mark as Full"}
              </Button>
              {feedback && (
                <p className="text-xs text-center mt-1 text-muted-foreground">{feedback}</p>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DoctorAvailabilityDrawer({ doctorId, doctorName, open, onOpenChange }: {
  doctorId: string | null
  doctorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!doctorId || !open) return
    setLoading(true)
    apiFetch(`/center/doctors/${doctorId}/availability`)
      .then(setSlots)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [doctorId, open])

  const updateSlot = (updated: Slot) => {
    setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>{doctorName}'s Availability</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && slots.length === 0 && (
            <p className="text-sm text-muted-foreground">No availability set yet.</p>
          )}
          {slots.map((slot) => (
            <SlotRow key={slot.id} slot={slot} onSlotUpdate={updateSlot} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}