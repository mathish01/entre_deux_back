import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  console.log("💥 authMiddleware appelé !");

  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
