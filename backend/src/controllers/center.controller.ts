import { Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMyCenterProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.centerProfile.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });

    if (!profile) {
      return res.status(404).json({ error: "Center profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch center profile" });
  }
};

export const updateMyCenterProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { city, clinicAddress, bio } = req.body;

    const updated = await prisma.centerProfile.update({
      where: { userId: req.user!.userId },
      data: { city, clinicAddress, bio },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update center profile" });
  }
};