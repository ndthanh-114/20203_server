import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

import userRoutes from './routes/users.js'
import postsRoutes from './routes/posts.js'
const app = express()


app.use(bodyParser.json({ limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}))
app.use(cors())

app.use('/posts', postsRoutes)
app.use('/', userRoutes)
app.get('/', (req, res) => {
    res.send('App is running')
})

const CONNECTION_URL= 'mongodb+srv://admin:admin123@cluster0.sblvb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5000

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true})
    .then(() => app.listen(PORT, () => console.log('Server running...')))
    .catch((error) => console.log(error.message))

