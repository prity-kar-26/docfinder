"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserCircle } from "lucide-react"

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [city, setCity] = useState("")
  const [clinicAddress, setClinicAddress] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  const load = () => {
    apiFetch("/profile/me")
      .then((data) => {
        setName(data.name)
        setEmail(data.email)
        setPhone(data.phone || "")
        setRole(data.role)
        setCity(data.centerProfile?.city || "")
        setClinicAddress(data.centerProfile?.clinicAddress || "")
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    if (open) {
      load()
      setCurrentPassword("")
      setNewPassword("")
      setError("")
      setSuccess("")
    }
  }, [open])

  const handleSave = async () => {
    if (role === "CENTER" && (!phone.trim() || !city.trim() || !clinicAddress.trim())) {
      setError("Phone number, city, and address are required for Center accounts")
      return
    }
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await apiFetch("/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          phone,
          ...(role === "CENTER" && { city, clinicAddress }),
          ...(newPassword && { currentPassword, newPassword }),
        }),
      })
      setSuccess("Profile updated!")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="p-2 rounded-md hover:bg-muted" aria-label="My Profile">
        <UserCircle className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="profile-name" className="pb-1">
              {role === "CENTER" ? "Clinic / Center Name" : "Full Name"} <span className="text-red-500">*</span>
            </Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)}/>
          </div>
          <div>
            <Label htmlFor="profile-email" className="pb-1">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="profile-phone" className="pb-1">
              Phone Number {role === "CENTER" && <span className="text-red-500">*</span>}
            </Label>
            <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {role === "CENTER" && (
            <>
              <div>
                <Label htmlFor="profile-city" className="pb-1">City <span className="text-red-500">*</span></Label>
                <Input id="profile-city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="profile-address" className="pb-1">Clinic / Center Address <span className="text-red-500">*</span></Label>
                <Input id="profile-address" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
              </div>
            </>
          )}

          {/* <hr className="my-2" /> */}
          <p className="text-sm text-red-600 dark:text-red-400">*Leave password fields blank to keep your current password.</p>

          <div>
            <Label htmlFor="profile-current-password" className="pb-1">Current Password</Label>
            <Input id="profile-current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="profile-new-password" className="pb-1">New Password</Label>
            <Input id="profile-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>} 

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}