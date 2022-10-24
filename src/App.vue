<template>
  <div id="app">
    <RegisterComponent/>
  </div>
</template>

<script>
// import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';
import RegisterComponent from './components/RegisterComponent.vue';

export default {
  name: 'App',
  components: {
    RegisterComponent,
    // ConfirmationRegistrationComponent,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
