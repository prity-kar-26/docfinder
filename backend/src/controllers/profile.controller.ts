import { Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMyUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        centerProfile: { select: { city: true, clinicAddress: true } },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateMyUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, email, phone, currentPassword, newPassword, city, clinicAddress } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email already in use" });
    }

    if (user.role === "CENTER") {
      if (phone !== undefined && !phone) {
        return res.status(400).json({ error: "Phone number is required for Center accounts" });
      }
      if ((city !== undefined && !city) || (clinicAddress !== undefined && !clinicAddress)) {
        return res.status(400).json({ error: "City and address are required for Center accounts" });
      }
    }

    const data: any = { name, email, phone };

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new password" });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      data.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    if (user.role === "CENTER" && (city !== undefined || clinicAddress !== undefined)) {
      await prisma.centerProfile.update({
        where: { userId },
        data: { city, clinicAddress },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};