import { Card } from "@/components/ui/card"

const stats = [
  { label: "Total Bookings", value: "—" },
  { label: "This Month", value: "—" },
  { label: "Doctors Listed", value: "—" },
  { label: "Avg. Rating", value: "—" },
]

export default function CenterOverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}