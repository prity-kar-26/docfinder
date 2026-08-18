import { AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

export function NoDataAvailable({ message = "No data available." }: { message?: string }) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <AlertCircle className="h-8 w-8" />
      <p>{message}</p>
    </Card>
  )
}