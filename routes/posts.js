import express from 'express'
import {getPosts, commentPost, createPost, deletePost, likePost} from '../controllers/posts.js'
import auth from '../middleware/auth.js'
const router = express.Router()

router.get('/',auth, getPosts)
router.post('/',auth, createPost)
router.delete('/:id',auth, deletePost)
router.patch('/:id/likePost',auth, likePost)
router.post('/:id/commentPost', commentPost);

export default router;