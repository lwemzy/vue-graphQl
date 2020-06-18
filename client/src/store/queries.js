import { gql } from 'apollo-boost';

/* post queries*/

export const GET_POSTS = gql`
  query {
    getPosts {
      _id
      title
      imageUrl
    }
  }
`;

export const GET_USER_POSTS = gql`
query ($userId: ID!){
  getUserPosts(userId: $userId){
      _id
    title
    imageUrl
    description
    categories
    createdDate
    likes
  }
}
`;

export const INFINITE_SCROLL = gql`
  query($pageNum: Int!, $pageSize: Int!) {
    infiniteScrollPosts(pageNum: $pageNum, pageSize: $pageSize) {
      posts {
        _id
        title
        imageUrl
        categories
        description
        createdDate
        likes
        createdBy {
          _id
          username
          avatar
        }
        messages {
          _id
        }
      }
      hasMore
    }
  }
`;

export const GET_POST = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      _id
      title
      imageUrl
      categories
      description
      createdDate
      likes
      # createdBy {
      #   _id
      #   username
      #   avatar
      # }
      messages {
        _id
        messagesBody
        messageDate
        messageUser {
          _id
          username
          avatar
        }
      }
    }
  }
`;

export const ADD_POST_MESSAGE = gql`
  mutation($msg: String!, $userId: ID!, $postId: ID!) {
    addPostMessage(msg: $msg, userId: $userId, postId: $postId) {
      _id
      messagesBody
      messageDate
      messageUser {
        _id
        username
        avatar
      }
    }
  }
`;

export const ADD_POST = gql`
  mutation(
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
    $createdID: ID!
  ) {
    addPost(
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
      createdID: $createdID
    ) {
      _id
      title
      imageUrl
      categories
      description
    }
  }
`;

export const LIKE_POST = gql`
  mutation($postId: ID!, $username: String!) {
    likePost(postId: $postId, username: $username) {
      likes
      favorites {
        _id
        title
        imageUrl
      }
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation($postId: ID!, $username: String!) {
    unlikePost(postId: $postId, username: $username) {
      likes
      favorites {
        _id
        title
        imageUrl
      }
    }
  }
`;

export const SEARCH_POST = gql`
  query($searchTerm: String) {
    searchPost(searchTerm: $searchTerm) {
      _id
      title
      description
      imageUrl
      likes
    }
  }
`;

export const SIGN_IN_USER = gql`
  mutation($username: String!, $password: String!) {
    signInUser(username: $username, password: $password) {
      token
    }
  }
`;

export const SIGN_UP_USER = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    signUpUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query {
    getUser {
      _id
      username
      email
      avatar
      joinDate
      favorites {
        _id
        title
        imageUrl
      }
    }
  }
`;
