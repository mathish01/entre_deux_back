import { Router } from 'express';
import { CommentController } from '../../Controler/commentsControler';

const router = Router()

/*
Récupère tous les commentaire d'un post spécifique
Routes Public donc pas besoin d'authentification pour lires les commentaires : 
*/
router.get('/post/:postId', CommentController.getCommentsByPost)

/*
Récupère tous les commentaires de l'utilisateur connecté 
Nécessite une authentification 
*/

router.get('/user', /* authMiddleware, */ CommentController.getUserComments); 

/*
Créer un nouveau commentaire
Nécessite une authentification  
*/

router.post('/', /* authMiddleware, */ CommentController.createComment); 

/* 
Modifie un commentaire existant
Nécessite une authentification + être le propriétaire du commentraire 
*/

router.put('/:id', /* authMiddleware, */ CommentController.updateComment); 

/* 
Supprimer un commentaire
Nécessite une authentification + être le propriétaire du commentaire
*/

router.delete('/:id', /* authMiddleware, */ CommentController.deleteComment ); 

export default router; 