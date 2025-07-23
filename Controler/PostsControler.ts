import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { error } from "console";

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

// route PUT mise à jour d'un post

export const updatePosts = async (req: Request, res: Response)=> {
    const postId = parseInt(req.params.id);
    const {title, description, image_url} = req.body;
        
        try {
            const updated = await prisma.posts.update({
                where: {id: postId},
                data: {title, description, image_url, updated_at: new Date()},
            });
            res.json(updated);
        } catch(error){
            res.status(500).json({error: "Erreur serveur MAJ"})
        }
};

//Route Delete suppression d'un post

export const deletePosts = async(req: Request, res: Response)=> {
    const postId = parseInt(req.params.id);

        try{
            await prisma.posts.delete({where:{ id: postId}});
            res.json({message: "Post supprimé avec succès"});
        }catch(error){
            console.error("Erreur lors de la suppression :", error);
            res.status(500).json({error: "Erreur serveur suppression post "});
        }
};