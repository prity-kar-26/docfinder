"use client"

import { useEffect, useState } from "react"
import { MonitorSmartphone } from "lucide-react"

export function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const check = () => setBlocked(window.innerWidth < 768)
    check()
    setChecked(true)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!checked) return null

  if (blocked) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6 text-center">
        <MonitorSmartphone className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-xl font-semibold mb-2">Please use a desktop</h1>
        <p className="text-muted-foreground max-w-sm">
          DocFinder works best on a larger screen. Please open this site on a desktop or laptop for the full experience.
        </p>
      </div>
    )
  }

  return <>{children}</>
}