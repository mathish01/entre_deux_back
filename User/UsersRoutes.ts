import { Router } from "express"
import { getUsers, createUser } from "../Controler/UserController"

const router = Router()

router.get("/", getUsers)
router.post("/", createUser)

export default router