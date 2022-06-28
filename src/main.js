import Vue from 'vue'
import App from './App.vue'
import vuetify from "@/plugins/vuetify";
import "vuetify/dist/vuetify.min.css";
import router from "./router";
import axios from "axios";

Vue.config.productionTip = false;

Vue.prototype.$http = axios; // untuk menggunakan axios
Vue.prototype.$api = "https://api.responsi-p3l-0345.xyz/api"; // link untuk backend

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
