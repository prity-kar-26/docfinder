"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Doctor = {
  id: string
  name: string
  specialty: string
  phone: string
  fee: number
  bio: string | null
  email: string | null
}

export function EditDoctorModal({
  doctor,
  open,
  onOpenChange,
  onUpdated,
}: {
  doctor: Doctor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (doctor: Doctor) => void
}) {
  const [name, setName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [phone, setPhone] = useState("")
  const [fee, setFee] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (doctor) {
      setName(doctor.name)
      setSpecialty(doctor.specialty)
      setPhone(doctor.phone)
      setFee(String(doctor.fee))
      setBio(doctor.bio || "")
      setEmail(doctor.email || "")
      setError("")
    }
  }, [doctor])

  const handleSubmit = async () => {
    if (!doctor) return
    if (!name.trim() || !specialty.trim() || !phone.trim() || !fee) {
      setError("Name, specialty, phone, and fee are required")
      return
    }
    setSaving(true)
    setError("")
    try {
      const updated = await apiFetch(`/center/doctors/${doctor.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, specialty, phone, fee: Number(fee), bio: bio || undefined, email: email || undefined }),
      })
      onUpdated(updated)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to update doctor")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="edit-doc-name">Doctor's Name</Label>
            <Input id="edit-doc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-doc-specialty">Specialty</Label>
            <Input id="edit-doc-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-doc-phone">Phone Number</Label>
            <Input id="edit-doc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-doc-fee">Consultation Fee</Label>
            <Input id="edit-doc-fee" type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-doc-email">Email (optional)</Label>
            <Input id="edit-doc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="edit-doc-bio">Bio (optional)</Label>
            <Textarea id="edit-doc-bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Update Doctor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}