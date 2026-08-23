// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { cn } from "@/lib/utils"
// import { LayoutDashboard, Users, CalendarClock, ClipboardList, Wallet } from "lucide-react"

// const navItems = [
//   { label: "Overview", href: "/center/dashboard", icon: LayoutDashboard },
//   { label: "Doctors List", href: "/center/dashboard/doctors", icon: Users },
//   { label: "Doctors Availability", href: "/center/dashboard/availability", icon: CalendarClock },
//   { label: "Bookings", href: "/center/dashboard/bookings", icon: ClipboardList },
//   { label: "Earnings", href: "/center/dashboard/earnings", icon: Wallet },
// ]

// export function CenterSidebar() {
//   const pathname = usePathname()

//   return (
//     <aside className="w-56 border-r min-h-screen p-4 space-y-1">
//       {navItems.map((item) => {
//         const isActive = pathname === item.href
//         const Icon = item.icon
//         return (
//           <Link
//             key={item.href}
//             href={item.href}
//             className={cn(
//               "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
//               isActive
//                 ? "bg-primary text-primary-foreground"
//                 : "hover:bg-muted"
//             )}
//           >
//             <Icon className="h-4 w-4" />
//             {item.label}
//           </Link>
//         )
//       })}
//     </aside>
//   )
// }

"use client"

import { ResponsiveSidebar } from "@/components/shared/ResponsiveSidebar"
import { LayoutDashboard, Users, CalendarClock, ClipboardList, Wallet } from "lucide-react"

const navItems = [
  { label: "Overview", href: "/center/dashboard", icon: LayoutDashboard },
  { label: "Doctors List", href: "/center/dashboard/doctors", icon: Users },
  { label: "Doctors Availability", href: "/center/dashboard/availability", icon: CalendarClock },
  { label: "Bookings", href: "/center/dashboard/bookings", icon: ClipboardList },
  { label: "Earnings", href: "/center/dashboard/earnings", icon: Wallet },
]

export function CenterSidebar() {
  return <ResponsiveSidebar navItems={navItems} />
}