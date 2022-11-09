<template>
  <div :id="UNDER_CONSTRUCTION_COMPONENT">
    <div :id="UNDER_CONSTRUCTION_ITEMS">
      <h1 :id="UNDER_CONSTRUCTION_HEADER">UNDER CONSTRUCTION</h1>
      <img :id="UNDER_CONSTRUCTION_IMAGE" alt="under construction image" src=".././assets/60028.jpg">
      <p><em>Our api website is under construction, but there's a special surprise for early users!</em></p>
      <button :id="LOGOUT_BUTTON" v-on:click="logoutOfCurrentSession()">Logout</button>
    </div>
  </div>
</template>

<script>

import { CognitoUser } from 'amazon-cognito-identity-js';

export default {
  name: 'UnderConstructionComponent',
  props: {
    username: { String },
    cognitoUser: { CognitoUser },
    cognitoResult: { Object },
    cachedCognitoSession: { Object },
  },
  data() {
    return {
      idToken: null,
      accessToken: null,
      refreshToken: null,
      clockDrift: null,
      userEmail: null,
      currentCognitoUserName: null,
      currentCognitoUser: null,

      UNDER_CONSTRUCTION_COMPONENT: 'under-construction-component',
      UNDER_CONSTRUCTION_HEADER: 'under-construction-header',
      UNDER_CONSTRUCTION_ITEMS: 'under-construction-items',
      UNDER_CONSTRUCTION_IMAGE: 'construction-image',
      LOGOUT_BUTTON: 'logout-button',
    }
  },

  mounted() {
    if (this.cachedCognitoSession !== null) {
      document.getElementById('sign-in').style.all = 'unset';
    }
    if (this.cognitoUser === null) {
      this.initializeUserDataFromCachedSession();
      this.buildCurrentCognitoUser();
    }
  },

  methods: {

    logoutOfCurrentSession() {

      // indicates that this view was render based on cached user session
      // else indicates that view was render from sign-in view
      if (this.currentCognitoUser !== null) {
        this.signOutCurrentUser(this.currentCognitoUser);
      } else {
        if (this.cognitoUser !== null) {
          this.signOutCurrentUser(this.cognitoUser);
        }
      }
    },

    signOutCurrentUser(user) {
      user.signOut();
      this.$helpers.sleep(2000);
      window.location.reload();
    },

    buildCurrentCognitoUser() {
      this.userEmail = this.idToken.payload.email;
      this.currentCognitoUser = this.$helpers.buildCognitoUser(this.userEmail);
      this.currentCognitoUserName = this.currentCognitoUser.Username;
    },

    initializeUserDataFromCachedSession() {
      this.idToken = this.cachedCognitoSession.idToken;
      this.accessToken = this.cachedCognitoSession.accessToken;
      this.refreshToken = this.cachedCognitoSession.refreshToken;
      this.clockDrift = this.cachedCognitoSession.clockDrift;
    }
  },
}

</script>

<style>

#under-construction-items {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 100px;
}

#construction-image {
  width: 30vw;
  height: auto;
  margin: auto;
}

#logout-button {
  background: linear-gradient(#ff6100, rgba(255, 80, 80, 1));
  animation: btn 6.0s 3s infinite ease-in-out;
  transition: all 0.3s;
  border-radius: 4px;
  border: none;
  outline: none;
  width: 30%;
  height: 35px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
}

#logout-button:hover {
  opacity: 2;
  cursor: pointer;
  box-shadow: 0 2px 2px -3px #ff6100;
}

</style>
