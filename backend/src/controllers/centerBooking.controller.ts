import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

async function getCenterId(userId: string) {
  const profile = await prisma.centerProfile.findUnique({ where: { userId } });
  return profile?.id ?? null;
}

export const getCenterBookings = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const { search, date, doctorId } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        doctor: { centerId },
        ...(date && { date: new Date(date as string) }),
        ...(doctorId && { doctorId: doctorId as string }),
        ...(search && {
          OR: [
            { patientName: { contains: search as string, mode: "insensitive" } },
            { doctor: { name: { contains: search as string, mode: "insensitive" } } },
          ],
        }),
      },
      include: { doctor: { select: { id: true,name: true, specialty: true } } },
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

    await prisma.notification.create({
      data: {
        userId: booking.patientId,
        type: "BOOKING_CANCELLED",
        message: `Your booking for ${booking.date.toDateString()}, ${booking.timeSlot} was cancelled by the center`,
        bookingId: booking.id,
      },
    });

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