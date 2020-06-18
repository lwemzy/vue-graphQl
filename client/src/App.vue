<template>
  <v-app>
    <!--Navigation Drawer -->
    <v-navigation-drawer app temporary fixed v-model="drawer">
      <v-toolbar color="accent" dark flat>
        <v-btn icon @click="toggleNav">
          <v-icon>mdi-backburger</v-icon>
        </v-btn>
        <router-link to="/" tag="span" style="cursor: pointer;">
          <h1 class="title pl-3">vueshare</h1>
        </router-link>
      </v-toolbar>
      <v-divider></v-divider>

      <!-- side nav links -->

      <v-list>
        <template v-if="!loggedInUser">
          <v-list-item
            v-for="(item, index) in navItems"
            :key="index"
            :to="item.link"
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>

        <template v-else>
          <v-list-item
            v-for="(item, index) in loggedInNavItems"
            :key="index"
            :to="item.link"
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!-- sign out -->
          <v-list-item @click="signOut">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Sign Out</v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar fixed color="primary" dense dark>
      <v-app-bar-nav-icon @click="toggleNav"></v-app-bar-nav-icon>
      <!-- <v-toolbar-title class="hidden-xs-only"> -->
      <v-toolbar-items>
        <v-btn text to="/">vueshare</v-btn>
      </v-toolbar-items>
      <!-- </v-toolbar-title> -->
      <v-spacer></v-spacer>

      <!-- search box -->
      <v-text-field
        v-model="searchValue"
        @input="searchPost(searchValue)"
        prepend-icon="mdi-magnify"
        placeholder="Search posts"
        single-line
      ></v-text-field>

      <!-- results card -->
      <v-card v-if="searchResult.length" id="search__card">
        <v-list>
          <v-list-item
            @click="goToResult(result._id)"
            v-for="result in searchResult"
            :key="result._id"
          >
            <v-list-item-title>
              {{ result.title }}
              -
              <span>{{ formatDescription(result.description) }}</span>
            </v-list-item-title>
            <v-list-item-action v-if="checkIfFave(result._id)">
              <v-icon>mdi-heart-outline</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>

      <v-spacer></v-spacer>

      <v-toolbar-items class="hidden-xs-only">
        <template v-if="!loggedInUser">
          <v-btn
            text
            v-for="item in navItems"
            :key="item.title"
            :to="item.link"
          >
            <v-icon left class="hidden-sm-only">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-btn>
        </template>

        <!-- profile button -->
        <template v-else>
          <v-btn text to="/posts">
            <v-icon left class="hidden-sm-only">mdi-post</v-icon>Posts
          </v-btn>
          <v-btn text to="/profile">
            <v-icon class="hidden-sm-only" left>mdi-account</v-icon>
            <v-badge
              right
              color="blue darken-2"
              :class="{ bounce: badgeAnimated }"
            >
              <span slot="badge" v-if="userFavorites.length">{{
                userFavorites.length
              }}</span>
              profile
            </v-badge>
          </v-btn>
          <v-btn text @click="signOut">
            <v-icon left class="hidden-sm-only">mdi-logout</v-icon>Sign Out
          </v-btn>
        </template>
      </v-toolbar-items>
    </v-app-bar>
    <v-content>
      <v-container fluid class="mt-7">
        <!-- adding transitions -->
        <transition name="fade">
          <router-view />
        </transition>
        <!-- auth snack bat -->
        <v-snackbar
          v-model="isAuth"
          :timeout="5000"
          color="success"
          bottom
          left
        >
          You have been logged in as
          <v-btn text @click="isAuth = false">Close</v-btn>
        </v-snackbar>

        <v-snackbar
          v-if="getAuthError"
          v-model="isAuthError"
          :timeout="5000"
          color="info"
          bottom
          left
        >
          {{ getAuthError.message }}
          <v-btn text @click="isAuth = false">Close</v-btn>
        </v-snackbar>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';

  export default {
    name: 'App',
    data() {
      return {
        isAuth: false,
        isAuthError: false,
        drawer: null,
        badgeAnimated: false,
        searchValue: '',
        navItems: [
          {
            icon: 'mdi-post',
            title: 'Posts',
            link: '/posts',
          },
          {
            icon: 'mdi-login',
            title: 'Sign In',
            link: '/login',
          },
          {
            icon: 'mdi-logout',
            title: 'Sign Up',
            link: '/signup',
          },
        ],
        loggedInNavItems: [
          {
            icon: 'mdi-post',
            title: 'Posts',
            link: '/posts',
          },
          {
            icon: 'mdi-pencil',
            title: 'Create Post',
            link: '/post/add',
          },
          {
            icon: 'mdi-account',
            title: 'Profile',
            link: '/profile',
          },
        ],
      };
    },
    computed: {
      ...mapGetters([
        'searchResult',
        'loggedInUser',
        'getAuthError',
        'userFavorites',
      ]),
    },
    watch: {
      loggedInUser(newValue, oldValue) {
        // console.log("new value", newValue);
        // console.log("old value", oldValue);
        if (oldValue === null) {
          this.isAuth = true;
        }
      },
      isAuthError(value) {
        if (value !== null) {
          this.isAuthError = true;
        }
      },
      userFavorites(value) {
        if (value) {
          this.badgeAnimated = !this.badgeAnimated;
          setTimeout(() => {
            this.badgeAnimated = !this.badgeAnimated;
          }, 1000);
        }
      },
    },
    methods: {
      ...mapActions(['signOut', 'searchPost']),
      ...mapMutations(['CLEAR_RESULT']),
      toggleNav() {
        this.drawer = !this.drawer;
      },
      formatDescription(val) {
        return val.length > 20 ? `${val.slice(0, 10)}...` : val;
      },
      goToResult(id) {
        this.searchValue = '';
        this.$router.push(`/post/${id}`);
        // clear search results
        this.CLEAR_RESULT();
      },
      checkIfFave(id) {
        return (
          this.userFavorites && this.userFavorites.some((val) => val._id === id)
        );
      },
    },
  };
</script>

<style scoped>
  #search__card {
    position: absolute;
    width: 100vw;
    z-index: 1;
    top: 100%;
    left: 0;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition-property: all;
    transition-duration: 0.25s;
  }

  .fade-enter-active {
    transition-delay: 0.25s;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0;
    transform: translateX(-25px);
  }

  .bounce {
    animation: bounce 1s both;
  }

  @keyframes bounce {
    0%,
    20%,
    53%,
    80%,
    100% {
      transform: translate3d(0, 0, 0);
    }

    40%,
    43% {
      transform: translate3d(0, -20px, 0);
    }

    70% {
      transform: translate3d(0, -10px, 0);
    }

    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
</style>
