const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  faveUser: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [
    {
      messagesBody: {
        type: String,
        required: true,
      },

      messageDate: {
        type: Date,
        default: Date.now,
      },

      messageUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
    },
  ],
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
  }).populate({
    path: 'messages.messageUser',
  });

  next();
});

// creating an index to search on all fields of the post
// postSchema.index({
//   '$**': 'text',
// });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
