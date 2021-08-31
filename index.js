import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import http from 'http'

import userRoutes from './routes/users.js'
import postsRoutes from './routes/posts.js'
import { getIdPostsSocket, subCommentPostSocket, likePostSocket, fetchPostExceptComment, commentPostSocket } from './handlesockets/posts.js'

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

  socket.on("set username", (username) => {
    socket.username = username;
  });

  socket.on('newPost', async ({ postId }, callback) => {

    const { error, post } = await fetchPostExceptComment(postId);

    socket.broadcast.to('home').emit('notification', { error, post });
    callback();
  })

  socket.on('increSubCmt', async ({ idPost, i, idComment, idSubCmt }, callback) => {

    io.to('home').emit('newSubCmt', { idPost, i, idComment, idSubCmt });
    callback(true);
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

  // socket.on('joinB', async ({ postId, user }, callback) => {
  //   if (!user) return callback({
  //     error: "Lỗi"
  //   });
  //   try {
  //     socket.join(postId)
  //     callback({
  //       post: `joined ${postId}`
  //     });
  //   } catch (e) {
  //     console.log(e)
  //     callback({
  //       error: "Lỗi join"
  //     });
  //   }
  // })

  // socket.on('send like', async ({userId, postId}, callback) => {
  //   if(!userId || !postId) return callback({error: 'No id or No user'})
  //   const newLikes = await likePostSocket(user?.result?._id, post._id)
  //   console.log(user?.result?._id, post._id)
  //   // console.log(newLikes)
  //   io.to(post._id).emit('likes', {newLikes: newLikes})

  //   callback()
  // })

  socket.on('send comment', async ({ email, idPost, data, prevId, indexPost }, callback) => {
    // console.log("postID", idPost, " data", data)

    const { error, result } = await commentPostSocket(`${email}::: ${data}`, idPost, prevId)
    if (error) {
      return callback(error)
    }
    // console.log(socket?.adapter?.rooms)
    // io.to(idPost).emit('comment', { result, idPost })
    io.to('home').emit('comment', { result, idPost, indexPost })

    callback()
  })

  socket.on('send interaction', async ({ email, idPost, data, prevId, indexPost, dataCmtPrev, type, indexOfSubCmt, idCmtPrev }, callback) => {
    const { error, post } = await fetchPostExceptComment(idPost)
    if (error) {
      return callback(error)
    }
    const mySet = new Set()
    const count = io.engine.clientsCount;
    // console.log(count)
    if (count === 0) return;
    else {
      for (let i = 0; i < post.likes.length; i++) {
        mySet.add(post.likes[i])
      }
      for (let i = 0; i < post.comments.length; i++) {
        mySet.add(post.comments[i].data.split(':::')[0]);
      }
      for (let i = 0; i < post.subComments.length; i++) {
        mySet.add(post.subComments[i].data.split(':::')[0]);
      }
      // console.log(mySet);
    }
    mySet.delete(email)
    // console.log(mySet);
    const clients = io.of('/').sockets;
    const allSockets = [...clients.keys()];

    for (let key of clients) {
      const { username, ...info } = key[1]?.username
      // console.log(username);
      if (mySet.has(username)) {
        // console.log(key[1].id)
        if (type === "COMMENT") {
          socket.broadcast.to(key[1].id).emit('interaction', { title: post?.message, email, data, indexPost, type });
        } else if (type === "SUB_COMMENT") {
          socket.broadcast.to(key[1].id).emit('interaction', { title: post?.message, email, data, indexPost, idCmtPrev, type, dataCmtPrev, indexOfSubCmt });
        }
      }
    }
    // allSockets.forEach(sk => sk.join(post._id))
    callback()
  })

  socket.on('send likeInteraction', async ({ email, indexPost, idPost, title, data, isLike }, callback) => {
    const { error, post } = await fetchPostExceptComment(idPost)
    if (error) {
      return callback(error)
    }
    if (!isLike) {
      return callback();
    }
    const mySet = new Set()
    const count = io.engine.clientsCount;
    // console.log(count)
    if (count === 0) return;
    else {
      for (let i = 0; i < post.likes.length; i++) {
        mySet.add(post.likes[i])
      }
      for (let i = 0; i < post.comments.length; i++) {
        mySet.add(post.comments[i].data.split(':::')[0]);
      }
      for (let i = 0; i < post.subComments.length; i++) {
        mySet.add(post.subComments[i].data.split(':::')[0]);
      }
      // console.log(mySet);
    }
    mySet.delete(email)
    // console.log(mySet);
    const clients = io.of('/').sockets;
    const allSockets = [...clients.keys()];

    for (let key of clients) {
      const { username, ...info } = key[1]?.username
      // console.log(username);
      if (mySet.has(username)) {
        // console.log(key[1].id)
        socket.broadcast.to(key[1].id).emit('interaction', { title, email, data, indexPost, type: "LIKE" });
      }
    }
    // allSockets.forEach(sk => sk.join(post._id))
    callback()
  })

  socket.on('send subComment', async ({ email, idPost, data, prevId, i }, callback) => {
    // console.log(email, idPost, data, prevId)
    const { error, result } = await subCommentPostSocket(`${email}::: ${data}`, idPost, prevId)
    if (error) {
      return callback(error)
    }
    // console.log(result)
    // // console.log(idComment)
    io.to('home').emit('subComment', { result, index: i, idPost })

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

