import PostMessage from '../models/postMessage.js'
import mongoose from 'mongoose'

export const getPosts = async (req, res) => {
    try{
        const posts = await PostMessage.find().sort( { _id: -1 } ).select({ subComments: 0, comments: 0 });
        posts.forEach(post => post.comments = [])
        res.status(200).json(posts || []);
    } catch(error){
        res.status(404).json({message: error.message})
    }
}

export const fetchPostComment = async (req, res) => {
    const {id} = req.params;
    try{
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No id');
    
        const post = await PostMessage.findById(id).select({ creator: 0, message: 0, selectedFile: 0, likes: 0 });
    
        res.status(200).json(post.comments)

    }catch(error){
        res.status(404).json({message: error.message});
    }
}

export const fetchSubCommentOfPost = async (req, res) => {
    const {idPost, idComment} = req.params;
    // console.log('vao', idComment)
    try{
        if(!mongoose.Types.ObjectId.isValid(idPost)) return res.status(404).send('No id');
    
        const post = await PostMessage.findById(idPost).select({ creator: 0, message: 0, selectedFile: 0, likes: 0 });
        
        const result = post.subComments.filter(subCmt => String(subCmt.prevCommentId) === String(idComment));
        // console.log(result, post.subComments);
        res.status(200).json(result)

    }catch(error){
        res.status(404).json({message: error.message});
    }
}



export const createPost = async (req, res) => {
    const body = req.body;
    
    
    const newPost = new PostMessage(body);

    try{
        await newPost.save();

        // const posts = await PostMessage.find().sort( { _id: -1 } );
        res.status(200).json(newPost);
    }catch(error){
      
        res.status(409).json({message: error.message})
    }
}

export const deletePost = async (req, res) => {
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No id');

    await PostMessage.findByIdAndRemove(id);

    res.status(200).json({message: 'success'})
}

export const likePost = async (req, res) => {
    try{
        const {id} = req.params;

    if(!req.userId) return res.json({message: 'Không xác thực'})
    
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No id');

    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex(id => id === String(req.email))

    if(index === -1){
        post.likes.push(req.email)
    }else{
        post.likes = post.likes.filter(id => id !==String(req.email))
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post , {new: true})

    res.status(200).json(updatedPost)
    }catch(error){
        res.status(404).json({message: error.message})
    }
}

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    const post = await PostMessage.findById(id);

    post.comments.push(value);

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
};