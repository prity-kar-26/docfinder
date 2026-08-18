import Navbar  from "@/components/shared/Navbar"
import { CenterSidebar } from "@/components/center/CenterSidebar"

export default function CenterDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <CenterSidebar />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}