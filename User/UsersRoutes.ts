import { Router } from "express"
import { getUsers, createUser, updateUser, deleteUser } from "../Controler/UsersController"

const router = Router()

router.get("/", getUsers)
router.post("/", createUser)
router.put("/:id", updateUser) 
router.delete("/", deleteUser)

export default router