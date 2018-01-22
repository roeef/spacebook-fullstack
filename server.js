let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

mongoose.connect(process.env.CONNECTION_STRING||'mongodb://localhost/spacebookDB',{useMongoClient:true}, function() {
    console.log("DB connection established!!!");
});

let Post = require('./models/postModel');

let app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.listen(process.env.PORT || '8080', function() {
    console.log("what do you want from me! get me on 8000 ;-)");
});

// You will need to create 5 server routes
// These will define your API:
// 1) to handle getting all posts and their comments
app.get('/posts', function (req,res){
    Post.find(function (err, posts) {
        if (err) {
            res.err = err;
            res.send(err);
        }
        res.send(posts);
    })
});

// 2) to handle adding a post
app.post('/posts', function (req,res){
    console.log("app.post");
    let post = new Post(req.body);
    post.save();
    res.send(post);
});

// 3) to handle deleting a post

app.delete('/posts/:id', function (req,res){
    Post.findByIdAndRemove(req.params.id, function (error,post) {
        res.send(post);
    });
});

// 4) to handle adding a comment to a post
app.post('/posts/:id/comments', function (req,res){
    Post.findById(req.params.id, function (error,post) {
        if (!post.comments) {
            posts.comments = [];
        }
        // NOTE!: for mongoose to support this way of push you need to {usePushEach: true} to the schema defenition
        post.comments.push(req.body);
        post.save(function(err, product, number) {
            res.send(post);
        });
    });
});



// 5) to handle deleting a comment from a post

app.delete('/posts/:postId/comments/:commentId', function (req,res) {
    Post.findByIdAndUpdate(req.params.postId,{$pull: { comments:{_id: req.params.commentId}}}, function (error, post) {
        console.log(error, post);
        res.send(post);
    });
});


// Edit comment
app.put('/posts/:postId/comments/:commentId', function (req,res){
    Post.update({ '_id':req.params.postId, 'comments._id': req.params.commentId },{ $set: {'comments.$': req.body}},
        function (error, affectedObjNum) {
            res.send(affectedObjNum);
        }
    );
});


// Edit Post
app.put('/posts/:postId', function (req,res){
    Post.update({ '_id':req.params.postId},{ $set: req.body},
        function (error, affectedObjNum) {
            res.send(affectedObjNum);
        }
    );
});