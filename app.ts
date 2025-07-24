
import express from "express"
import cors from "cors"
import usersRoutes from "./User/UsersRoutes"
import postsRoutes from "./User/Posts/postsRoutes"
import commentRoutes from './User/Comments/commentsRoutes'
import tagRoutes from './User/Tag/tagRoutes'
import likePostsRoutes from './User/likePosts/likePostsRoutes'
const app = express()
const port = process.env.PORT || 3005; 

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/users', usersRoutes)
app.use('/posts', postsRoutes);
<<<<<<< HEAD
app.use('/tag', tagRoutes);
app.use('/api/comments', commentRoutes);
app.use('/likePosts',likePostsRoutes );

=======
app.use('/api/tags', tagRoutes)
app.use('/api/comments', commentRoutes)
>>>>>>> a3a142a5901c10bdb9bbd766026a26c63c09250c

app.listen(port, () => {
  console.log(`L'EntreDeux listening on port ${port}`)
  console.log(`Server running at http://localhost:${port}`)
})  