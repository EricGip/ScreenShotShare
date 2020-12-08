import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

import SignUpPage from "../views/SignUpPage.vue";
import AlbumDetailPage from "../views/AlbumDetailPage.vue";
import AlbumsPage from "../views/AlbumsPage.vue";
import { Auth } from 'aws-amplify';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: "/signup",
    name: "SignUpPage",
    component: SignUpPage
  },
  {
    path: '/album/:id',
    name: 'AlbumDetailPage',
    component: AlbumDetailPage,
    // meta information for our middleware down there. 
    meta: {requiresAuth: true}
  },
  {
    path: "/albums",
    name: AlbumsPage,
    component: AlbumsPage,
    meta: {requiresAuth: true}
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// vue documentation router guard for authorized account -- basically auth middleware 

// everytime we go to a route, do something
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = await Auth.currentUserInfo();

  // if we don't require auth, and they are authenticated, go next. if not, go to home "/". 
  if (requiresAuth && !isAuthenticated) {
    next("/");
  } else {
    next()
  }
})

export default router
