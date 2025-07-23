import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const getUsers = async (req: Request, res: Response) => {
  // const { id } = req.params
  // try{
  //     const getUsers
  // }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, phone, role } = req.body;
  try {
    const checkingIfUserExist = await prisma.users.findFirst({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });

    if(checkingIfUserExist) {
      return res.status(409).json({ message: "Le pseudo ou/et le mail existent déjà." });
    }
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
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erreur Prisma:", error);
    res.status(400).json({ error: error.message });
  }
};
