"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NoDataAvailable } from "@/components/shared/NoDataAvailable"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import {
    Users, CalendarClock, IndianRupee, ClipboardList, Clock, UserRound, ChevronDown, ChevronRight, Phone, ArrowUpRight,
    Stethoscope, HeartPulse
} from "lucide-react"

type ScheduleBooking = { id: string; patientName: string; patientPhone: string; paid: boolean; amount: number; status: string }
type ScheduleRow = { doctorId: string; doctorName: string; specialty: string; timeSlot: string; bookings: ScheduleBooking[] }
type AvailableDoctor = { id: string; name: string; specialty: string; slotCount: number }
type ChartPoint = { date: string; bookings: number; earnings: number }

type OverviewData = {
    totalDoctors: number
    selectedDate: string
    selectedDateBookingsCount: number
    thisMonthEarnings: number
    totalBookings: number
    bookingsBreakdown: { paid: number; unpaid: number; cancelled: number }
    schedule: ScheduleRow[]
    availableDoctors: AvailableDoctor[]
    chartData: ChartPoint[]
}

function todayISO(): string {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function formatChartLabel(dateStr: any): string {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" })
}

export function CenterOverview() {
    const [data, setData] = useState<OverviewData | null>(null)
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(todayISO())
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const load = (d: string) => {
        setLoading(true)
        apiFetch(`/center/overview?date=${d}`)
            .then(setData)
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }
    console.log("Overview data:", data)

    useEffect(() => {
        load(date)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDateChange = (d: string) => {
        setDate(d)
        load(d)
        setExpandedRows(new Set())
    }

    const toggleRow = (key: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    const isToday = date === todayISO()
    const hasChartActivity = data?.chartData.some((d) => d.bookings > 0 || d.earnings > 0)

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 flex items-center justify-between mb-4 pl-1">
                <h1 className="text-2xl font-semibold">Overview</h1>
                <Input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} className="w-auto" />
            </div>

            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

            {!loading && data && (
                <div className="flex-1 overflow-y-auto space-y-6 p-1">
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/center/dashboard/doctors" className="group">
                            <Card className="p-4 flex flex-row items-center gap-3 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer relative">
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-11 w-11 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground underline decoration-dotted underline-offset-2">Total Doctors</p>
                                    <p className="text-2xl font-semibold">{data.totalDoctors}</p>
                                </div>
                            </Card>
                        </Link>

                        <Link href="/center/dashboard/bookings" className="group">
                            <Card className="p-4 flex flex-row items-center gap-3 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer relative">
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-11 w-11 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                                    <CalendarClock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground underline decoration-dotted underline-offset-2">
                                        {isToday ? "Today's Bookings" : `Bookings on ${formatDate(date)}`}
                                    </p>
                                    <p className="text-2xl font-semibold">{data.selectedDateBookingsCount}</p>
                                </div>
                            </Card>
                        </Link>

                        <Link href="/center/dashboard/earnings?preset=month" className="group">
                            <Card className="p-4 flex flex-row items-center gap-3 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer relative">
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-11 w-11 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                                    <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground underline decoration-dotted underline-offset-2">This Month's Earnings</p>
                                    <p className="text-2xl font-semibold">₹{data.thisMonthEarnings}</p>
                                </div>
                            </Card>
                        </Link>

                        <Dialog>
                            <DialogTrigger className="group p-4 flex flex-row items-center gap-3 rounded-xl border bg-card text-left hover:shadow-md hover:border-primary/40 transition-all relative">
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="h-11 w-11 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
                                    <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground underline decoration-dotted underline-offset-2">Total Bookings</p>
                                    <p className="text-2xl font-semibold">{data.totalBookings}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Bookings Breakdown</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 mt-2">
                                    <div className="flex items-center justify-between p-3 rounded-md bg-green-50 dark:bg-green-950">
                                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Paid</span>
                                        <Badge className="bg-green-600 hover:bg-green-600">{data.bookingsBreakdown.paid}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-md bg-amber-50 dark:bg-amber-950">
                                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Unpaid</span>
                                        <Badge className="bg-amber-500 hover:bg-amber-500">{data.bookingsBreakdown.unpaid}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-md bg-red-50 dark:bg-red-950">
                                        <span className="text-sm font-medium text-red-700 dark:text-red-300">Cancelled</span>
                                        <Badge className="bg-red-500 hover:bg-red-500">{data.bookingsBreakdown.cancelled}</Badge>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Schedule table + Available doctors */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Schedule — {formatDate(date)}
                            </h2>
                            {data.schedule.length === 0 ? (
                                // <div className="flex-1 flex items-center justify-center p-6">
                                <NoDataAvailable message="No slots scheduled for this date." />
                                // </div>
                            ) : (
                                <Card className="border flex flex-col h-[300px]">
                                    <div className="flex-1 overflow-y-auto divide-y">
                                        {data.schedule.map((row) => {
                                            const key = `${row.doctorId}-${row.timeSlot}`
                                            const isOpen = expandedRows.has(key)
                                            return (
                                                <div key={key}>
                                                    <button
                                                        onClick={() => toggleRow(key)}
                                                        className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                            {/* <div>
                                                                <p className="font-medium text-sm">{row.doctorName} - <span className="text-sm text-muted-foreground">{row.specialty}</span></p>
                                                            </div> */}
                                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                <Stethoscope className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                                <p className="font-medium text-sm">{row.doctorName} - <span className="text-sm text-muted-foreground">{row.specialty}</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-muted px-3 py-1.5 rounded-md">
                                                                <Clock className="h-3 w-3" />
                                                                {row.timeSlot}
                                                            </span>
                                                            <Badge className="h-6 text-sm bg-blue-600 hover:bg-blue-600">{row.bookings.length}</Badge>

                                                        </div>
                                                    </button>

                                                    {isOpen && (
                                                        <div className="bg-muted/30 px-3 pb-3">
                                                            {row.bookings.length === 0 ? (
                                                                <p className="text-xs text-muted-foreground py-3 text-center">No patients booked for this slot.</p>
                                                            ) : (
                                                                <div className="space-y-2 pt-1">
                                                                    {row.bookings.map((b) => (
                                                                        <div key={b.id} className="flex items-center bg-background rounded-md p-2 border gap-2">
                                                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                                <UserRound className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                                                <p className="text-sm font-medium truncate">{b.patientName}</p>
                                                                            </div>

                                                                            <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 flex-1 justify-center flex-shrink-0">
                                                                                <Phone className="h-3 w-3" />
                                                                                {b.patientPhone}
                                                                            </div>

                                                                            <div className="flex items-center gap-2 flex-1 justify-end flex-shrink-0">
                                                                                <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">₹{b.amount}</Badge>
                                                                                <Badge className={b.paid ? "bg-green-600 hover:bg-green-600 text-xs" : "bg-amber-500 hover:bg-amber-500 text-xs"}>
                                                                                    {b.paid ? "Paid" : "Unpaid"}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <UserRound className="h-5 w-5 text-primary" />
                                Available — {formatDate(date)}
                            </h2>
                            {data.availableDoctors.length === 0 ? (
                                // <div className="flex-1 flex items-center justify-center p-6">
                                <NoDataAvailable message="No doctors available on this date." />
                                // </div>
                            ) : (
                                <Card className="border flex flex-col h-[300px]">
                                    <div className="flex-1 overflow-y-auto divide-y">
                                        {data.availableDoctors.map((doc) => (
                                            <div key={doc.id} className="flex items-center gap-3 p-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <UserRound className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm truncate">{doc.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{doc.specialty}</p>
                                                </div>
                                                <Badge className="bg-teal-600 hover:bg-teal-600 text-xs flex-shrink-0">
                                                    {doc.slotCount} slot{doc.slotCount > 1 ? "s" : ""}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>

                                </Card>
                            )}
                        </div>
                    </div>

                    {/* 7-day chart */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Bookings & Earnings — Last 7 Days</h2>
                        {!hasChartActivity ? (
                            <NoDataAvailable message="No bookings or earnings in the last 7 days." />
                        ) : (
                            <Card className="p-4">

                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={data.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="date" tickFormatter={formatChartLabel} fontSize={12} />
                                        <YAxis yAxisId="left" allowDecimals={false} fontSize={12} />
                                        <YAxis yAxisId="right" orientation="right" fontSize={12} />
                                        <Tooltip labelFormatter={formatChartLabel} />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="bookings" fill="#2563eb" radius={[4, 4, 0, 0]} name="Bookings" />
                                        <Bar yAxisId="right" dataKey="earnings" fill="#16a34a" radius={[4, 4, 0, 0]} name="Earnings (₹)" />
                                    </BarChart>
                                </ResponsiveContainer>

                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}