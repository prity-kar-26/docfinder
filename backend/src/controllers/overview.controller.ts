import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

async function getCenterId(userId: string) {
  const profile = await prisma.centerProfile.findUnique({ where: { userId } });
  return profile?.id ?? null;
}

function toISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const now = new Date();
    const dateParam = (req.query.date as string) || toISO(now);
    const selectedDate = new Date(dateParam);
    const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
    const selectedDow = selectedDate.getDay();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const doctors = await prisma.doctor.findMany({
      where: { centerId },
      select: {
        id: true, name: true, specialty: true,
        availability: { select: { dayOfWeek: true, startTime: true, endTime: true } },
      },
    });

    const totalDoctors = doctors.length;

    const slotsForSelectedDay = doctors.flatMap((d) =>
      d.availability
        .filter((a) => a.dayOfWeek === selectedDow)
        .map((a) => ({
          doctorId: d.id,
          doctorName: d.name,
          specialty: d.specialty,
          startTime: a.startTime,
          endTime: a.endTime,
        }))
    );

    const availableDoctors = doctors
      .filter((d) => d.availability.some((a) => a.dayOfWeek === selectedDow))
      .map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        slotCount: d.availability.filter((a) => a.dayOfWeek === selectedDow).length,
      }));

    const [selectedDateBookings, thisMonthPaidBookings, allBookings, last7DaysBookings] = await Promise.all([
      prisma.booking.findMany({
        where: { doctor: { centerId }, date: { gte: dayStart, lte: dayEnd } },
        select: { id: true, patientName: true, patientPhone: true, timeSlot: true, paid: true, amount: true, status: true, doctorId: true },
      }),
      prisma.booking.findMany({
        where: { doctor: { centerId }, paid: true, date: { gte: monthStart } },
        select: { amount: true },
      }),
      prisma.booking.findMany({
        where: { doctor: { centerId } },
        select: { paid: true, status: true },
      }),
      prisma.booking.findMany({
        where: { doctor: { centerId }, date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) } },
        select: { date: true, paid: true, amount: true },
      }),
    ]);

    const thisMonthEarnings = thisMonthPaidBookings.reduce((sum, b) => sum + b.amount, 0);

    const bookingsBreakdown = {
      paid: allBookings.filter((b) => b.paid).length,
      unpaid: allBookings.filter((b) => !b.paid && b.status !== "CANCELLED").length,
      cancelled: allBookings.filter((b) => b.status === "CANCELLED").length,
    };

    const schedule = slotsForSelectedDay
      .map((slot) => {
        const timeSlot = `${slot.startTime}-${slot.endTime}`;
        const bookings = selectedDateBookings.filter((b) => b.doctorId === slot.doctorId && b.timeSlot === timeSlot);
        return {
          doctorId: slot.doctorId,
          doctorName: slot.doctorName,
          specialty: slot.specialty,
          timeSlot,
          bookings: bookings.map((b) => ({
            id: b.id, patientName: b.patientName, patientPhone: b.patientPhone, paid: b.paid, amount: b.amount, status: b.status,
          })),
        };
      })
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    const chartData: { date: string; bookings: number; earnings: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const iso = toISO(day);
      const dayBookings = last7DaysBookings.filter((b) => toISO(new Date(b.date)) === iso);
      chartData.push({
        date: iso,
        bookings: dayBookings.length,
        earnings: dayBookings.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0),
      });
    }

    res.json({
      totalDoctors,
      selectedDate: dateParam,
      selectedDateBookingsCount: selectedDateBookings.length,
      thisMonthEarnings,
      totalBookings: allBookings.length,
      bookingsBreakdown,
      schedule,
      availableDoctors,
      chartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
};