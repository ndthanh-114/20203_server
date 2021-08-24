import mongoose from 'mongoose'

const customComment = mongoose.Schema({
    data: {
        type: String,
        default: ''
    },
    prevCommentId: {
        type: String,
        default: ''
    }, 
    totalSubcomment: {
        type: Number,
        default: 0
    }
});


const postSchema = mongoose.Schema({
    creator: String,
    message: {
        type: String,
        default: ''
    },
    selectedFile: {
        type: [Object],
        default: []
    },
    likes: {
        type: [String], 
        default: []
    },
    comments: { 
        type: [customComment], 
        default: [] 
    },
    subComments: {
        type: [customComment], 
        default: [] 
    },
    createdAt: {
        type: Date,
        default: new Date().toUTCString()
    }
})

export default mongoose.model("PostMessage", postSchema)