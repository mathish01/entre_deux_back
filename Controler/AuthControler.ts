// import { Request, Response } from 'express'; 
// import  bcrypt from 'bcryptjs';
// import jwt, { SignOptions } from 'jsonwebtoken'; 
// import { PrismaClient } from '@prisma/client'; 

// const prisma = new PrismaClient();

// interface RegisterBody {
//     username: string; 
//     email: string;
//     password: string;
//     phone: string;
//     role?: string; 
// };

// interface LoginBody {
//     email: string;
//     password: string;
// } 

// class AuthControler {

//     // Configuration JWT 
//     private readonly JWT_SECRET = process.env.JWT_SECRET ||'your-secret-key'; // A choisir nous même
//     private readonly JWT_EXPIRE_IN = '30d'; 
//     private readonly REFRESH_TOKEN_IN = '30d'; 


// // ---------------- Méthode UTiles ----------------------- 

// // Hash Password 

//  static async hashPassword(password: string): Promise<string> {
//         const saltRounds = 10;
//         return await bcrypt.hash(password, saltRounds);
//     }

//     static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
//         return await bcrypt.compare(password, hashedPassword); 
//     }

//     // Genère le Token
//     generateAccessToken(user) {
//         return jwt.sign(
//             {
//                 id: user.id,
//                 username: user.username,
//                 email: user.email,
//                 role: user.role
//             }, 
//             this.JWT_SECRET,
//             { expiresIn: this.JWT_EXPIRE_IN }
//         ); 
//     }

//     // Refresh le token 
//      generateRefreshToken(user: any): string {
//         return jwt.sign(
//             { id: user.id },
//             this.JWT_SECRET,
//             { expiresIn: this.REFRESH_TOKEN_IN }
//         ); 
//     }

//     // Verification du token 

// }

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
