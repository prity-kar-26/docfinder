import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { parseDateOnly } from "../utils/date";

async function getCenterId(userId: string) {
  const profile = await prisma.centerProfile.findUnique({ where: { userId } });
  return profile?.id ?? null;
}

export const getCenterBookings = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const { search, date, doctorId } = req.query;

    let dateFilter = undefined;
    if (date) {
      const day = parseDateOnly(date as string);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
      dateFilter = { gte: dayStart, lte: dayEnd };
    }

    const bookings = await prisma.booking.findMany({
      where: {
        doctor: { centerId },
        ...(dateFilter && { date: dateFilter }),
        ...(doctorId && { doctorId: doctorId as string }),
        ...(search && {
          OR: [
            { patientName: { contains: search as string, mode: "insensitive" } },
            { doctor: { name: { contains: search as string, mode: "insensitive" } } },
          ],
        }),
      },
      include: { doctor: { select: { id: true, name: true, specialty: true } } },
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const cancelBookingAsCenter = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id }, include: { doctor: true } });
    if (!booking || booking.doctor.centerId !== centerId) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const updated = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });

    if (booking.patientId) {
      await prisma.notification.create({
        data: {
          userId: booking.patientId,
          type: "BOOKING_CANCELLED",
          message: `Your booking for ${booking.date.toDateString()}, ${booking.timeSlot} was cancelled by the center`,
          bookingId: booking.id,
        },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

export const togglePaidStatus = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id }, include: { doctor: true } });
    if (!booking || booking.doctor.centerId !== centerId) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { paid: !booking.paid },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const createOfflineBooking = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const { doctorId, date, timeSlot, patientName, patientPhone } = req.body;

    if (!doctorId || !date || !timeSlot || !patientName || !patientPhone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.centerId !== centerId) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const [startTime] = timeSlot.split("-");
    const slot = await prisma.availability.findFirst({
      where: { doctorId, startTime },
      include: { slotBlocks: true },
    });

    if (!slot) {
      return res.status(400).json({ error: "Invalid time slot" });
    }

    // const pickedDate = new Date(date);
    const pickedDate = parseDateOnly(date);
    if (pickedDate.getDay() !== slot.dayOfWeek) {
      return res.status(400).json({ error: "Selected date does not match this slot's day of the week" });
    }

    const isFull = slot.slotBlocks.some((b) => sameDate(new Date(b.date), pickedDate));
    if (isFull) {
      return res.status(409).json({ error: "This slot is full for the selected date" });
    }

    const booking = await prisma.booking.create({
      data: {
        doctorId,
        date: pickedDate,
        timeSlot,
        patientName,
        patientPhone,
        amount: doctor.fee,
        source: "OFFLINE",
        // patientId intentionally omitted — no patient account for offline bookings
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};