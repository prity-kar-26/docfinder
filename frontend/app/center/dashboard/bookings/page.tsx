// import { CenterBookings } from "@/components/center/CenterBookings"

// export default function CenterBookingsPage() {
//   return (
//     <div>
//       <h1 className="text-2xl font-semibold mb-4">Bookings</h1>
//       <CenterBookings />
//     </div>
//   )
// }

import { CenterBookings } from "@/components/center/CenterBookings"

export default function CenterBookingsPage() {
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-semibold mb-4 flex-shrink-0">Bookings</h1>
      <div className="flex-1 overflow-hidden">
        <CenterBookings />
      </div>
    </div>
  )
}