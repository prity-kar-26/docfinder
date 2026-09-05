// "use client"

// import { useEffect, useState } from "react"
// import { apiFetch } from "@/lib/api"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
// import { AvailabilitySlotModal } from "./AvailabilitySlotModal"
// import { UserRound, CalendarClock, Stethoscope } from "lucide-react"

// type Doctor = {
//   id: string
//   name: string
//   specialty: string
//   availability: { dayOfWeek: number }[]
// }

// export function DoctorsAvailabilityList() {
//   const [doctors, setDoctors] = useState<Doctor[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     apiFetch("/center/doctors")
//       .then(setDoctors)
//       .catch((err) => console.error(err))
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return <p>Loading...</p>
//   if (doctors.length === 0) return <NoDataAvailable message="No doctors listed yet. Add a doctor first." />

//   const today = new Date().getDay()

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//       {doctors.map((doctor) => {
//         const isAvailableToday = doctor.availability.some((a) => a.dayOfWeek === today)
//         const totalSlots = doctor.availability.length

//         return (
//           <Card
//             key={doctor.id}
//             className="p-3 flex flex-row items-center justify-between gap-3 hover:shadow-md hover:border-primary/40 transition-all"
//           >
//             <div className="flex items-center gap-2.5 min-w-0">
//               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
//                 <CalendarClock  className="h-5 w-5 text-primary" />
//               </div>
//               <div className="min-w-0">
//                 <p className="font-semibold leading-tight truncate text-sm">{doctor.name}</p>
//                 <p className="text-sm text-muted-foreground truncate">{doctor.specialty}</p>
//                 <div className="flex items-center gap-1.5 mt-1.5">
//                   {isAvailableToday && (
//                     <Badge className="bg-green-600 hover:bg-green-600 text-xs">Available Today</Badge>
//                   )}
//                   {totalSlots > 0 && (
//                     <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
//                       <CalendarClock className="h-3 w-3" />
//                       {totalSlots} slot{totalSlots > 1 ? "s" : ""}/week
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <AvailabilitySlotModal doctorId={doctor.id} doctorName={doctor.name} />
//           </Card>
//         )
//       })}
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
import { AvailabilitySlotModal } from "./AvailabilitySlotModal"
import { CalendarClock, Search, Stethoscope } from "lucide-react"

type Doctor = {
  id: string
  name: string
  specialty: string
  availability: { dayOfWeek: number }[]
}

export function DoctorsAvailabilityList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    apiFetch("/center/doctors")
      .then(setDoctors)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])
  // console.log("Doctors data:", doctors)

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (doctors.length === 0) return <NoDataAvailable message="No doctors listed yet. Add a doctor first." />

  const today = new Date().getDay()

  // Filter doctors based on name or specialty
  const filteredDoctors = doctors.filter((doctor) => {
    const query = searchQuery.toLowerCase()
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Search Input */}
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name or specialty..."
          className="pl-8 bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 pt-0.5 pl-0.5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => {
              const isAvailableToday = doctor.availability.some((a) => a.dayOfWeek === today)
              const totalSlots = doctor.availability.length

              return (
                <Card key={doctor.id}
                  className="p-3 flex flex-row items-center justify-between gap-3 hover:shadow-md hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight truncate text-sm">{doctor.name}</p>
                      <p className="text-muted-foreground truncate mt-0.5">{doctor.specialty}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isAvailableToday && (
                          <Badge className="bg-green-600 hover:bg-green-600 text-[10px] px-1.5 py-0 h-4">
                            Available Today
                          </Badge>
                        )}
                        {totalSlots > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple">
                            <CalendarClock className="h-3 w-3 text-purple-600 dark:text-purple" />
                            {totalSlots} slot{totalSlots > 1 ? "s" : ""}/week
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <AvailabilitySlotModal doctorId={doctor.id} doctorName={doctor.name} />
                </Card>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground col-span-full">
              No doctors found matching "<span className="font-bold text-foreground">{searchQuery}</span>".
            </p>
          )}
        </div>
      </div>
    </div>
  )
}