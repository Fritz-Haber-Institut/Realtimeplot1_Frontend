import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../views/Login.vue'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/'
  },
  { path: '/', component: Home, meta: { requiresAuth: false } },  
  { path: '/login', component: Login, meta: { requiresAuth: false } },
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
    window.location.replace('/');
  }
  else {
    next()
    console.log(Vue.prototype.$General.GetLSSettings())
  }
})

export default router
