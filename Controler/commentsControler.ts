import { Request, Response } from "express";
import { Prisma, PrismaClient } from '@prisma/client'; 
import { title } from "process";

const prisma = new PrismaClient(); 

// Interfaces 

interface AuthenticatedUser {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

interface CreateCommentRequest {
    commentaire: string;
    post_id: number;
}

interface UpdateCommentRequest {
    commentaire: string; 
}

interface CommentParams {
    id: string;
    postId: string; 
}

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string; 
}

interface CommentWithRelations {
    id: number;
    commentaire: string;
    created_at: Date | null;
    updated_at: Date | null;
    user_id: number | null;
    post_id: number | null;
    users?: {
        id: number;
        username: string; 
    } | null;
    posts?: {
        id: number;
        title: string;
    } | null;
    like_comments?: Array<{
        id: number;
        user_id: number | null;
        commentaire_id: number | null;     
    }>; 
}


export class CommentController {
    // Récupère tous les commentaires d'un post 
    static async getCommentsByPost(req: AuthenticatedRequest & { params: CommentParams }, res: Response<ApiResponse<CommentWithRelations[]>>) {
        try {
            const { postId } = req.params; 

            const comments = await prisma.commentaires.findMany({
                where: {
                    post_id: parseInt(postId)
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true
                        }
                    },
                    like_comments: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            res.status(200).json({
                success: true,
                data: comments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des commentaires',
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            }); 
        }
    }

    // Créer un nouveau commentaire 
    static async createComment(req: AuthenticatedRequest & { body: CreateCommentRequest }, res: Response<ApiResponse<CommentWithRelations>>) {
        try {
            const { commentaire, post_id } = req.body; 
            const user_id = req.user?.id; // Suppose que l'utilisateur est authentifié 

            if(!commentaire || !post_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Le commentaire et l\'ID du post sont requis'
                }); 
            }

            const post = await prisma.posts.findUnique({
                where: { id: parseInt(post_id.toString()) }
            });

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: 'Post non trouvé'
                });
            }
            
            const newComment = await prisma.commentaires.create({
                data: {
                    commentaire,
                    post_id: parseInt(post_id.toString()),
                    user_id,
                    updated_at: new Date()
                },
                include: {
                    users: {
                        select: {
                            id: true, username: true
                        }
                    }
                }
            });

            res.status(201).json({
                success: true,
                message: 'Commentaire crée avec succès',
                data: newComment
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du commentaire',
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            }); 
        }
    }
    
    // Modifier un commentaire 
static async updateComment(req: AuthenticatedRequest & { params: CommentParams; body: UpdateCommentRequest }, res: Response<ApiResponse<CommentWithRelations>>) {
    try {
        const { id } = req.params; 
        const { commentaire } = req.body;
        const user_id = req.user?.id; 

        if (!commentaire) {
            return res.status(400).json({
                success: false,
                message: 'Le contenue du commentaire est requis'
            });
        }

        // Verifier si le commentaire existe et appartient à l'utilisateur 
        const existingComment = await prisma.commentaires.findUnique({
            where: { id: parseInt(id) }
        }); 

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: 'Commentaire non trouvé'
            });
        }

        if (existingComment.user_id !== user_id) {
            return res.status(403).json({
                success:false,
                message: 'Non autorisé à modifier ce commentaire'
            });
        }
        
        const updatedComment = await prisma.commentaires.update({
            where: { id: parseInt(id) }, 
            data: {
                commentaire,
                updated_at: new Date()
            }, 
            include: {
                users: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        }); 

        res.status(200).json({
            success: true, 
            message: 'Commentaire mis à jour avec succès', 
            data: updatedComment 
        }); 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du commentaire', 
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        }); 
    }
}   

// Supprimer un commentaire 
static async deleteComment(req: AuthenticatedRequest & { params: CommentParams }, res: Response<ApiResponse<void>>) {
    try {
        const { id } = req.params; 
        const user_id = req.user?.id; 

        // Vérifier si le commentaire existe et appartient à l'utilisateur

        const existingComment = await prisma.commentaires.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: 'Commentaire non trouvé'
            });
        } 
            
        if (existingComment.user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé à supprimer ce commentaire'
            });
        } 

        await prisma.commentaires.delete({
            where: { id: parseInt(id) }
        }); 
        
        res.status(200).json({
            success: true,
            message: 'Commentaire supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du commentaire',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
}

// Récupérer tous les commentaires d'un utilisateur

static async getUserComments (req: AuthenticatedRequest, res: Response<ApiResponse<CommentWithRelations[]>>) {
try {

    const user_id = req.user?.id;

    const comments = await prisma.commentaires.findMany({
        where: {
            user_id
        },
        include: {
            posts: {
                select: {
                    id: true,
                    title: true
                }
            },
            like_comments: true 
        }, 
        orderBy: {
            created_at: 'desc'
        }
    });

    res.status(200).json({
        success: true, 
        data: comments
    }); 
} catch (error) {
    res.status(500).json({
        success: false,
        message: 'Erreur lors e la récupération des commentaires', 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
    }); 
}
} 

}