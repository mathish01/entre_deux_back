
// import express from "express"
// import cors from "cors"
// import usersRoutes from "./User/UsersRoutes"
// import postsRoutes from "./User/Posts/postsRoutes"
// import commentRoutes from './User/Comments/commentsRoutes'
// import tagRoutes from './User/Tag/tagRoutes'
// import likePostsRoutes from './User/LikePosts/likePostsRoutes'
// import likeCommentsRoutes from './User/likeComments/likeComments'
// const app = express()
// const port = process.env.PORT || 3005; 

// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
// }))

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// app.use('/users', usersRoutes)
// app.use('/posts', postsRoutes);
// app.use('/tag', tagRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/likePosts',likePostsRoutes );
// app.use('/likeComments',likeCommentsRoutes);

// app.use('/api/tags', tagRoutes)
// app.use('/api/comments', commentRoutes)

// app.listen(port, () => {
//   console.log(`L'EntreDeux listening on port ${port}`)
//   console.log(`Server running at http://localhost:${port}`)
// })  

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Chargement .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

// Middlewares globaux
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 Routes
import usersRoutes from "./User/UsersRoutes";
import authRoutes from "./User/AuthRoutes";
import postsRoutes from "./User/Posts/postsRoutes";
import commentRoutes from './User/Comments/commentsRoutes';
import tagRoutes from './User/Tag/tagRoutes';
import likePostsRoutes from './User/likePosts/likePostsRoutes';
import likeCommentsRoutes from './User/likeComments/likeComments';

// Routes API
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/like-posts', likePostsRoutes);
app.use('/api/like-comments', likeCommentsRoutes);

// Serveur
app.listen(port, () => {
  console.log(`✅ L'EntreDeux API lancée sur http://localhost:${port}`);
});
