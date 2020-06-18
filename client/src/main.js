import Vue from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import vuetify from './plugins/vuetify';

import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

// registering a component globally
import FormAlert from './components/Shared/FormAlert';

Vue.component('form-alert', FormAlert);

Vue.use(VueApollo);

// setup ApolloClient
export const defaultClient = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  // include auth token with request made to the backend
  fetchOptions: {
    credentials: 'include',
  },
  request: (operation) => {
    // if there is no token in local storage
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', '');
    }
    // authorization header to add a token to request we make
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token'),
      },
    });
  },

  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      console.log('networkError', networkError);
    }

    if (graphQLErrors) {
      graphQLErrors.forEach((err) => {
        console.dir(err);
        if (err.name === 'AuthenticationError') {
          store.commit('SET_AUTH_ERROR', err);
          localStorage.setItem('token', '');
        }
      });
    }
  },
});

const apolloProvider = new VueApollo({ defaultClient });

Vue.config.productionTip = false;

new Vue({
  apolloProvider,
  store,
  router,
  vuetify,
  render: (h) => h(App),
  created() {
    // get current user query
    this.$store.dispatch('getCurrentUser');
  },
}).$mount('#app');
