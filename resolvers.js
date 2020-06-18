const jwt = require('jsonwebtoken');

// containing functionality for CRUD operations

function signToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

module.exports = {
  Query: {
    async getUser(_, __, { User, currentUser }) {
      const user = await User.findById(currentUser);
      return user;
    },
    async getPosts(_, __, { Post }) {
      const posts = await Post.find({}).sort('-createdDate');
      console.log(posts);
      return posts;
    },

    async getUserPosts(_, { userId }, { Post }) {
      const posts = await Post.find({ createdBy: userId });

      return posts;
    },

    async getPost(_, { postId }, { Post }) {
      const post = await Post.findById(postId);

      if (!post) {
        throw new Error("Post doesn't exist on this server");
      }

      return post;
    },
    // page pagination;
    async infiniteScrollPosts(_, { pageNum, pageSize }, { Post }) {
      const skip = (pageNum - 1) * pageSize;
      const posts = await Post.find()
        .sort('-createdDate')
        .skip(skip)
        .limit(pageSize);

      const totalDocs = await Post.countDocuments();
      const hasMore = totalDocs > pageSize * pageNum;

      return { posts, hasMore };
    },

    async searchPost(_, { searchTerm }, { Post }) {
      if (!searchTerm) throw new Error('Please provide a search term');

      const results = await Post.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } }
      )
        .sort('-textScore')
        .sort('-likes')
        .limit(5);

      return results;
    },
  },

  Mutation: {
    async signUpUser(_, { username, email, password }, { User }) {
      const user = await User.findOne({ username });
      if (user) {
        throw new Error('User already exists');
      }
      const newUser = await User.create({
        username,
        email,
        password,
      });

      return { token: signToken(newUser._id) };
    },

    async updateUserPost(
      _,
      { postId, userId, title, imageUrl, categories, description },
      { Post }
    ) {
      const updatedPost = await Post.findOneAndUpdate(
        { _id: postId, createdBy: userId },
        { title, imageUrl, categories, description },
        { new: true, useFindAndModify: false }
      );

      return updatedPost;
    },

    async deletePost(_, { postId }, { Post }) {
      const deletedPost = await Post.findByIdAndDelete(postId);
      if (!deletedPost) throw new Error("post can't be deleted");

      // its should return null
      return deletedPost;
    },

    async addPost(
      _,
      { title, imageUrl, categories, description, createdID },
      { Post }
    ) {
      const post = await Post.create({
        title,
        imageUrl,
        categories,
        description,
        createdBy: createdID,
      });

      return post;
    },

    async addPostMessage(_, { msg, userId, postId }, { Post }) {
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        // prepend to the beginning of array
        {
          $push: {
            messages: {
              $each: [
                {
                  messagesBody: msg,
                  messageUser: userId,
                },
              ],
              $position: 0,
            },
          },
        },

        // return a fresh documents
        { new: true, useFindAndModify: false }
      );

      if (!post) throw new Error("post doesn't exist");

      return post.messages[0];
    },

    async signInUser(_, { username, password }, { User }) {
      if (!username || !password)
        return new Error('Please provide email or password');

      const user = await User.findOne({ username }).select('+password');

      if (!user || !(await user.correctPassword(password))) {
        return new Error('Wrong username or password');
      }

      return { token: signToken(user._id) };
    },

    async likePost(_, { postId, username }, { Post, User }) {
      // find a post
      // increment the likes of the post
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { likes: 1 },
        },
        { new: true, useFindAndModify: false }
      );

      if (!post) throw new Error('Post not found');

      // find user
      // add post id to favorites array
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: postId } },
        { new: true, useFindAndModify: false }
      );

      if (!user) throw new Error('User not found');

      // return post likes and user likes
      return { likes: post.likes, favorites: user.favorites };
    },

    async unlikePost(_, { postId, username }, { Post, User }) {
      // find a post
      // increment the likes of the post
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { likes: -1 },
        },
        { new: true, useFindAndModify: false }
      );

      if (!post) throw new Error('Post not found');

      // find user
      // remove post id to favorites array
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: postId } },
        { new: true, useFindAndModify: false }
      );

      if (!user) throw new Error('User not found');

      // return post likes and user likes
      return { likes: post.likes, favorites: user.favorites };
    },
  },
};
