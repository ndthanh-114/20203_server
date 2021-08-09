import PostMessage from '../models/postMessage.js'
import mongoose from 'mongoose'

export const getIdPostsSocket = async () => {
    try {
        const posts = await PostMessage.find().sort({ _id: -1 });
        let idPosts = []

        posts.forEach(post => idPosts.push(post._id))
        return idPosts;
    } catch (error) {
        console.log(error)
    }
}

// export const createPost = async (req, res) => {
//     const body = req.body;


//     const newPost = new PostMessage(body);

//     try{
//         await newPost.save();

//         // const posts = await PostMessage.find().sort( { _id: -1 } );
//         res.status(200).json(newPost);
//     }catch(error){

//         res.status(409).json({message: error.message})
//     }
// }

// export const deletePost = async (req, res) => {
//     const {id} = req.params;

//     if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No id');

//     await PostMessage.findByIdAndRemove(id);

//     res.status(200).json({message: 'success'})
// }

export const likePostSocket = async (userLikeId, postId) => {


    if (!mongoose.Types.ObjectId.isValid(postId)) return { error: 'No id' };

    const post = await PostMessage.findById(postId);

    const index = post.likes.findIndex(id => id === String(userLikeId))

    if (index === -1) {
        post.likes.push(userLikeId)
    } else {
        post.likes = post.likes.filter(id => id !== String(userLikeId))
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(postId, post, { new: true })

    return updatedPost.likes
}

export const commentPostSocket = async (messageOfUser, postId) => {

    try {
        const post = await PostMessage.findById(postId);

        post.comments.push(messageOfUser);

        const updatedPost = await PostMessage.findByIdAndUpdate(postId, post, { new: true });

        return updatedPost
    } catch (e) {
        return { error: 'Bài viết này hiện đã không tồn tại' }
    }
};