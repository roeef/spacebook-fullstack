var mongoose = require('mongoose');

//design the two schema below and use sub docs 
//to define the relationship between posts and comments


var commentSchema = new mongoose.Schema({
    user: {type:String, required:true},
    text: {type:String, required:true},
    // createdAt: Date; TODO
},{usePushEach: true});


var postSchema = new mongoose.Schema({
    text: {type:String, required:true},
    comments: [commentSchema]
},{usePushEach: true});

var Post = mongoose.model('post', postSchema)

module.exports = Post
