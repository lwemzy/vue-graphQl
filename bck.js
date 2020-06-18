const {ApolloServer, gql} = require('apollo-server');

const port = process.env.PORT || 3000;

const todos = [
  {
    task: 'Nash Car',
    completed: false,
  },
  {
    task: 'Go to the bank',
    completed: true,
  }
];

// type definations for the diffrent types of data with in our application
const typeDefs = gql`

type Todo {
  task: String
  completed: Boolean
}

type Query {
  getTodos: [Todo]
}

type Mutation {
  addTodo(task: String, completed: Boolean): Todo
}

`;

const resolvers = {
  // query to return a get
  Query: {
    getTodos: () => todos
  },

  Mutation: {
    // add data to the todo
    // {task, completed} === input values from client
    addTodo(_, {task, completed}) {
      const todo = {task, completed};
      todos.push(todo);
      return todo;
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(port).then(({url}) => {
  console.log(`Server listening ${url}`);
});
