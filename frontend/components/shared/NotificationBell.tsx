"use client"

import { useEffect, useState, useRef } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const load = () => {
    apiFetch("/notifications")
      .then(setNotifications)
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    load()
    // Refresh every 30 seconds so new requests/updates show up without a manual reload
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await apiFetch(`/notifications/${n.id}/read`, { method: "PUT" })
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        )
      } catch (err) {
        console.error(err)
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {notifications.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left p-3 border-b dark:border-gray-800 text-sm hover:bg-muted ${
                n.read ? "text-muted-foreground" : "font-medium"
              }`}
            >
              <p>{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}