import { Router } from 'express';
import { TagController } from '../../Controler/TagControler';

const router = Router(); 

// Routes CRUD pour les tags 

router.post('/tags', TagController.createTag);
router.get('/tags', TagController.getAllTags); 
router.get('/tags/names', TagController.getTagNames);

// Routes de recherche par # 

router.get('/search', TagController.searchPostsByTag); 

// Routes pour la relation post-tags
router.post('/posts/:postId:tags', TagController.addTagToPost);
router.get('/posts/:postId/tags', TagController.getPostTags);
router.delete('/posts/:postId/tags/:tagId', TagController.removeTagFromPost);

// Route pour récupérer des posts par nom de tag 
router.get('/tags/:tagName/posts', TagController.getPostsByTagName);

export default router; 