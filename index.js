import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import http from 'http'

import userRoutes from './routes/users.js'
import postsRoutes from './routes/posts.js'
import { getIdPostsSocket,subCommentPostSocket, likePostSocket, fetchPostExceptComment,commentPostSocket } from './handlesockets/posts.js'

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
  socket.removeAllListeners()
  console.log('We have a connection')
  socket.on('home', ({ }, callback) => {
    socket.join('home')
    callback({
      home: `joined home`
    });
  })

  socket.on('newPost', async ({ postId }, callback) => {
    
    const {error, post} = await fetchPostExceptComment(postId);
    
    socket.broadcast.to('home').emit('notification', { error,  post});
    callback();
  })

  socket.on('increSubCmt', async ({ idPost, i }, callback) => {
    
    io.to(idPost).emit('newSubCmt', { i });
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

  socket.on('send comment', async ({ email, idPost, data, prevId }, callback) => {
    // console.log(email, idPost, data, prevId)
    const { error, result } = await commentPostSocket(`${email}::: ${data}`, idPost, prevId)
    if (error) {
      return callback(error)
    }
    console.log(result)
    io.to(idPost).emit('comment', { result })

    callback()
  })

  socket.on('send subComment', async ({ email, idPost, data, prevId }, callback) => {
    // console.log(email, idPost, data, prevId)
    const { error, result } = await subCommentPostSocket(`${email}::: ${data}`, idPost, prevId)
    if (error) {
      return callback(error)
    }
    console.log(result)
    // // console.log(idComment)
    io.to(idPost).emit('subComment', { result })

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

