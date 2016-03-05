import {inject} from 'aurelia-framework';
import _ from 'lodash';
import {PostsData} from '../data/postsData';
import {SessionService} from '../services/sessionService';

@inject(PostsData, SessionService)
export class Home {
  constructor(postsData, sessionService) {
    this.postsData = postsData;
    this.postBox = {message: null, disabled: false};
    this.user = sessionService.getCurrentUser();
    this.posts = [];
  }

  activate() {
    this.getAllPosts();
  }

  getAllPosts() {
    // retrieve posts from server
    this.postsData.getAll()
      .then(response => response.json())
      .then(posts => {
        posts.forEach(function (post) {
          post.commentBox = {message: '', disabled: false};
          post.comments = post.comments || [];
        });
        this.posts = posts;
        this.subscribeWebSocketComments();
      }).catch(function(err) {
        console.error(err.message);
      });
  }

  createComment($event, post) {
    // submit the message in the comment box only if user hits 'Enter (keycode 13)'
    if ($event.which !== 13) {
      return;
    }

    // remove carriage return
    post.commentBox.message = post.commentBox.message.replace(/\n/g, '');

    // don't let the user type in blank lines or submit empty/whitespace only comment, or type in something when comment is being created
    if (!post.commentBox.message.length || post.commentBox.disabled) {
      return;
    }

    // disable the comment box and push the new comment to server
    post.commentBox.disabled = true;
    this.postsData.addComment(post.id, {message: post.commentBox.message})
      .then(response => response.json())
      .then(comment => {
        // only add the comment if we don't have it already in the post's comments list to avoid dupes
        if (!_.some(post.comments, function (c) {
          return c.id === comment.id;
        })) {
          post.comments.push({
            id: comment.id,
            from: this.user,
            message: post.commentBox.message,
            createdTime: new Date()
          });
        }

        // clear the comment field and enable it
        post.commentBox.message = '';
        post.commentBox.disabled = false;
      }).catch(function(err) {
        // don't clear the comment box but enable it so the user can re-try
        post.commentBox.disabled = false;
        console.error(err);
      });
  }

  // add post/comment creation functions to scope
  createPost($event) {
    // don't let the user type in blank lines or submit empty/whitespace only post, or type in something when post is being created
    if (!this.postBox.message.length || this.postBox.disabled) {
      $event.preventDefault();
      return;
    }

    // disable the post box and push the new post to server
    this.postBox.disabled = true;
    this.postsData.createPost({message: this.postBox.message})
      .then(response => response.json())
      .then(post => {
          // only add the post if we don't have it already in the posts list to avoid dupes
          if (!_.some(this.posts, function (p) {
            return p.id === post.id;
          })) {
            this.posts.unshift({
              id: post.id,
              from: this.user,
              message: this.postBox.message,
              createdTime: new Date(),
              comments: [],
              commentBox: {message: '', disabled: false}
            });
          }

          // clear the post box and enable it
          this.postBox.message = '';
          this.postBox.disabled = false;
        })
        .catch(function(err) {
          // don't clear the post box but enable it so the user can re-try
          this.postBox.disabled = false;
          console.error(err);
        });
  }

  // subscribe to websocket events to receive new posts, comments, etc.
  subscribeWebSocketComments() {
    let posts = this.posts;

    this.postsData.subscribe(function(dataType, data) {
      if(dataType === "comment") {
        // only add the comment if we don't have it already in the post's comments list to avoid dupes
        let post = _.find(posts, function (p) {
          return p.id === data.postId;
        });

        // only add the comment if we don't have it already in the post's comments list to avoid dupes
        if (post && !_.some(post.comments, function (c) {
          return c.id === data.id;
        })) {
          post.comments.push(data);
        }
      }else if(dataType === "post") {
        // only add the post if we don't have it already in the posts list to avoid dupes
        if (!_.some(posts, function (p) {
          return p.id === data.id;
        })) {
          data.comments = [];
          data.commentBox = {message: '', disabled: false};
          posts.unshift(data);
        }
      }
    });
  }
}
