import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// Helper: confirms this doctor belongs to the logged-in center, returns centerId
async function getOwnedDoctor(userId: string, doctorId: string) {
  const centerProfile = await prisma.centerProfile.findUnique({ where: { userId } });
  if (!centerProfile) return null;

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor || doctor.centerId !== centerProfile.id) return null;

  return doctor;
}

// GET /api/center/doctors/:doctorId/availability
export const getDoctorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    const doctor = await getOwnedDoctor(req.user!.userId, doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const slots = await prisma.availability.findMany({
      where: { doctorId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: { slotBlocks: true },
    });

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};

// POST /api/center/doctors/:doctorId/availability
export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    const doctor = await getOwnedDoctor(req.user!.userId, doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const { dayOfWeek, startTime, endTime } = req.body;
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: "Day, start time, and end time are required" });
    }
    if (endTime <= startTime) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const slot = await prisma.availability.create({
      data: { doctorId, dayOfWeek: Number(dayOfWeek), startTime, endTime },
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create slot" });
  }
};

// PUT /api/center/availability/:id
export const updateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;

    const slot = await prisma.availability.findUnique({ where: { id } });
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    const doctor = await getOwnedDoctor(req.user!.userId, slot.doctorId);
    if (!doctor) return res.status(404).json({ error: "Slot not found" });

    if (endTime && startTime && endTime <= startTime) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const updated = await prisma.availability.update({
      where: { id },
      data: {
        dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
        startTime,
        endTime,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update slot" });
  }
};

// DELETE /api/center/availability/:id
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const slot = await prisma.availability.findUnique({ where: { id } });
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    const doctor = await getOwnedDoctor(req.user!.userId, slot.doctorId);
    if (!doctor) return res.status(404).json({ error: "Slot not found" });

    await prisma.availability.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete slot" });
  }
};

// PUT /api/center/availability/:id/toggle  body: { date: "2026-08-17" }
// Toggles Full/Free for that specific date on this weekly slot
export const toggleSlotBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: "Date is required" });

    const slot = await prisma.availability.findUnique({ where: { id } });
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    const doctor = await getOwnedDoctor(req.user!.userId, slot.doctorId);
    if (!doctor) return res.status(404).json({ error: "Slot not found" });

    const parsedDate = new Date(date);

    const existingBlock = await prisma.slotBlock.findUnique({
      where: { availabilityId_date: { availabilityId: id, date: parsedDate } },
    });

    if (existingBlock) {
      // Currently Full -> free it up
      await prisma.slotBlock.delete({ where: { id: existingBlock.id } });
      return res.json({ date, full: false });
    } else {
      // Currently Free -> mark it full
      await prisma.slotBlock.create({ data: { availabilityId: id, date: parsedDate } });
      return res.json({ date, full: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle slot status" });
  }
};