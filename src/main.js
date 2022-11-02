import Vue from 'vue';
import App from './App.vue';
import helpers from '@/helpers';

const plugin = {
  install () {
    Vue.helpers = helpers
    Vue.prototype.$helpers = helpers
  }
}

Vue.use(plugin);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
