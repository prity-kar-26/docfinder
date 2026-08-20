import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

async function getCenterId(userId: string) {
  const profile = await prisma.centerProfile.findUnique({ where: { userId } });
  return profile?.id ?? null;
}

export const getEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center/Clinic profile not found" });

    const { from, to, doctorId } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        doctor: { centerId },
        paid: true,
        ...(doctorId && { doctorId: doctorId as string }),
        ...(from && { date: { gte: new Date(from as string) } }),
        ...(to && { date: { ...(from ? { gte: new Date(from as string) } : {}), lte: new Date(to as string) } }),
      },
      include: { doctor: { select: { id: true, name: true, specialty: true } } },
    });

    const totalEarnings = bookings.reduce((sum, b) => sum + b.amount, 0);
    const totalPaidBookings = bookings.length;

    // Group by doctor
    const byDoctor = new Map<string, { doctorId: string; name: string; specialty: string; total: number; count: number }>();
    for (const b of bookings) {
      const existing = byDoctor.get(b.doctor.id);
      if (existing) {
        existing.total += b.amount;
        existing.count += 1;
      } else {
        byDoctor.set(b.doctor.id, {
          doctorId: b.doctor.id,
          name: b.doctor.name,
          specialty: b.doctor.specialty,
          total: b.amount,
          count: 1,
        });
      }
    }

    res.json({
      totalEarnings,
      totalPaidBookings,
      perDoctor: Array.from(byDoctor.values()).sort((a, b) => b.total - a.total),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
};