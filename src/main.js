import Vue from 'vue';
import App from './App.vue';
import { Amplify, Auth } from 'aws-amplify';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
