import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// This adds a "user" field to Express's Request type, so TypeScript knows req.user exists after this middleware runs.
export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

// requireAuth — checks the token exists and is valid (using the same JWT_SECRET we used to create tokens at login). 
// If valid, it calls next() line no:26 — this is the signal in Express that means "proceed to whatever comes after this middleware."
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;        //the frontend needs to send the token in every request from now on, in a header like Authorization: Bearer <token>

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: string;
    };
    req.user = decoded; // attach the logged-in user's info to the request
    next(); 
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Extra gatekeeper: only allow specific roles through (e.g. only DOCTOR)
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};