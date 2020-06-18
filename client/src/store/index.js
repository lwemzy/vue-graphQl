import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as apolloClient } from '@/main';
import {
  GET_POSTS,
  SIGN_IN_USER,
  GET_CURRENT_USER,
  SIGN_UP_USER,
  ADD_POST,
  SEARCH_POST,
  GET_USER_POSTS,
} from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    carouselPosts: [],
    userPosts: [],
    searchedResult: [],
    user: null,
    isLoading: false,
    error: null,
    authError: null,
  },

  mutations: {
    CAROUSEL_POSTS: (state, payload) => {
      state.carouselPosts = payload;
    },
    CURRENT_USER: (state, payload) => {
      state.user = payload;
    },
    SEARCH_RESULT: (state, payload) => {
      if (payload !== null) state.searchedResult = payload;
    },
    USER_POSTS: (state, payload) => {
      if (payload !== null) state.userPosts = payload;
    },
    CLEAR_RESULT: (state) => (state.searchedResult = []),
    SET_ERROR: (state, payload) => (state.error = payload),
    SET_AUTH_ERROR: (state, payload) => (state.authError = payload),
    SET_LOADING: (state, payload) => (state.isLoading = payload),
  },

  getters: {
    getCarouselPosts: (state) => state.carouselPosts,
    postsByUser: (state) => state.userPosts,
    searchResult: (state) => state.searchedResult,
    loggedInUser: (state) => state.user,
    isLoaded: (state) => state.isLoading,
    userFavorites: (state) => state.user && state.user.favorites,
    getError: (state) => state.error,
    getAuthError: (state) => state.authError,
  },

  actions: {
    async searchPost({ commit }, payload) {
      const { data } = await apolloClient.query({
        query: SEARCH_POST,
        variables: {
          searchTerm: payload,
        },
      });

      if (data) commit('SEARCH_RESULT', data.searchPost);
    },
    async getPosts({ commit }) {
      try {
        commit('SET_LOADING', true);

        const { data } = await apolloClient.query({
          query: GET_POSTS,
        });

        if (data) commit('SET_LOADING', false);
        commit('CAROUSEL_POSTS', data.getPosts);
      } catch (error) {
        commit('SET_LOADING', false);
        console.error(error);
      }
    },

    async getUserPosts({ commit }, payload) {
      try {
        const { data } = await apolloClient.query({
          query: GET_USER_POSTS,
          variables: {
            userId: payload,
          },
        });

        if (data) commit('USER_POSTS', data.getUserPosts);
      } catch (error) {
        console.error(error);
      }
    },

    async signIn({ commit }, payload) {
      localStorage.setItem('token', '');
      commit('SET_ERROR', '');
      commit('SET_LOADING', true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: SIGN_IN_USER,
          variables: payload,
        });

        if (data) {
          commit('SET_LOADING', false);
          // store token in local storage
          localStorage.setItem('token', data.signInUser.token);
          location.reload();
        }
      } catch (error) {
        commit('SET_ERROR', error);
        commit('SET_LOADING', false);
        console.error(error);
      }
    },

    async signUp({ commit }, payload) {
      localStorage.setItem('token', '');
      commit('SET_ERROR', '');
      commit('SET_LOADING', true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: SIGN_UP_USER,
          variables: payload,
        });

        if (data) {
          commit('SET_LOADING', false);
          localStorage.setItem('token', data.signUpUser.token);
          location.reload();
        }
      } catch (error) {
        commit('SET_ERROR', error);
        commit('SET_LOADING', false);
        console.error(error);
      }
    },

    async getCurrentUser({ commit }) {
      commit('SET_LOADING', true);

      try {
        const { data } = await apolloClient.query({
          query: GET_CURRENT_USER,
        });

        commit('CURRENT_USER', data.getUser);

        commit('SET_LOADING', false);
      } catch (error) {
        commit('SET_LOADING', false);
        location.reload();
        console.dir(error);
      }
    },

    async signOut({ commit }) {
      try {
        // user in state
        commit('CURRENT_USER', null);
        //remove token from local storage
        localStorage.clear();
        // end session
        await apolloClient.resetStore();

        location.reload();
      } catch (error) {
        console.error(error);
      }
    },

    async addPost({ commit }, payload) {
      commit('SET_ERROR', '');
      commit('SET_LOADING', true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: ADD_POST,
          variables: payload,
          // used for updating ui
          update(cache, { data: { addPost } }) {
            // First read the query you want to update
            const data = cache.readQuery({ query: GET_POSTS });
            // Create updated data
            data.getPosts.unshift(addPost);
            // Write updated data back to query
            console.log(data);
            cache.writeQuery({
              query: GET_POSTS,
              data,
            });
          },
          // optimistic response ensures data is added immediately as we specified for the update function
          optimisticResponse: {
            __typename: 'Mutation',
            addPost: {
              // post cos it refers to the post model
              __typename: 'Post',
              _id: -1,
              ...payload,
            },
          },
        });

        if (data) {
          // console.log(data.addPost);
        }
      } catch (error) {
        commit('SET_ERROR', error);
        commit('SET_LOADING', false);
        console.error(error);
      }
    },
  },
  modules: {},
});
