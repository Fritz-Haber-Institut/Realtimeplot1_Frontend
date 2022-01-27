import Vue from 'vue'
import VueRouter from 'vue-router'
import Axios from 'axios'
import General from '../subclasses/general.js';

import Login from '../views/Login.vue'

import Profile from '../views/Profile.vue'
// import PVs from '../views/PVs.vue'
import ExperimentsAndPVs from '../views/Experiments-and-PVs.vue'
import Dashboard from '../views/Dashboard.vue'
// import Accounts from '../views/Accounts.vue'
import Users from '../views/Users.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/login'
  },
  { path: '/login', component: Login, meta: { requiresAuth: false, title: General.GetString('login'), icon: "mdi-information-outline" } },

  { path: '/profile', component: Profile, meta: { requiresAuth: true, title: General.GetString('profile'), button: General.GetString('update'), icon: "mdi-information-outline" } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true, title: General.GetString('dashboard'), icon: "mdi-information-outline" } },
  // { path: '/pvs', component: PVs, meta: { requiresAuth: true, title: General.GetString('managepvs'), icon: "mdi-information-outline" } }, 
  { path: '/experiments-and-pvs', component: ExperimentsAndPVs, meta: { requiresAuth: true, title: General.GetString('managepvs'), icon: "mdi-information-outline" } },
  // { path: '/accounts', component: Accounts, meta: { requiresAuth: true, title: General.GetString('manageusers'), icon: "mdi-information-outline" } },
  { path: '/users', component: Users, meta: { requiresAuth: true, title: General.GetString('manageusers'), icon: "mdi-information-outline" } },
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
