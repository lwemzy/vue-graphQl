import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home';

// @ is an alias to /src
import AddPosts from '@/components/Posts/AddPosts';
import Posts from '@/components/Posts/Posts';
import Post from '@/components/Posts/Post';
import Profile from '@/components/Auth/Profile';
import Login from '@/components/Auth/Login';
import Signup from '@/components/Auth/Signup';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/post/add',
    name: 'AddPosts',
    component: AddPosts,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/:postId',
    name: 'post',
    component: Post,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/posts',
    name: 'Posts',
    component: Posts,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

// executed before executing each route action
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('token');
  if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
    // redirect to home page
    next('/');
  }
  // move to next route
  next();
});

export default router;
