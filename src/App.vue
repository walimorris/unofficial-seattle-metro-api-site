<template>
  <div id="app">
    <SignInComponent/>
  </div>
</template>

<script>
import SignInComponent from '@/components/SignInComponent.vue';

export default {
  name: 'App',
  components: {
    SignInComponent,
  },
};
</script>

<style>
html, body {
  height: 99.8vh;
  width: 99.8vw;
  margin: 0;
  padding: 0;
  background-image: url("./assets/vecteezy_one-continuous-single-line-of-famous-building-like-space-needle_8267670.jpg");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: 100% 48%;
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
