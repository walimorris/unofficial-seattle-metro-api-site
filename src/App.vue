<template>
  <div id="app">
    <SignInComponent/>
  </div>
</template>

<script>
// import RegisterComponent from './components/RegisterComponent.vue';
import SignInComponent from './components/SignInComponent.vue';

export default {
  name: 'App',
  components: {
    SignInComponent,
    // RegisterComponent,
  },
};
</script>

<style>
#app {
  border: 1px solid red;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
