<template>
  <div id="sign-in">
    <h1 id="sign-in-default-header" v-show="showSignInForm">Sign In</h1>
    <div id="registration-form" v-show="showRegistrationForm">
      <RegisterComponent></RegisterComponent>
    </div>
    <div id="resend-verification-form" v-if="showResendVerificationForm">
      <ResendVerificationComponent></ResendVerificationComponent>
    </div>
    <form v-show="showSignInForm" id="sign-in-form">
      <input type="email" class="form-control" id="sign-in-username" placeholder="User Name">
      <input type="password" class="form-control" id="sign-in-password" placeholder="Password">
      <button type="button" class="sign-in-button" v-on:click="signIn()">Sign In</button>
    </form>
    <div class="buttons">
      <button v-show="showRegisterButton" type="button" class="Register" id="register-button" v-on:click="loadRegistrationForm()">Register</button>
      <button v-show="showResendVerificationButton" type="button" id="resend-verification-button" v-on:click="loadResendVerificationForm()">Resend Code</button>
    </div>
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
    };
  },

  created() {
    this.basicRegisteredCookie = this.getBasicRegisteredCookieIfExists();
    this.basicVerifiedCookie = this.getBasicVerifiedCookieIfExists();
    if (this.basicRegisteredCookie !== null) {
      this.basicRegisteredCookieSet = true;
    }
    if (this.basicVerifiedCookie !== null) {
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
      this.toggleAuthorizedTagOff();
      if (this.collectAuthenticationData()) {
        this.buildCognitoUser();
        const authenticationDetails = new CognitoIdentityServiceProvider
          .AuthenticationDetails(this.authenticationData);

        this.authenticateUser(authenticationDetails);
      }
    },

    /**
     * Collects authentication data from user sign in credentials: username and password.
     *
     * @return {boolean} collected username and password returns true and false otherwise
     */
    collectAuthenticationData() {
      this.username = document.getElementById('sign-in-username').value;
      this.password = document.getElementById('sign-in-password').value;

      // checks for any missing sign-in credential
      if (this.username === '' || this.password === '') {
        this.removeSignInInputValues();
        document.getElementById('unauthorized-reason').innerHTML = 'oops missed a credential';
        return false;
      } else {
        if (this.isValidUserName(this.username)) {
          this.authenticationData = { Username: this.username, Password: this.password, };
          return true;
        } else {
          // report in valid username
          this.removeSignInInputValues();
          document.getElementById('unauthorized-reason').innerHTML = 'invalid username';
        }
      }
      return false;
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
    async authenticateUser(authenticationData) {
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
            document.getElementById('unauthorized-reason').innerHTML = error.message;
          },
        });
        this.removeSignInInputValues();
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

    /**
     * Removes all sign-in features, including error messages, from the view.
     */
    removeSignInFeatures() {
      // remove register button && resend verification button
      this.showResendVerificationButton = false;
      this.showRegisterButton = false;
      this.toggleAuthorizedTagOff();
      this.toggleUnAuthorizedReasonOff();
      this.showSignInForm = false;
    },

    /**
     * Clears sign-in username and password input values.
     */
    removeSignInInputValues() {
      document.getElementById('sign-in-username').value = '';
      document.getElementById('sign-in-password').value = '';
    },

    /**
     * Clears unauthorized-reason element of any text content.
     */
    toggleUnAuthorizedReasonOff() {
      if (document.getElementById('unauthorized-reason').innerHTML !== null) {
        document.getElementById('unauthorized-reason').innerHTML = '';
      }
    },

    /**
     * Clears authorized-tag element of any text content.
     */
    toggleAuthorizedTagOff() {
      if (document.getElementById('authorized-tag').innerHTML !== null) {
        document.getElementById('authorized-tag').innerHTML = '';
      }
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

    /**
     * Matches a username to a correct email address given a regex pattern. Truthy if the email is
     * valid, false otherwise.
     *
     * @param username sign-in username
     * @returns {boolean}
     */
    isValidUserName(username) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = new RegExp(emailRegex).test(username.toLowerCase());
      console.log(`valid email address: ${isValid}`);
      return isValid;
    },
  },
};

</script>

<style>
  #sign-in {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 40vw;
    border: 1px solid #8e8d8d;
    box-shadow: 10px 10px #9f9f9f;
    background-color: white;
  }

  h1 {
    padding-bottom: 2rem;
  }

  #sign-in-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  input {
    margin-bottom: 1rem;
  }

  .sign-in-button {
    margin-bottom: 1rem;
  }

  .buttons {
    width: 15rem;
  }

  .buttons > button {
    width: 6rem;
  }
</style>
