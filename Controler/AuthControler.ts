import { Request, Response } from "express";
import bcrypt from "bcryptjs"; 

import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();




import { AuthRequest } from "../middleware/authMiddleware";

const generateToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password, phone, role } = req.body;
  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        role,
      },
    });

    const token = generateToken(newUser.id);
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = generateToken(user.id);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

export const profile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({ where: { id: req.userId } });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
};
