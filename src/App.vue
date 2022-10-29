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
html, body {
  height: 99.8vh;
  width: 99.8vw;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
