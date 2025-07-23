import {Router} from "express"
import { getPosts, createPosts, updatePosts, deletePosts} from '../../Controler/PostsControler'

const router = Router()

router.get("/", getPosts);
router.post ("/", createPosts);
router.put("/:id", updatePosts);
router.delete("/:id", deletePosts);

export default router


