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

export const fetchPostExceptComment = async (postId) => {
    try{
        if(!mongoose.Types.ObjectId.isValid(postId)) return {error: 'Invalid post'}
    
        const post = await PostMessage.findById(postId);
        post._doc.lengCmt = post.comments.length + post.subComments.length;;
        return {post};

    }catch(error){
        return {error: 'Invalid post'}
    }
}

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

export const commentPostSocket = async (messageOfUser, postId, prevId) => {

    try {
        
        const post = await PostMessage.findById(postId);
        const cache = {
            data: messageOfUser,
            prevId: prevId || 'root'
        }
        const res = post.comments.push(cache);
        const result = post.comments[Number(res) -1];
        // console.log(idComment);
        const updatedPost = await PostMessage.findByIdAndUpdate(postId, post, { new: true });
        
        return {result}
    } catch (e) {
        return { error: 'Bài viết này hiện đã không tồn tại' }
    }
};

export const subCommentPostSocket = async (messageOfUser, postId, prevId) => {
    // console.log(prevId);
    try {
        
        const post = await PostMessage.findById(postId);
        let index = -1;
        //find in root comment
        for(let i = 0; i<post.comments.length;i++){
            // console.log(post.comments[i]._id)
            if(String(post.comments[i]._id) === String(prevId)){
                index = i;
            }
        }
        // console.log('root', index);
        if(index !== -1){
            post.comments[index].totalSubcomment +=1;
            const cache = {
                data: messageOfUser,
                prevCommentId: post.comments[index]._id,
            };
            let res = post.subComments.push(cache);
            const result = post.subComments[res-1];
            await PostMessage.findByIdAndUpdate(postId, post, { new: true });

            return {result};
        }
        //find in subComments
        for(let i = 0; i<post.subComments.length;i++){
            if(post.subComments[i]._id === String(prevId)){
                index = i;
            }
        }
        // console.log('sub', index)
        if(index !== -1){
            post.subComments[index].totalSubcomment +=1;
            const cache = {
                data: messageOfUser,
                prevCommentId: post.comments[index]._id,
            };
            let res = post.subComments.push(cache);
            const result = post.subComments[res-1];
            await PostMessage.findByIdAndUpdate(postId, post, { new: true });
            return {result};
        }
        return { error: 'Bài viết này hiện đã không tồn tại' }
    } catch (e) {
        return { error: 'Bài viết này hiện đã không tồn tại' }
    }
};