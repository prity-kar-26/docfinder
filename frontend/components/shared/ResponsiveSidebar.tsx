"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> }

function NavLinks({ navItems, onNavigate }: { navItems: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="space-y-1 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function ResponsiveSidebar({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden lg:block w-56 border-r min-h-screen flex-shrink-0">
        <NavLinks navItems={navItems} />
      </aside>

      {/* Below lg: hamburger + slide-out drawer */}
      <div className="lg:hidden p-3 border-b flex-shrink-0">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="p-2 rounded-md border hover:bg-muted" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 data-[side=left]:w-64 p-0">
            <NavLinks navItems={navItems} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}