const mongoose = require('mongoose');
const md5 = require('md5');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  favorites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: true,
    },
  ],
});

// pre save hook
// use md5 package for creating random strings
userSchema.pre('save', function (next) {
  // u can check if the avatar field is empty
  // and then add an icon else
  // use the user avatar
  this.avatar = `http://gravatar.com/avatar/${md5(this.username)}?d=identicon`;
  next();
});

userSchema.pre('save', async function (next) {
  // only run this function if password
  // was Modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'favorites',
  });
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
