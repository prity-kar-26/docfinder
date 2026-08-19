"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { dayColors, dayNames, formatDate } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { NoDataAvailable } from "../shared/NoDataAvailable"

type SlotBlock = { id: string; date: string }
type Slot = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotBlocks: SlotBlock[]
}

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
    <Card className="p-3 flex flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${dayColors[slot.dayOfWeek]}`}>
          {dayNames[slot.dayOfWeek]}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-muted px-2.5 py-1 rounded-md">
          <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          {slot.startTime} – {slot.endTime}
        </span>
      </div>

      <Popover onOpenChange={() => setFeedback("")}>
        <PopoverTrigger
          className="h-7 w-7 flex items-center justify-center rounded-md border border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 dark:border-yellow-600 dark:text-yellow-500 transition-colors flex-shrink-0"
          aria-label="Manage dates"
        >
          <Clock className="h-3.5 w-3.5" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 space-y-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setFeedback("") }}
            disabled={(date) => date.getDay() !== slot.dayOfWeek || date < today}
          />
          {selectedDate && (
            <>
              <Button
                className="w-full"
                variant={isFullOnSelected ? "outline" : "destructive"}
                disabled={toggling}
                onClick={handleToggle}
              >
                {toggling ? "Updating..." : isFullOnSelected ? "Mark as Free" : "Mark as Full"}
              </Button>
              {feedback && (
                <p className="text-xs text-center text-muted-foreground">{feedback}</p>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </Card>
  )
}

export function DoctorAvailabilityDrawer({ doctorId, doctorName, open, onOpenChange } : {
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
      <SheetContent side="right" className="w-[480px] data-[side=right]:w-[480px] data-[side=right]:sm:max-w-[480px] p-5" >
        <SheetHeader className="p-0 pb-4 border-b">
          <SheetTitle className="text-lg"><strong>{doctorName}</strong>'s Availability</SheetTitle>
        </SheetHeader>
        <div className="space-y-2.5">
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && slots.length === 0 && (
            <NoDataAvailable message="No availability set yet." />
          )}
          {slots.map((slot) => (
            <SlotRow key={slot.id} slot={slot} onSlotUpdate={updateSlot} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}