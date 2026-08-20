import { CenterEarnings } from "@/components/center/CenterEarnings"

export default function CenterEarningsPage() {
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-semibold mb-4 flex-shrink-0">Earnings</h1>
      <div className="flex-1 overflow-hidden">
        <CenterEarnings />
      </div>
    </div>
  )
}