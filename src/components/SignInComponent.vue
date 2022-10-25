<template>
  <div v-if="this.basicRegisteredCookieSet" id="sign-in">
    <p>{{ basicRegisteredCookieSet }}</p>
    <p>SIGN IN</p>
  </div>
</template>

<script>

export default {
  name: 'SignInComponent',
  props: {
    basicRegisteredCookieSet: { Boolean },
  },
};
</script>
