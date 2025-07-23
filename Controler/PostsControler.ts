import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export const getPosts = async (req: Request, res: Response) => {
 try{
        const posts = await prisma.posts.findMany();
        res.json(posts);
    } catch(error){
        res.status(500).json({error: 'Attention erreur serveur -_-'})
    }
}

export const createPosts = async (req: Request, res: Response) => {
  try {
    const { title, description, image_url, user_id } = req.body;

    // Vérification basique des champs requis
    if (!title || !description || !image_url || !user_id) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const newPost = await prisma.posts.create({
      data: {
        title,
        description,
        image_url,
        user_id: Number(user_id), // au cas où c'est une string depuis le front
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors de la création du post" });
  }
};
