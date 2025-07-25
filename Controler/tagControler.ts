import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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

interface CreateTagRequest {
  name: string;
}

interface AddTagToPostRequest {
  tagName: string;
}

interface SearchRequest {
  q: string;
}

interface TagParams {
  id: string;
  postId: string;
  tagId: string;
  tagName: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface TagWithRelations {
  id: number;
  name: string;
  created_at: Date | null;
  post_tags?: Array<{
    id: number;
    post_id: number;
    tag_id: number;
    posts: {
      id: number;
      title: string;
      description: string;
    };
  }>;
}

interface PostWithRelations {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: Date | null;
  users?: {
    id: number;
    username: string;
  } | null;
  post_tags?: Array<{
    id: number;
    tag: {
      id: number;
      name: string;
    };
  }>;
}

export class TagController {
  // Créer un nouveau Tag unique
  static async createTag(
    req: AuthenticatedRequest & { body: CreateTagRequest },
    res: Response<ApiResponse<TagWithRelations>>
  ) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Le nom du tag est requis",
        });
      }

      // Normaliser le nom du tag (minuscules, sans #)
      const normalizedName = name.tolowerCase().replace("#", "");

      // Vérifier si le tag existe déjà
      const existingTag = await prisma.references_tags.findUnique({
        where: { name: normalizedName },
      });

      if (existingTag) {
        return res.status(409).json({
          success: false,
          message: "Ce tag existe déjà",
          data: existingTag,
        });
      }

      const newTag = await prisma.references_tags.create({
        data: {
          name: normalizedName,
        },
      });

      res.status(201).json({
        success: true,
        message: "Tag créé avec succès",
        data: newTag,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du tag",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Récupérer tous les tags

  static async getAllTags(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<TagWithRelations[]>>
  ) {
    try {
      const tags = await prisma.references_tags.findMany({
        include: {
          post_tags: {
            include: {
              posts: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des tags",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Récupérer tous les noms de tags (pour suggestions/autocomplétion)
  static async getTagNames(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<string[]>>
  ) {
    try {
      const tags = await prisma.references_tags.findMany({
        select: {
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      const tagNames = tags.map((t) => t.name);

      res.status(200).json({
        success: true,
        data: tagNames,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des noms de tags",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Ajouter un tag à un post (réutilise ou crée le tag)
  static async addTagToPost(
    req: AuthenticatedRequest & {
      params: TagParams;
      body: AddTagToPostRequest;
    },
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { postId } = req.params;
      const { tagName } = req.body;

      if (!tagName) {
        return res.status(400).json({
          success: false,
          message: "le nom du tag est requis",
        });
      }

      // Vérifier que le post existe
      const post = await prisma.posts.findUnique({
        where: { id: parseInt(postId) },
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post non trouvé",
        });
      }

      // Normaliser le nom du tag
      const normalizedName = tagName.tolowerCase().replace("#", "");

      // Trouver ou créer le tag
      let tag = await prisma.references_tags.findUnique({
        where: { name: normalizedName },
      });

      if (!tag) {
        tag = await prisma.references_tags.create({
          data: { name: normalizedName },
        });
      }

      // Vérifier si l'association existe déjà
      const existingAssociation = await prisma.post_tags.findUnique({
        where: {
          post_id_tag_id: {
            post_id: parseInt(postId),
            tag_id: tag.id,
          },
        },
      });

      if (existingAssociation) {
        return res.status(409).json({
          success: false,
          message: "ce tag est déjà associé à ce post",
        });
      }

      // Créer l'association
      const association = await prisma.post_tags.create({
        data: {
          post_id: parseInt(postId),
          tag_id: tag.id,
        },
        include: {
          tag: true,
          posts: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Tag ajouté au post avec succès",
        data: association,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors l'ajout du tag au post",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Récupéerer tous les tags d'un post
  static async getPostTags(
    req: AuthenticatedRequest & { params: TagParams },
    res: Response<ApiResponse<any[]>>
  ) {
    try {
      const { postId } = req.params;

      const postTags = await prisma.post_tags.findMany({
        where: { post_id: parseInt(postId) },
        include: {
          tag: true,
        },
        orderBy: {
          tag: {
            name: "asc",
          },
        },
      });

      res.status(200).json({
        success: true,
        data: postTags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des tags du post",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Supprimer un tag d'un post
  static async removeTagFromPost(
    req: AuthenticatedRequest & { params: TagParams },
    res: Response<ApiResponse<void>>
  ) {
    try {
      const { postId, tagId } = req.params;

      const association = await prisma.post_tags.findUnique({
        where: {
          post_id_tag_id: {
            post_id: parseInt(postId),
            tag_id: parseInt(tagId),
          },
        },
      });

      if (!association) {
        return res.status(404).json({
          success: false,
          message: "Assocication tag-post non trouvée",
        });
      }

      await prisma.post_tags.delete({
        where: {
          post_id_tag_id: {
            post_id: parseInt(postId),
            tag_id: parseInt(tagId),
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Tag supprimé du post avec succès",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du tag du post",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Recherche des posts par tag (#Paris --> tous les posts avec le tag "paris")
  static async searchPostsByTag(
    req: AuthenticatedRequest & { query: SearchRequest },
    res: Response<ApiResponse<PostWithRelations[]>>
  ) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Paramètre de recherche requis",
        });
      }

      // Vérifier si la recherche commence par #
      if (!q.startsWith("#")) {
        return res.status(400).json({
          success: false,
          message: "La recherche doit commencer par # pour rechercher des tags",
        });
      }

      // Ectraire le nom du tag (sans le #)
      const tagName = q.substring(1).toLocaleLowerCase();

      // Rechercher les posts qui ont ce tag
      const posts = await prisma.posts.findMany({
        where: {
          post_tags: {
            some: {
              tag: {
                name: {
                  contains: tagName,
                  mode: "insensitive",
                },
              },
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
            },
          },
          post_tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      res.status(200).json({
        success: true,
        message: `${posts.length} post(s) trouvé(s) pour #${tagName}`,
        data: posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la rechercher par tag",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  // Récupère tous les posts qui ont un tag spécifique (par nom de tag)
  static async getPostsByTagName(
    req: AuthenticatedRequest & { params: TagParams },
    res: Response<ApiResponse<PostWithRelations[]>>
  ) {
    try {
      const { tagName } = req.params;

      const posts = await prisma.posts.findMany({
        where: {
          post_tags: {
            some: {
              tag: {
                name: tagName.toLocaleLowerCase(),
              },
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
            },
          },
          post_tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des posts par tag",
        error: error instanceof Error ? error.message : "Erreur inconnue ",
      });
    }
  }
}
