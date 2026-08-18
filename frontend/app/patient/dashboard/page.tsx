import { DoctorSearch } from "@/components/patient/DoctorSearch"

export default function PatientDashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-semibold mb-4 flex-shrink-0">Find Doctors</h1>
      <div className="flex-1 overflow-hidden">
        <DoctorSearch />
      </div>
    </div>
  )
}