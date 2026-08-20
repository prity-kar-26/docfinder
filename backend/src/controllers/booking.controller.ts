import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.userId;
    const { doctorId, date, timeSlot, patientName, patientPhone } = req.body;

    if (!doctorId || !date || !timeSlot || !patientName || !patientPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [startTime] = timeSlot.split("-");
    const slot = await prisma.availability.findFirst({
      where: { doctorId, startTime },
      include: { slotBlocks: true },
    });

    if (!slot) {
      return res.status(400).json({ error: "Invalid time slot" });
    }

    const pickedDate = new Date(date);
    if (pickedDate.getDay() !== slot.dayOfWeek) {
      return res.status(400).json({ error: "Selected date does not match this slot's day of the week" });
    }

    const isFull = slot.slotBlocks.some((b) => sameDate(new Date(b.date), pickedDate));
    if (isFull) {
      return res.status(409).json({ error: "This slot is full for the selected date" });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { center: { select: { userId: true, id: true } } },
    });
    
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const booking = await prisma.booking.create({
      data: { patientId, doctorId, date: pickedDate, timeSlot, patientName, patientPhone, amount: doctor.fee },
    });

    if (doctor) {
      await prisma.notification.create({
        data: {
          userId: doctor.center.userId,
          type: "NEW_BOOKING",
          message: `New booking from ${patientName} for Dr. ${doctor.name}, ${date} ${timeSlot}`,
          bookingId: booking.id,
        },
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user!.userId;

    const bookings = await prisma.booking.findMany({
      where: { patientId },
      orderBy: { date: "asc" },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true,
            center: { select: { user: { select: { name: true } } } },
          },
        },
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const patientId = req.user!.userId;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking || booking.patientId !== patientId) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "This booking is already cancelled" });
    }

    const updated = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });

    const doctor = await prisma.doctor.findUnique({
      where: { id: booking.doctorId },
      include: { center: { select: { userId: true } } },
    });

    if (doctor) {
      await prisma.notification.create({
        data: {
          userId: doctor.center.userId,
          type: "BOOKING_CANCELLED",
          message: `${booking.patientName} cancelled their booking for ${booking.date.toDateString()}, ${booking.timeSlot}`,
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