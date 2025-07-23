// routes posts
// import express, { Request, Response } from 'express'
// import {PrismaClient} from '@prisma/client';

// const prisma = new PrismaClient();
// const router = express.Router();

// //route GET

// router.get('/', async (req: Request, res: Response) =>{

//     try{
//         const posts = await prisma.posts.findMany();
//         res.json(posts);
//     } catch(error){
//         res.status(500).json({error: 'Attention erreur serveur -_-'})
//     }
// });

import {Router} from "express"
import { getPosts, createPosts} from '../../Controler/PostsControler'

const router = Router()

router.get("/", getPosts)
router.post ("/", createPosts)

export default router


// import { Router } from "express"
// import { getUsers, createUser } from "../Controler/UserController"

// const router = Router()

// router.get("/", getUsers)
// router.post("/", createUser)

// export default router