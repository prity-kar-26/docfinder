import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// Helper: get the logged-in center's CenterProfile id
async function getCenterId(userId: string) {
  const profile = await prisma.centerProfile.findUnique({ where: { userId } });
  return profile?.id ?? null;
}

export const getMyDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const doctors = await prisma.doctor.findMany({
      where: { centerId },
      orderBy: { name: "asc" },
    });

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};

export const createDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const { name, specialty, phone, fee, bio, email } = req.body;

    if (!name || !specialty || !phone || fee === undefined) {
      return res.status(400).json({ error: "Name, specialty, phone, and fee are required" });
    }

    const doctor = await prisma.doctor.create({
      data: { centerId, name, specialty, phone, fee: Number(fee), bio, email },
    });

    res.status(201).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create doctor" });
  }
};

export const updateDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const centerId = await getCenterId(req.user!.userId);
    if (!centerId) return res.status(404).json({ error: "Center profile not found" });

    const { id } = req.params;
    const existing = await prisma.doctor.findUnique({ where: { id } });

    if (!existing || existing.centerId !== centerId) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const { name, specialty, phone, fee, bio, email } = req.body;

    const updated = await prisma.doctor.update({
      where: { id },
      data: { name, specialty, phone, fee: fee !== undefined ? Number(fee) : undefined, bio, email },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update doctor" });
  }
};