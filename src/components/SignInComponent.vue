<template>
  <div id="sign-in">
    <h1 v-show="showSignInForm">Sign In</h1>
    <div v-show="showRegistrationForm">
      <RegisterComponent></RegisterComponent>
    </div>
    <form v-show="showSignInForm" id="sign-in-form">
      <input type="email" class="form-control" id="sign-in-username" placeholder="User Name">
      <input type="password" class="form-control" id="sign-in-password" placeholder="Password">
      <button type="button" class="Sign in" v-on:click="signIn()">Sign In</button>
      <button type="button" class="Register" v-on:click="loadRegistrationForm()">Register</button>
    </form>
    <h3 id="authorized-tag"></h3>
    <h3 id="unauthorized-reason"></h3>
  </div>
</template>

<script>

import * as CognitoIdentityServiceProvider from 'amazon-cognito-identity-js';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import config from '../../config/config';
import RegisterComponent from '@/components/RegisterComponent.vue';
import Cookies from 'js-cookie';

export default {
  name: 'SignInComponent',
  components: { RegisterComponent },
  data() {
    return {
      username: null,
      password: null,
      authenticationData: null,
      poolData: null,
      userPool: null,
      cognitoUser: null,
      userData: null,
      accessToken: null,
      showRegistrationForm: false,
      showSignInForm: true,
      basicRegisteredCookieSet: null,
      basicRegisteredCookie: null,
      basicVerifiedCookieSet: null,
      basicVerifiedCookie: null,
    };
  },

  created() {
    this.basicRegisteredCookie = this.getBasicRegisteredCookieIfExists();
    this.basicVerifiedCookie = this.getBasicVerifiedCookieIfExists();
    if (this.basicRegisteredCookie !== null && this.basicRegisteredCookie !== undefined) {
      this.basicRegisteredCookieSet = true;
    }
    if (this.basicVerifiedCookie !== null && this.basicVerifiedCookie !== undefined) {
      this.basicVerifiedCookieSet = true;
    }
  },

  methods: {

    /**
     * Sign in using username, password, cognito user pool id, client id and using this information
     * to build authentication details to authenticate user with cognito.
     *
     * @see CognitoIdentityServiceProvider
     */
    signIn() {
      this.collectAuthenticationData();
      this.buildCognitoUser();
      const authenticationDetails = new CognitoIdentityServiceProvider.AuthenticationDetails(this.authenticationData);
      this.authenticateUser(authenticationDetails);
    },

    /**
     * Collects authentication data from user sign in credentials: username and password.
     */
    collectAuthenticationData() {
      this.username = document.getElementById('sign-in-username').value;
      this.password = document.getElementById('sign-in-password').value;
      if (this.username !== undefined && this.password !== undefined) {
        this.authenticationData = { Username: this.username, Password: this.password, };
      }
    },

    /**
     * Builds a cognito user by building user pool data with cognito pool id, cognito
     * client id and username.
     *
     * @see CognitoUser
     * @see CognitoIdentityServiceProvider
     */
    buildCognitoUser() {
      this.poolData = { UserPoolId: config.cognito.userPoolId, ClientId: config.cognito.clientId, };
      this.userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
      this.collectUserData();
      this.cognitoUser = new CognitoIdentityServiceProvider.CognitoUser(this.userData);
    },

    /**
     * Collects user data from sign in username and user pool data.
     */
    collectUserData() {
      this.userData = { Username: this.username, Pool: this.userPool, };
    },

    /**
     * Authenticates a CognitoUser with username, password and user pool authentication data.
     * @param authenticationData authentication object consists of username, password, user pool data
     *
     * @see CognitoIdentityServiceProvider
     * @see AmazonCognitoIdentity
     * @see CognitoUser
     */
    authenticateUser(authenticationData) {
      if (authenticationData !== null) {
        this.cognitoUser.authenticateUser(authenticationData, {

          onSuccess(result) {
            console.log(`access token=${result.getAccessToken().getJwtToken()}`);
            this.accessToken = result.getAccessToken().getJwtToken();
            if (document.getElementById('authorized-tag').innerHTML !== null) {
              document.getElementById('authorized-tag').innerHTML = '*Authorized*';
            }
            if (document.getElementById('unauthorized-reason').innerHTML !== null) {
              document.getElementById('unauthorized-reason').innerHTML = '';
            }
          },
          onFailure(error) {
            console.log(`Error authenticating user: ${this.username} with ${error}`);
            document.getElementById('authorized-tag').innerHTML = '*Not Authorized*';
            document.getElementById('unauthorized-reason').innerHTML = JSON.stringify(error) + error.message;
          },
        });
      }
    },

    /**
     * Loads registration form from the sign in view, this action removes any authorization
     * attributes or text.
     */
    loadRegistrationForm() {
      if (document.getElementById('authorized-tag').innerHTML !== null) {
        document.getElementById('authorized-tag').innerHTML = '';
      }
      if (document.getElementById('unauthorized-reason').innerHTML !== null) {
        document.getElementById('unauthorized-reason').innerHTML = '';
      }
      this.showRegistrationForm = true;
      this.showSignInForm = false;

    },

    /**
     * Gets the secure basic registered cookie if it exists.
     *
     * @see Cookies
     * @returns {String}
     */
    getBasicRegisteredCookieIfExists() {
      return Cookies.get('_Secure-BasicRegisteredCookie');
    },

    /**
     * Gets the secure basic verified cookie if it exists.
     *
     * @see Cookies
     * @returns {String}
     */
    getBasicVerifiedCookieIfExists() {
      return Cookies.get('_Secure-BasicVerifiedCookie');
    },
  },
};
</script>
