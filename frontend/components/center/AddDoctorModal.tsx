"use client"

import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

type Doctor = {
  id: string
  name: string
  specialty: string
  phone: string
  fee: number
  bio: string | null
  email: string | null
}

export function AddDoctorModal({ onAdded }: { onAdded: (doctor: Doctor) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [phone, setPhone] = useState("")
  const [fee, setFee] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName("")
    setSpecialty("")
    setPhone("")
    setFee("")
    setBio("")
    setEmail("")
    setError("")
  }

  const handleSubmit = async () => {
    if (!name.trim() || !specialty.trim() || !phone.trim() || !fee) {
      setError("Name, specialty, phone, and fee are required")
      return
    }

    setSaving(true)
    setError("")
    try {
      const doctor = await apiFetch("/center/doctors", {
        method: "POST",
        body: JSON.stringify({ name, specialty, phone, fee: Number(fee), bio: bio || undefined, email: email || undefined }),
      })
      onAdded(doctor)
      reset()
      setOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to add doctor")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex flex-col items-center justify-center h-40 w-full rounded-lg border-2 border-dashed hover:bg-muted transition-colors">
        <Plus className="h-6 w-6 mb-1" />
        <span className="text-sm">Add Doctor</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Doctor</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="doc-name">Doctor's Name</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="doc-specialty">Specialty</Label>
            <Input id="doc-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="doc-phone">Phone Number</Label>
            <Input id="doc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="doc-fee">Consultation Fee</Label>
            <Input id="doc-fee" type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="doc-email">Email (optional)</Label>
            <Input id="doc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="doc-bio">Bio (optional)</Label>
            <Textarea id="doc-bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Doctor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}