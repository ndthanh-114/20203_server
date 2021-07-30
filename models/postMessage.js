import mongoose from 'mongoose'

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
    comments: { type: [String], default: [] },
    createdAt: {
        type: Date,
        default: new Date().toUTCString()
    }

})

export default mongoose.model("PostMessage", postSchema)