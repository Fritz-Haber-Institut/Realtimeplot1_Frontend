import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueSweetalert2 from 'vue-sweetalert2';
import VueApexCharts from 'vue-apexcharts'
import General from '../src/subclasses/general.js';
import Moment from 'moment';

// CSS Files
import 'sweetalert2/dist/sweetalert2.min.css';

// Prototypes
Vue.prototype.$Axios = axios
Vue.prototype.$General = General
Vue.prototype.$Moment = Moment

// Vue Usage
Vue.use(VueSweetalert2);
Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)

Vue.config.productionTip = false

if (Vue.prototype.$General.GetLSSettings() == null) {
  var LS = new Object();
  LS.Token = null;
  Vue.prototype.$General.SetLSSettings(LS);
}

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
