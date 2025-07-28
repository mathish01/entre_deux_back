import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";


export const getLikePosts = async (req: Request, res: Response) => {
 try{
        const likePosts = await prisma.likePost.findMany();
        res.json(likePosts);
    } catch(error){
        res.status(500).json({error: 'Attention erreur serveur -_-'})
    }
}


export const createLikePosts = async (req: Request, res: Response) => {
  try {
    const { user_id, post_id } = req.body;

    if (
      typeof user_id !== "number" ||
      typeof post_id !== "number" ||
      isNaN(user_id) ||
      isNaN(post_id)
    ) {
      return res.status(400).json({ error: "user_id et post_id doivent être des nombres valides" });
    }

    const existingLike = await prisma.likePost.findFirst({
      where: {
        user_id,
        post_id,
      },
    });

    if (existingLike) {
      return res.status(409).json({ error: "Ce post est déjà liké par cet utilisateur" });
    }

  
    const newLikePost = await prisma.likePost.create({
      data: {
        user_id,
        post_id,
      },
    });

    return res.status(201).json(newLikePost);
  } catch (error: any) {
    console.error("Erreur lors du like :", error);


    if (error.code === "P2003") {
      // Violation de clé étrangère (ex: user ou post inexistant)
      return res.status(400).json({ error: "Utilisateur ou post inexistant" });
    }

    return res.status(500).json({ error: "Erreur serveur lors du like" });
  }
};


//Route Delete suppression d'un post
export const deleteLikePosts = async(req: Request, res: Response)=> {
    const likePostId = parseInt(req.params.id);

        try{
            await prisma.likePost.delete({where:{ id: likePostId}});
            res.json({message: "Like supprimé avec succès"});
        }catch(error){
            console.error("Erreur lors de la suppression :", error);
            res.status(500).json({error: "Erreur serveur suppression du like "});
        }
};