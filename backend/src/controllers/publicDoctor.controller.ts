import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const searchDoctors = async (req: Request, res: Response) => {
  try {
    const { doctorName, centerName, specialty, city, date } = req.query;

    let dayOfWeek: number | undefined;
    if (date) {
      dayOfWeek = new Date(date as string).getDay();
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        ...(doctorName && { name: { contains: doctorName as string, mode: "insensitive" } }),
        ...(specialty && { specialty: { contains: specialty as string, mode: "insensitive" } }),
        ...(centerName && {
          center: { user: { name: { contains: centerName as string, mode: "insensitive" } } },
        }),
        ...(city && { center: { city: { contains: city as string, mode: "insensitive" } } }),
        ...(dayOfWeek !== undefined && {
          availability: { some: { dayOfWeek } },
        }),
      },
      include: {
        center: {
          select: {
            city: true,
            clinicAddress: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search doctors" });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        center: {
          select: {
            city: true,
            clinicAddress: true,
            user: { select: { name: true } },
          },
        },
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          include: { slotBlocks: true },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
};