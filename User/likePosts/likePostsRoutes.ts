import {Router} from "express"
import { getLikePosts, createLikePosts, deleteLikePosts} from '../../Controler/likePostsController'

const router = Router()

router.get("/", getLikePosts);
router.post ("/", createLikePosts);
router.delete("/:id", deleteLikePosts);

export default router
