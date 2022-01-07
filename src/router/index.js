import Vue from 'vue'
import VueRouter from 'vue-router'
import Axios from 'axios'
import General from '../subclasses/general.js';

import Login from '../views/Login.vue'

import Profile from '../views/Profile.vue'
import Dashboard from '../views/Dashboard.vue'
import Accounts from '../views/Accounts.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/login'
  },
  { path: '/login', component: Login, meta: { requiresAuth: false, title: "Login", icon: "mdi-information-outline" } },
  
  { path: '/profile', component: Profile, meta: { requiresAuth: true, title: "My Profile",button:"Update My Profile", icon: "mdi-information-outline" } },  
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true, title: "Dashboard", icon: "mdi-information-outline" } },
  { path: '/accounts', component: Accounts, meta: { requiresAuth: true, title: "Accounts", icon: "mdi-information-outline" } },  
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
