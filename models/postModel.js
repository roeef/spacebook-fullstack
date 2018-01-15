var mongoose = require('mongoose');

//design the two schema below and use sub docs 
//to define the relationship between posts and comments


var commentSchema = new mongoose.Schema({

});


var postSchema = new mongoose.Schema({

});

var Post = mongoose.model('post', postSchema)

module.exports = Post
