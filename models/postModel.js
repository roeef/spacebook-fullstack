let mongoose = require('mongoose');

//design the two schema below and use sub docs 
//to define the relationship between posts and comments


let commentSchema = new mongoose.Schema({
    user: {type:String, required:true},
    text: {type:String, required:true},
    // createdAt: Date; TODO
},{usePushEach: true});


let postSchema = new mongoose.Schema({
    text: {type:String, required:true},
    comments: [commentSchema]
},{usePushEach: true});

let Post = mongoose.model('post', postSchema);

module.exports = Post;
