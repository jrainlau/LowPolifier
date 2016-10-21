import Vue from 'vue'
import App from './App.vue'
import store from '../vuex/store'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  store,
  components: { App }
})
