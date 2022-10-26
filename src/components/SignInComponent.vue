<template>
<!--  needs a button for 'password reset' and 'verification retry' -->
  <div v-if="this.basicRegisteredCookieSet" id="sign-in">
    <h1>Sign In</h1>
    <form id="sign-in-form">
      <input type="email" class="form-control" id="sign-in-username" placeholder="User Name">
      <input type="password" class="form-control" id="sign-in-password" placeholder="Password">
      <button type="button" class="Sign in" v-on:click="signIn()">Sign In</button>
    </form>
    <h1 id="authorized-tag"></h1>
  </div>
</template>

<script>

// eslint-disable-next-line import/no-duplicates
import * as CognitoIdentityServiceProvider from 'amazon-cognito-identity-js';
import { CognitoUser } from 'amazon-cognito-identity-js';
// eslint-disable-next-line import/no-duplicates
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import config from '../../config/config';

export default {
  name: 'SignInComponent',
  props: {
    basicRegisteredCookieSet: { Boolean },
    basicRegisteredCookie: { String },
    cognitoUser: { CognitoUser },
  },
  data() {
    return {
      username: null,
      password: null,
      authenticationData: null,
      poolData: null,
      userPool: null,
      cognitoUserClone: null,
      userData: null,
      accessToken: null,
    };
  },
  mounted() {
    // use the passed cognitoUser from registration if it exists
    if (this.cognitoUser !== null) {
      this.buildCognitoUserClone();
    }
  },

  methods: {

    signIn() {
      this.collectAuthenticationData();
      // gather cognito pool data to build a cognito user clone
      this.poolData = {
        UserPoolId: config.cognito.userPoolId,
        ClientId: config.cognito.clientId,
      };
      this.buildCognitoUserClone();
      const authenticationDetails = new CognitoIdentityServiceProvider
        .AuthenticationDetails(this.authenticationData);

      this.authenticateUser(authenticationDetails);
    },

    collectAuthenticationData() {
      this.username = document.getElementById('sign-in-username').value;
      this.password = document.getElementById('sign-in-password').value;
      if (this.username !== undefined && this.password !== undefined) {
        this.authenticationData = {
          Username: this.username,
          Password: this.password,
        };
      }
    },

    collectUserData() {
      if (this.username === null || this.username === undefined) {
        this.username = this.cognitoUser.username;
      }
      this.userData = {
        Username: this.username,
        Pool: this.userPool,
      };
    },

    buildCognitoUserClone() {
      this.poolData = {
        UserPoolId: config.cognito.userPoolId,
        ClientId: config.cognito.clientId,
      };
      this.userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
      this.collectUserData();
      this.cognitoUserClone = new CognitoIdentityServiceProvider.CognitoUser(this.userData);
    },

    authenticateUser(authenticationData) {
      if (authenticationData !== null) {
        this.cognitoUserClone.authenticateUser(authenticationData, {
          onSuccess(result) {
            // eslint-disable-next-line no-console
            console.log(`access token=${result.getAccessToken().getJwtToken()}`);
            this.accessToken = result.getAccessToken().getJwtToken();
            if (document.getElementById('authorized-tag').innerHTML !== null) {
              document.getElementById('authorized-tag').innerHTML = '*Authorized*';
            }
          },
          onFailure(error) {
            console.log(`Error authenticating user: ${this.username} with ${error}`);
            document.getElementById('authorized-tag').innerHTML = '*Not Authorized*';
          },
        });
      }
    },
  },
};
</script>
