import express from 'express';
const app = express()
import cors from "cors"

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));







const port = process.env.PORT || 3005; 



app.listen(port, () => {
  console.log(`Adalicious Backend listening on port ${port}`)
  console.log(`Server running at http://localhost:${port}`)
})