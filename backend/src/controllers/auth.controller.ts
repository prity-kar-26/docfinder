import { Request, Response } from "express";
import bcrypt from "bcrypt";   //password showing as a long scrambled hash (not readable text) — that's bcrypt doing its job
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

// Handles: POST /api/auth/signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic check: role must be PATIENT or DOCTOR (never ADMIN from signup form)
    if (role !== "PATIENT" && role !== "DOCTOR") {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if email is already used
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash the password before saving (never store plain text passwords)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    // If they signed up as a doctor, also create an empty DoctorProfile for them
    if (role === "DOCTOR") {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          specialty: "",
          city: "",
          clinicAddress: "",
          fee: 0,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong during signup" });
  }
};

// Handles: POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong during login" });
  }
};