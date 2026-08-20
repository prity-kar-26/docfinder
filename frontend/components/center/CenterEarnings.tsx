"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DoctorSelect } from "@/components/shared/DoctorSelect"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
import { IndianRupee, CalendarCheck, UserRound, TrendingUp, Wallet } from "lucide-react"

type DoctorEarning = {
    doctorId: string
    name: string
    specialty: string
    total: number
    count: number
}

type EarningsData = {
    totalEarnings: number
    totalPaidBookings: number
    perDoctor: DoctorEarning[]
}

function toISO(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function firstOfMonthISO(): string {
    const d = new Date()
    return toISO(new Date(d.getFullYear(), d.getMonth(), 1))
}

function lastOfMonthISO(): string {
    const d = new Date()
    // Day 0 of next month = last day of current month
    return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

export function CenterEarnings() {
    const [data, setData] = useState<EarningsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [doctorId, setDoctorId] = useState("")
    const [activePreset, setActivePreset] = useState<"all" | "month" | "custom">("all")

    const load = (fromVal: string, toVal: string, doctorVal: string) => {
        setLoading(true)
        const params = new URLSearchParams()
        if (fromVal) params.append("from", fromVal)
        if (toVal) params.append("to", toVal)
        if (doctorVal) params.append("doctorId", doctorVal)

        apiFetch(`/center/earnings?${params.toString()}`)
            .then(setData)
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }

    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get("preset") === "month") {
            handleThisMonth()
        } else {
            load("", "", "")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleAllTime = () => {
        setFrom("")
        setTo("")
        setActivePreset("all")
        load("", "", doctorId)
    }

    const handleThisMonth = () => {
        const f = firstOfMonthISO()
        const t = lastOfMonthISO()
        setFrom(f)
        setTo(t)
        setActivePreset("month")
        load(f, t, doctorId)
    }

    const handleCustomSearch = () => {
        setActivePreset("custom")
        load(from, to, doctorId)
    }

    const averagePerBooking =
        data && data.totalPaidBookings > 0 ? Math.round(data.totalEarnings / data.totalPaidBookings) : 0

    return (
        <div className="flex flex-col h-full">
            {/* Filters — full width */}
            <div className="flex-shrink-0 flex flex-wrap items-center gap-2 pb-4">
                <Button variant={activePreset === "all" ? "default" : "outline"} onClick={handleAllTime}>
                    All Time
                </Button>
                <Button variant={activePreset === "month" ? "default" : "outline"} onClick={handleThisMonth}>
                    This Month
                </Button>
                <DoctorSelect value={doctorId} onChange={setDoctorId} className="flex-1 min-w-[200px]" />
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 min-w-[150px]" />
                <span className="text-sm text-muted-foreground">to</span>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 min-w-[150px]" />
                <Button onClick={handleCustomSearch} disabled={loading}>
                    {loading ? "Loading..." : "Apply"}
                </Button>
            </div>

            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

            {!loading && data && (
                <>
                    <div className="flex-shrink-0 grid grid-cols-3 gap-3 pb-6">
                        <Card className="p-4 flex flex-row items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                                <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Earnings</p>
                                <p className="text-2xl font-semibold">₹{data.totalEarnings}</p>
                            </div>
                        </Card>

                        <Card className="p-4 flex flex-row items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                                <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Paid Bookings</p>
                                <p className="text-2xl font-semibold">{data.totalPaidBookings}</p>
                            </div>
                        </Card>

                        <Card className="p-4 flex flex-row items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                                <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg. per Booking</p>
                                <p className="text-2xl font-semibold">₹{averagePerBooking}</p>
                            </div>
                        </Card>
                    </div>

                    <h2 className="flex-shrink-0 text-lg font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Earnings by Doctor
                    </h2>

                    <div className="flex-1 overflow-y-auto p-1">
                        {data.perDoctor.length === 0 && (
                            <NoDataAvailable message="No paid bookings in this range." />
                        )}

                        <div className="grid gap-3">
                            {data.perDoctor.map((doc) => (
                                <Card key={doc.doctorId} className="p-3 flex flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <UserRound className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold leading-tight truncate">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{doc.specialty}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <Badge variant="secondary" className="text-xs">
                                            {doc.count} booking{doc.count > 1 ? "s" : ""}
                                        </Badge>
                                        <Badge className="bg-green-600 hover:bg-green-600 text-sm px-3 py-1">
                                            ₹{doc.total}
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}