import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma";

export const getLikeComments = async (req: Request, res: Response) => {
  try {
    const likeComments = await prisma.likeComment.findMany();
    res.json(likeComments);
  } catch (error) {
    res.status(500).json({ error: "Attention erreur serveur -_-" });
  }
};

export const createLikeComments = async (req: Request, res: Response) => {
  try {
    const { user_id, commentaire_id } = req.body;

    // Vérification stricte des champs
    if (
      typeof user_id !== "number" ||
      typeof commentaire_id !== "number" ||
      isNaN(user_id) ||
      isNaN(commentaire_id)
    ) {
      return res.status(400).json({
        error: "user_id et comment_id doivent être des nombres valides",
      });
    }

    // Création du like
    const newLikeComment = await prisma.likeComment.create({
      data: {
        user_id: req.body.user_id,
        comment_id: req.body.comment_id,
      },
    });

    return res.status(201).json(newLikeComment);
  } catch (error: any) {
    console.error("Erreur lors de la création du commentaire :", error);

    // Erreur de base de données Prisma
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ error: "Utilisateur ou commentaire inexistant" });
    }

    return res.status(500).json({ error: "Erreur serveur lors du like" });
  }
};

//Route Delete
export const deleteLikeComments = async (req: Request, res: Response) => {
  const likeCommentId = parseInt(req.params.id);

  try {
    await prisma.likeComment.delete({ where: { id: likeCommentId } });
    res.json({ message: "Commenatire supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ error: "Erreur serveur suppression du like " });
  }
};
