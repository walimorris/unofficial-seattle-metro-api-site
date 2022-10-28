<template>
  <div id="sign-in">
    <h1 v-show="showSignInForm">Sign In</h1>
    <div v-show="showRegistrationForm">
      <RegisterComponent></RegisterComponent>
    </div>
    <div v-if="showResendVerificationForm">
      <ResendVerificationComponent></ResendVerificationComponent>
    </div>
    <form v-show="showSignInForm" id="sign-in-form">
      <input type="email" class="form-control" id="sign-in-username" placeholder="User Name">
      <input type="password" class="form-control" id="sign-in-password" placeholder="Password">
      <button type="button" class="Sign in" id="sign-in-button" v-on:click="signIn()">Sign In</button>
    </form>
    <button v-show="showRegisterButton" type="button" class="Register" id="register-button" v-on:click="loadRegistrationForm()">Register</button>
    <button v-show="showResendVerificationButton" type="button" id="resend-verification-button" v-on:click="loadResendVerificationForm()">Resend Code</button>
    <h3 id="authorized-tag"></h3>
    <h3 id="unauthorized-reason"></h3>
  </div>
</template>

<script>

import * as CognitoIdentityServiceProvider from 'amazon-cognito-identity-js';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import config from '../../config/config';
import RegisterComponent from '@/components/RegisterComponent.vue';
import ResendVerificationComponent from '@/components/ResendVerificationComponent.vue';
import Cookies from 'js-cookie';

export default {
  name: 'SignInComponent',
  components: { RegisterComponent, ResendVerificationComponent },
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
      showSignInForm: true,
      showRegistrationForm: false,
      showRegisterButton: true,
      showResendVerificationForm: false,
      showResendVerificationButton: true,
      basicRegisteredCookieSet: null,
      basicRegisteredCookie: null,
      basicVerifiedCookieSet: null,
      basicVerifiedCookie: null,

      signInUserNameElement: null,
      signInPasswordElement: null,
      signInButtonElement: null,
      registerButtonElement: null,
      resendVerificationButtonElement: null,
      authorizedTagElement: null,
      unauthorizedReasonElement: null,
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

  mounted() {
    // get document elements on mount life-cycle hook
    this.signInUserNameElement = document.getElementById('sign-in-username');
    this.signInPasswordElement = document.getElementById('sign-in-password');
    this.signInButtonElement = document.getElementById('sign-in-button');
    this.registerButtonElement = document.getElementById('register-button');
    this.resendVerificationButtonElement = document.getElementById('resend-verification-button');
    this.authorizedTagElement = document.getElementById('authorized-tag');
    this.unauthorizedReasonElement = document.getElementById('unauthorized-reason');
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
      this.username = this.signInUserNameElement.value;
      this.password = this.signInPasswordElement.value;
      if (this.username !== '' && this.password !== '') {
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
            if (this.authorizedTagElement.innerHTML !== null) {
              this.authorizedTagElement.innerHTML = '*Authorized*';
            }
            if (this.unauthorizedReasonElement.innerHTML !== null) {
              this.unauthorizedReasonElement.innerHTML = '';
            }
          },
          onFailure(error) {
            console.log(`Error authenticating user: ${this.username} with ${error}`);
            this.authorizedTagElement.innerHTML = '*Not Authorized*';
            this.unauthorizedReasonElement.innerHTML = JSON.stringify(error) + error.message;
          },
        });
      }
    },

    /**
     * Loads registration form from the sign in view, this action removes any sign in
     * attributes or text.
     */
    loadRegistrationForm() {
      this.removeSignInFeatures();
      this.showRegistrationForm = true;
    },

    /**
     * Loads resend validation code form from the sign in view, this action removes any sign in
     * attributes or text.
     */
    loadResendVerificationForm() {
      this.removeSignInFeatures();
      this.showResendVerificationForm = true;
    },

    removeSignInFeatures() {
      // remove register button && resend verification button
      this.showResendVerificationButton = false;
      this.showRegisterButton = false;
      if (this.authorizedTagElement.innerHTML !== null) {
        this.authorizedTagElement.innerHTML = '';
      }
      if (this.unauthorizedReasonElement.innerHTML !== null) {
        this.unauthorizedReasonElement.innerHTML = '';
      }
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
