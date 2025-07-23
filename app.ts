
import express from "express"
import cors from "cors"
import usersRoutes from "./User/UsersRoutes"

const app = express()
const port = process.env.PORT || 3005; 

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRoutes)



app.listen(port, () => {
  console.log(`L'EntreDeux listening on port ${port}`)
  console.log(`Server running at http://localhost:${port}`)
})  