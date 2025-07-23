import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const getUsers = async (req: Request, res: Response) => {
  const getAllUsers = await prisma.users.findMany();
  console.log(getAllUsers);
  res.json({ getUsers: getAllUsers });
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, phone, role } = req.body;
  try {
    const checkingIfUserExist = await prisma.users.findFirst({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });

    if (checkingIfUserExist) {
      return res
        .status(409)
        .json({ message: "Le pseudo ou/et le mail existent déjà." });
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

    return res
      .status(201)
      .json({ newUser, message: "Le compte a bien été créé." });
  } catch (error) {
    console.error("Erreur Prisma:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password, phone, updated_at } = req.body;

  try {
    const userId = parseInt(id);

    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "L'utilisateur n'est pas reconnu." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        updated_at,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Erreur Prisma:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const findUser = await prisma.users.findUnique({
      where: { email },
    });
    if (!findUser) {
      return res
        .status(400)
        .json("Ce mail n'existe pas et ne peut donc pas être supprimé.");
    }

    const deletedUser = await prisma.users.delete({
      where: { email },
    });
    return res.status(200).json({ deletedUser, message: "Le compte a bien été supprimé." });
  } catch (error) {
    console.error("Erreur Prisma:", error);
    res.status(500).json({ error: error.message });
  } 
};
