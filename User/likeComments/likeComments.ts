import {Router} from "express"
import { getLikeComments, createLikeComments, deleteLikeComments} from '../../Controler/LikeCommentsController'

const router = Router()

router.get("/",  getLikeComments);
router.post ("/", createLikeComments);
router.delete("/:id", deleteLikeComments);

export default router
