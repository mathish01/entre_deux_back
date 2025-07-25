import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
// import { triggerAsyncId } from "async_hooks";

const prisma = new PrismaClient(); 

interface AuthenticatedUser {
    id: number;
    username: string;
    email: string;
    role: string; 
}

interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

interface AdminUpdateCommentRequest {
    commentraire?: string;
    user_id?: number;
    post_id?: number;
}

interface CommentParams {
    id: string;
}

interface AdminCommentFilters {
    user_id?: string;
    post_id?: string;
    search?: string;
    page?: string;
    limit?: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string; 
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number; 
    }; 
}

interface CommentWithFullRelations {
    id: number;
    commentaire: string;
    created_at: Date | null;
    updated_at: Date | null;
    user_id: number | null;
    post_id: number | null; 
    users?: {
        id: number;
        username: string;
        email: string;
        role: string;
    } | null;
    posts?: {
        id: number;
        title: string;
        description: string;
        image_url: string;
    } | null;
    like_comments?: Array<{
        id: number;
        user_id: number | null;
        users?: {
            username: string;
        } | null;
    }>;
}

export class AdminCommentsController {
    // Middleware pour vérifier si l'utilisateur est admin 
    static async isAdmin(req: AuthenticatedRequest, res: Response, next: Function) {
        try {
            // Version Temporaire - A modifier quand le vrai middleware d'auth sera créer
            // Simule un admin connecté pour les tests
            if (req.user) {
                req.user = {
                    id: 1,
                    username: 'admin',
                    email: 'admin@test.com',
                    role: 'admin'
                };
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false, 
                    message: "Accès refusé. Droits administrateur requis.",
                }); 
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la vérification des droits administrateur",
                error: error instanceof Error ? error.message: "Erreur inconnue",
            }); 
        }
    }

    // Récupérer tous les commentaires avec filtres et pagination
    static async getAllComments (
        req: AuthenticatedRequest & { query: AdminCommentFilters },
        res: Response<ApiResponse<CommentWithFullRelations[]>>
    ) {
        try {
            const { user_id, post_id, search, page = '1', limit = '10' } = req.query; 
            
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit); 
            const skip = (pageNum - 1) * limitNum; 

            // Construction des filtres
            const where: any = {}; 

            if (user_id) {
                where.user_id = parseInt(user_id); 
            }

            if (post_id) {
                where.post_id = parseInt(post_id);
            }

            if (search) {
                where.commentaire = {
                    contains: search,
                    mode: 'insensitive',
                };
            }

            // Récupération avec pagination
            const [comments, total] = await Promise.all([
                prisma.commentaires.findMany({
                    where,
                    include: {
                        users: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                role: true,
                            },
                        },
                        posts: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                image_url: true,
                            },
                        },
                        like_comments: {
                            include: {
                                users: {
                                    select: {
                                        username: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                    skip,
                    take: limitNum,
                }),
                prisma.commentaires.count({ where }),
            ]);

            res.status(200).json({
                success: true,
                data: comments,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                }, 
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des commentaires",
                error: error instanceof Error ? error.message : "Erreur inconnue",
            });
        }
    }

    // Récupérer un commentaire spécifique avec toutes les informations
    static async getCommentById(
        req: AuthenticatedRequest & {params: CommentParams }, 
        res: Response<ApiResponse<CommentWithFullRelations>> 
    ) {
        try {
            const { id } = req.params;

            const comment = await prisma.commentaires.findUnique({
                where: { id: parseInt(id) }, 
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                        },
                    },
                    posts: {
                        select: {
                            id: true, 
                            title: true,
                            description: true,
                            image_url: true,
                        },
                    },
                    like_comments: {
                        include: {
                            users: {
                                select: {
                                    username: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: "Commentaire non trouvé",
                });
            }

            res.status(200).json({
                success: true,
                data: comment,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du commentaire",
                error: error instanceof Error ? error.message: "Erreur inconnue",
            }); 
        }
    }

    // Modifier n'importe quel commentaire (admin peut tout modifier)
    static async updateComment(
        req: AuthenticatedRequest & {
            params: CommentParams;
            body: AdminUpdateCommentRequest;
        },
        res: Response<ApiResponse<CommentWithFullRelations>>
    ) {
        try {
            const { id } = req.params;
            const { commentaire, user_id, post_id } = req.body;

            // Vérifier si le commentaire existe 
            const existingComment = await prisma.commentaires.findUnique({
                where: { id: parseInt(id) }, 
            });

            if (!existingComment) {
                return res.status(404).json({
                    success: false,
                    message: "Commentaire non trouvé",
                }); 
            }

            // Si user_id dest modifié, vérifier que l'utilisateur existe
            if (user_id && user_id !== existingComment.user_id) {
                const userExists = await prisma.users.findUnique({
                    where: { id: user_id },
                });

                if (userExists) {
                    return res.status(400).json({
                        success: false,
                        message: "Utilisateur spécifié non trouvé",
                    });
                }
            }

            // Si post_id est modifié, vérifier que le post existe
            if (post_id && post_id !== existingComment.post_id) {
                const postExists = await prisma.posts.findUnique({
                    where: { id: post_id }, 
                });

                if (!postExists) {
                    return res.status(400).json({
                        success: false,
                        message: "Post spécifié non trouvé", 
                    });
                }
            }

            const updatedComment = await prisma.commentaires.update({
                where: { id: parseInt(id) }, 
                data: {
                    ...(commentaire && { commentaire }),
                    ...(user_id && { user_id }), 
                    ...(post_id && { post_id }),
                    updated_at: new Date(), 
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            role: true,
                        },
                    },
                    posts: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            image_url: true,
                        },
                    },
                },
            });

    res.status(200).json({
        success: true,
        message: "Commentaire modifié avec succès",
        data: updatedComment,
      });
        } catch(error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification du commentaire",
                error: error instanceof Error ? error.message: "Erreur inconnue", 
            });
        }
    }

    // Supprimer n'importe quel commentaire
  static async deleteComment(
    req: AuthenticatedRequest & { params: CommentParams },
    res: Response<ApiResponse<void>>
  ) {
    try {
      const { id } = req.params;

      const existingComment = await prisma.commentaires.findUnique({
        where: { id: parseInt(id) },
        include: {
          users: { select: { username: true } },
          posts: { select: { title: true } },
        },
      });

      if (!existingComment) {
        return res.status(404).json({
          success: false,
          message: "Commentaire non trouvé",
        });
      }

      await prisma.commentaires.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        success: true,
        message: `Commentaire de ${existingComment.users?.username || 'utilisateur inconnu'} supprimé avec succès`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du commentaire",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Supprimer plusieurs commentaires en une fois
  static async deleteManyComments(
    req: AuthenticatedRequest & { body: { ids: number[] } },
    res: Response<ApiResponse<{ deletedCount: number }>>
  ) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Liste d'IDs de commentaires requise",
        });
      }

      const deleteResult = await prisma.commentaires.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      res.status(200).json({
        success: true,
        message: `${deleteResult.count} commentaire(s) supprimé(s) avec succès`,
        data: { deletedCount: deleteResult.count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression des commentaires",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Obtenir des statistiques sur les commentaires
  static async getCommentsStats(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ) {
    try {
      const [
        totalComments,
        commentsToday,
        commentsThisWeek,
        topCommenters,
        commentsByPost,
      ] = await Promise.all([
        // Total des commentaires
        prisma.commentaires.count(),
        
        // Commentaires aujourd'hui
        prisma.commentaires.count({
          where: {
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        
        // Commentaires cette semaine
        prisma.commentaires.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        
        // Top commentateurs
        prisma.commentaires.groupBy({
          by: ['user_id'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
        
        // Commentaires par post (top 5)
        prisma.commentaires.groupBy({
          by: ['post_id'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
      ]);

      // Récupérer les détails des top commentateurs
      const topCommentersDetails = await prisma.users.findMany({
        where: {
          id: { in: topCommenters.map(c => c.user_id).filter(Boolean) as number[] },
        },
        select: { id: true, username: true },
      });

      // Récupérer les détails des posts les plus commentés
      const topPostsDetails = await prisma.posts.findMany({
        where: {
          id: { in: commentsByPost.map(c => c.post_id).filter(Boolean) as number[] },
        },
        select: { id: true, title: true },
      });

      const stats = {
        totalComments,
        commentsToday,
        commentsThisWeek,
        topCommenters: topCommenters.map(commenter => ({
          user: topCommentersDetails.find(u => u.id === commenter.user_id),
          commentCount: commenter._count.id,
        })),
        topCommentedPosts: commentsByPost.map(post => ({
          post: topPostsDetails.find(p => p.id === post.post_id),
          commentCount: post._count.id,
        })),
      };

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Modérer un commentaire (marquer comme inapproprié ou approuvé)
  static async moderateComment(
    req: AuthenticatedRequest & {
      params: CommentParams;
      body: { action: 'approve' | 'flag' | 'hide' };
    },
    res: Response<ApiResponse<CommentWithFullRelations>>
  ) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (!['approve', 'flag', 'hide'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Action non valide. Utilisez 'approve', 'flag', ou 'hide'",
        });
      }

      const existingComment = await prisma.commentaires.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingComment) {
        return res.status(404).json({
          success: false,
          message: "Commentaire non trouvé",
        });
      }

      // Pour cet exemple, on peut ajouter un préfixe au commentaire pour indiquer son statut
      let moderatedContent = existingComment.commentaire;
      
      switch (action) {
        case 'flag':
          moderatedContent = `[SIGNALÉ] ${existingComment.commentaire}`;
          break;
        case 'hide':
          moderatedContent = `[MASQUÉ] ${existingComment.commentaire}`;
          break;
        case 'approve':
          // Retirer les préfixes existants
          moderatedContent = existingComment.commentaire
            .replace(/^\[SIGNALÉ\]\s*/, '')
            .replace(/^\[MASQUÉ\]\s*/, '');
          break;
      }

      const updatedComment = await prisma.commentaires.update({
        where: { id: parseInt(id) },
        data: {
          commentaire: moderatedContent,
          updated_at: new Date(),
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
          posts: {
            select: {
              id: true,
              title: true,
              description: true,
              image_url: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: `Commentaire ${action === 'approve' ? 'approuvé' : action === 'flag' ? 'signalé' : 'masqué'} avec succès`,
        data: updatedComment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modération du commentaire",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }
}