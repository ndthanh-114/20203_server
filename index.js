import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import http from 'http'

import userRoutes from './routes/users.js'
import postsRoutes from './routes/posts.js'
import { getIdPostsSocket, likePostSocket, commentPostSocket } from './handlesockets/posts.js'

const ENDPOINT = 'http://localhost:3000/'
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  }
})

app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())

io.on('connect', socket => {
  console.log('We have a connection')
  socket.on('home', ({ }, callback) => {
    socket.join('home')
    callback({
      home: `joined home`
    });
  })

  socket.on('newPost', ({ email }, callback) => {
    socket.broadcast.to('home').emit('notification', { text: `Có bài đăng mới từ ${email}` });
    callback();
  })


  socket.on('join', async ({ postId, user }, callback) => {
    if (!user) return callback({
      error: "Lỗi"
    });
    try {

      // const clients = io.of('/').sockets;
      // const allSockets = [ ...clients.keys() ];
      // // console.log(clients);
      // let count =0;
      // for (let key of clients){
      //     count++;
      //     key[1].join(post._id)
      // }
      // allSockets.forEach(sk => sk.join(post._id))
      socket.join(postId)
      callback({
        post: `joined ${postId}`
      });
    } catch (e) {
      console.log(e)
      callback({
        error: "Lỗi join"
      });
    }
  })

  socket.on('joinB', async ({ postId, user }, callback) => {
    if (!user) return callback({
      error: "Lỗi"
    });
    try {
      socket.join(postId)
      callback({
        post: `joined ${postId}`
      });
    } catch (e) {
      console.log(e)
      callback({
        error: "Lỗi join"
      });
    }
  })

  // socket.on('send like', async ({userId, postId}, callback) => {
  //   if(!userId || !postId) return callback({error: 'No id or No user'})
  //   const newLikes = await likePostSocket(user?.result?._id, post._id)
  //   console.log(user?.result?._id, post._id)
  //   // console.log(newLikes)
  //   io.to(post._id).emit('likes', {newLikes: newLikes})

  //   callback()
  // })

  socket.on('send comment', async ({ email, idPost, comment }, callback) => {
    const { error } = await commentPostSocket(`${email}: ${comment}`, idPost)
    if (error) {
      return callback(error)
    }
    io.to(idPost).emit('comment', { newComment: `${email}: ${comment}` })

    callback()
  })

  socket.on('disconnect', () => {
    console.log('user has left')
  })

})

app.use('/posts', postsRoutes)
app.use('/', userRoutes)
app.get('/', (req, res) => {
  res.send('App is running')
})

const CONNECTION_URL= 'mongodb+srv://admin:admin123@cluster0.sblvb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
// const CONNECTION_URL = 'mongodb://localhost:27017/mydbname'
const PORT = process.env.PORT || 5000

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
  .then(() => server.listen(PORT, () => console.log('Server running...')))
  .catch((error) => console.log(error.message))

