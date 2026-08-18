"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, Calendar } from "lucide-react"

const navItems = [
  { label: "Find Doctors", href: "/patient/dashboard", icon: Search },
  { label: "My Bookings", href: "/patient/dashboard/bookings", icon: Calendar },
]

export function PatientSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r min-h-screen p-4 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </aside>
  )
}