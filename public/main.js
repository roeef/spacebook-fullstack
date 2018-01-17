let SpacebookApp = function() {

    let posts = [];
    let visibleCommentsPostsIdx = [];


    getPostsAndRender();
    function getPostsAndRender() {
        console.log("getPostsAndRender - request");
        $.ajax({
            method: "GET",
            url: "/posts",
            success: function (data) {
                console.log("getPostsAndRender - success");
                posts = data;
                _renderPosts();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    }

    let $posts = $(".posts");

    _renderPosts();

    function _renderPosts() {
        $posts.empty();
        let source = $('#post-template').html();
        let template = Handlebars.compile(source);
        for (let i = 0; i < posts.length; i++) {
            let newHTML = template(posts[i]);
            console.log("_renderPosts()",newHTML);
            $posts.append(newHTML);
            _renderComments(i)
        }
    }

    function addPost(newPost) {
        $.ajax({
            method: "POST",
            url: "/posts",
            data: {text:newPost, comments:[]},
            success: function (returnedPostWithDBId) {
                posts.push(returnedPostWithDBId);
                _renderPosts();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    }


    function _renderComments(postIndex) {
        let post = $(".post")[postIndex];
        let $commentsList = $(post).find('.comments-list');
        $commentsList.empty();
        let source = $('#comment-template').html();
        let template = Handlebars.compile(source);
        for (let i = 0; i < posts[postIndex].comments.length; i++) {
            let newHTML = template(posts[postIndex].comments[i]);
            $commentsList.append(newHTML);
        }
    }

    let removePost = function(index) {
        $.ajax({
            method: "DELETE",
            url: `/posts/${posts[index]._id}`,
            success: function (data) {
                posts.splice(index, 1);
                _renderPosts();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    };

    let addComment = function(newComment, postIndex) {
        $.ajax({
            method: "POST",
            url: `/posts/${posts[postIndex]._id}/comments`,
            data: newComment,
            success: function (returnedPostWithDBId) {
                posts[postIndex] = returnedPostWithDBId;
                _renderComments(postIndex);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    };


    let deleteComment = function(postIndex, commentIndex) {
        $.ajax({
            method: "DELETE",
            url: `/posts/${posts[postIndex]._id}/comments/${posts[postIndex].comments[commentIndex]._id}`,
            success: function (data) {
                posts[postIndex].comments.splice(commentIndex, 1);
                _renderComments(postIndex);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    };

    let editComment = function (postIndex, commentIndex, newValue, onSuccessCallBack){
        let currentComment = posts[postIndex].comments[commentIndex];
        currentComment.text = newValue;

        $.ajax({
            method: "PUT",
            url: `/posts/${posts[postIndex]._id}/comments/${posts[postIndex].comments[commentIndex]._id}`,
            data:currentComment ,
            success: function (data) {
                onSuccessCallBack();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });

    };

    let editPost = function (postIndex, newValue, onSuccessCallBack){
        let currentPost = posts[postIndex];
        currentPost.text = newValue;

        $.ajax({
            method: "PUT",
            url: `/posts/${posts[postIndex]._id}`,
            data:currentPost,
            success: function (data) {
                onSuccessCallBack();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });

    };
    
    return {
        addPost: addPost,
        editPost: editPost,
        removePost: removePost,
        addComment: addComment,
        editComment: editComment,
        deleteComment: deleteComment,
    };
};

let app = SpacebookApp();


$('#addpost').on('click', function() {
    let $input = $("#postText");
    if ($input.val() === "") {
        alert("Please enter text!");
    } else {
        app.addPost($input.val());
        $input.val("");
    }
});

let $posts = $(".posts");

$posts.on('click', '.remove-post', function() {
    let index = $(this).closest('.post').index();
    app.removePost(index);
});

$posts.on('click', '.toggle-comments', function() {
    let $clickedPost = $(this).closest('.post');
    $clickedPost.find('.comments-container').toggle("slow");
});

$posts.on('click', '.add-comment', function() {

    let $comment = $(this).siblings('.comment');
    let $user = $(this).siblings('.name');

    if ($comment.val() === "" || $user.val() === "") {
        alert("Please enter your name and a comment!");
        return;
    }

    let postIndex = $(this).closest('.post').index();
    let newComment = { text: $comment.val(), user: $user.val() };

    app.addComment(newComment, postIndex);

    $comment.val("");
    $user.val("");

});

$posts.on('click', '.remove-comment', function() {
    let postIndex = $(this).closest('.post').index();
    let commentIndex = $(this).closest('.comment').index();

    app.deleteComment(postIndex, commentIndex);
});

$posts.on('click', '.edit-post', function() {
    // Hide Edit&Comment, Show Input&Save
    let $edit_post_input = $(this).siblings(".edit-post-input");
    let $post_text = $(this).siblings(".post-text");
    $edit_post_input.val($post_text.text());

    $(this).closest('.post').find('.edit-post-toggle').toggle("slow");
});

$posts.on('click', '.edit-comment', function() {
    // let $commentsList = $(this).closest('.post').find('.comments-list');

    // Hide Edit&Comment, Show Input&Save
    let $edit_comment_input = $(this).siblings(".edit-post-input");
    let $comment_text = $(this).siblings(".comment-text");
    $edit_comment_input.val($comment_text.text());

    $(this).closest('.comment').find('.edit-toggle').toggle("slow");
});

$posts.on('click', '.cancel-edit-comment', function() {
    $(this).closest('.comment').find('.edit-toggle').toggle("slow");
});

$posts.on('click', '.cancel-edit-post', function() {
    $(this).closest('.post').find('.edit-post-toggle').toggle("slow");
});

$posts.on('click', '.save-comment', function() {
    let postIndex = $(this).closest('.post').index();
    let commentIndex = $(this).closest('.comment').index();

    let text = $(this).siblings(".edit-comment-input").val();
    if (text) {
        let commentText = $(this).siblings(".comment-text");
        let toggleItems = $(this).closest('.comment').find('.edit-toggle');
        app.editComment(postIndex, commentIndex, text, function() {
            commentText.text(text);
            toggleItems.toggle("slow");
        });
    } else {
        // TODO PUT Validation error and message for the user
    }
});

$posts.on('click', '.save-post', function() {
    let postIndex = $(this).closest('.post').index();

    let text = $(this).siblings(".edit-post-input").val();
    if (text) {
        let postText = $(this).siblings(".post-text");
        let toggleItems = $(this).closest('.post').find('.edit-post-toggle');
        app.editPost(postIndex, text, function() {
            postText.text(text);
            toggleItems.toggle("slow");
        });
    } else {
        // TODO PUT Validation error and message for the user
    }
});

