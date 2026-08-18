import Navbar from "@/components/shared/Navbar"
import { PatientSidebar } from "@/components/patient/PatientSidebar"

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <PatientSidebar />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}