import Vue from 'vue'
import VueRouter from 'vue-router'
import Axios from 'axios'
import General from '../subclasses/general.js';

import Login from '../views/Login.vue'

import Profile from '../views/Profile.vue'
// import PVs from '../views/PVs.vue'
import ExperimentsAndPVs from '../views/Experiments-and-PVs.vue'
import Dashboard from '../views/Dashboard.vue'
import Chart from '../views/Chart.vue'
// import Accounts from '../views/Accounts.vue'
import Users from '../views/Users.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/login'
  },
  { path: '/login', component: Login, meta: { Auth: 'NO', title: General.GetString('login'), icon: "mdi-information-outline" } },
  { path: '/profile', component: Profile, meta: { Auth: 'ALL', title: General.GetString('profile'), button: General.GetString('update'), icon: "mdi-account" } },
  { path: '/dashboard', component: Dashboard, meta: { Auth: 'ALL', title: General.GetString('dashboard'), icon: "mdi-home" } },
  { path: '/chart', component: Chart, meta: { Auth: 'ALL', title: General.GetString('dashboard'), icon: "mdi-chart-line" } },
  { path: '/experiments', component: ExperimentsAndPVs, meta: { Auth: 'ALL', title: General.GetString('experimentsTitle'), icon: "mdi-camera-document" } },
  { path: '/pvs', component: ExperimentsAndPVs, meta: { Auth: 'ALL', title: General.GetString('pvsTitle'), icon: "mdi-file-chart-outline" } },
  { path: '/users', component: Users, meta: { Auth: 'ADMIN', title: General.GetString('manageusers'), icon: "mdi-account-multiple-outline" } }
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
  Axios
    .get(General.APIUsers() + '/current', General.GetHeaderValue(General.GetLSSettings().Token, true))
    .then((Result) => {
      if (to.matched.some(record => record.meta.Auth == 'ALL')) {
        if (Result.data.user.user_type == 'Admin' || Result.data.user.user_type == 'User') {
          next()
        }
        else {
          window.location.href = '/login';
        }
      }
      else if (to.matched.some(record => record.meta.Auth == 'ADMIN')) {
        if (Result.data.user.user_type == 'Admin') {
          next()
        }
        else {
          window.location.href = '/login';
        }
      }
      else {
        next();
      }
    })
    .catch((Error) => {
      console.log(Error);
      if (to.matched.some(record => record.meta.Auth == 'NO')) {
        next()
      }
      else {
        window.location.href = '/login';
      }
    });
})

export default router