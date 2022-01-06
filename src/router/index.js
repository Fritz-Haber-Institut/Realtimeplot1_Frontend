import Vue from 'vue'
import VueRouter from 'vue-router'
import Axios from 'axios'
import General from '../subclasses/general.js';

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/'
  },
  { path: '/', component: Home, meta: { requiresAuth: false, title: "Home Page", icon: "mdi-home-outline" } },
  { path: '/login', component: Login, meta: { requiresAuth: false, title: "Login", icon: "mdi-information-outline" } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true, title: "Dashboard", icon: "mdi-information-outline" } },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    Axios
      .get(General.APIUsers() + '/current', General.GetHeaderValue(General.GetLSSettings().Token, true))
      .then(() => {
        next();
      })
      .catch((Error) => {
        console.log(Error);
        window.location.href = '/login';
      });
  }
  else {
    next()
  }
})

export default router
