const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }

}, { timestamps: true })

const Posts = mongoose.model("post", PostSchema)
module.exports = Posts;