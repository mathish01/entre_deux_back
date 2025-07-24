import { Router } from 'express';
import { AdminCommentsController } from '../../Controler/AdminCommentsControler'
const router = Router(); 


router.use(/* authMiddleware, */ AdminCommentsController.isAdmin);


router.get('/', /* authMiddleware, */ AdminCommentsController.getAllComments);


router.get('/stats', /* authMiddleware, */ AdminCommentsController.getCommentsStats);


router.get('/:id', /* authMiddleware, */ AdminCommentsController.getCommentById);


router.put('/:id', /* authMiddleware, */ AdminCommentsController.updateComment);


router.delete('/:id', /* authMiddleware, */ AdminCommentsController.deleteComment);


router.delete('/', /* authMiddleware, */ AdminCommentsController.deleteManyComments);


router.patch('/:id/moderate', AdminCommentsController.moderateComment);

export default router;