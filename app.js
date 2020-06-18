const { ApolloServer, AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const resolvers = require('./resolvers');

const User = require('./models/User');
const Post = require('./models/Post');

const port = process.env.PORT || 3000;

const filePath = path.join(__dirname, 'typeDefs.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');

dotenv.config({
  path: './.config',
});

async function getUser(token) {
  if (!token) return;

  try {
    return await jwt.verify(token, process.env.JWT_SECRET).id;
  } catch (error) {
    throw new AuthenticationError('Your session has expired');
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError(error) {
    return {
      name: error.name,
      message: error.message.replace('Context creation failed: ', ''),
    };
  },
  async context({ req }) {
    const token = req.headers.authorization;
    return { User, Post, currentUser: await getUser(token) };
  },
});

// connect to mongo db
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('connected to mongoDB'))
  .catch((err) => console.log(err));

server.listen(port).then(({ url }) => {
  console.log(`Server listening ${url}`);
});
