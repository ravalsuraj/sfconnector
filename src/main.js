import Vue from 'vue'
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbvue/build/css/mdb.css';
import App from './App.vue'
//import router from './router'
import store from './store/store'
import VueSocketIO from 'vue-socket.io'
import { CONFIG } from '@/config.js'
import Notifications from 'vue-notification'

Vue.use(Notifications)

Vue.config.productionTip = false
// connection: "https://cticonnector.oberoirealty.com:8080",
//connection: "https://104.211.95.34:8080",
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: CONFIG.SOCKET_URL,
    vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
    }
  })
)
//Used for displaying global notifications
Vue.use(Notifications)

new Vue({
  // router,
  store,
  render: h => h(App)
}).$mount('#app')
