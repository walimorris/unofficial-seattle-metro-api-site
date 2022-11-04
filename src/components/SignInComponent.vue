<template>
  <div id="sign-in">
    <button v-show="showForgotPasswordButton"
            type="button"
            id="forgot-password-button"
            v-on:click="loadForgotPasswordForm()">Forgot Password</button>

    <h1 id="sign-in-default-header" v-show="showSignInForm">Sign in, eh...</h1>
    <div id="registration-form" v-show="showRegistrationForm">
      <RegisterComponent></RegisterComponent>
    </div>
    <div id="resend-verification-form" v-if="showResendVerificationForm">
      <ResendVerificationComponent></ResendVerificationComponent>
    </div>
    <div id="forgot-password-form" v-if="showForgotPasswordForm">
      <ForgotPasswordComponent></ForgotPasswordComponent>
    </div>
    <form v-show="showSignInForm" id="sign-in-form">
      <input type="email" class="form-control" id="sign-in-username" placeholder="User Name">
      <input type="password" class="form-control" id="sign-in-password" placeholder="Password">
      <button type="button" class="sign-in-button" v-on:click="signIn()">Sign In</button>
      <h3 id="authorized-tag"></h3>
      <h3 id="unauthorized-reason"></h3>
    </form>
    <div class="buttons">
      <button v-show="showRegisterButton"
              type="button" class="Register"
              id="register-button"
              v-on:click="loadRegistrationForm()">Register Account</button>

      <button v-show="showResendVerificationButton"
              type="button"
              id="resend-verification-button"
              v-on:click="loadResendVerificationForm()">Resend Code</button>
    </div>
  </div>
</template>

<script>

import * as CognitoIdentityServiceProvider from 'amazon-cognito-identity-js';
import RegisterComponent from '@/components/RegisterComponent.vue';
import ResendVerificationComponent from '@/components/ResendVerificationComponent.vue';
import ForgotPasswordComponent from '@/components/ForgotPasswordComponent';
import Cookies from 'js-cookie';
import config from '../../config/config';

export default {
  name: 'SignInComponent',
  components: { ForgotPasswordComponent, RegisterComponent, ResendVerificationComponent },
  data() {
    return {
      username: null,
      password: null,
      authenticationData: null,
      cognitoUser: null,
      accessToken: null,
      showSignInForm: true,
      showRegistrationForm: false,
      showRegisterButton: true,
      showResendVerificationForm: false,
      showResendVerificationButton: true,
      showForgotPasswordForm: false,
      showForgotPasswordButton: true,
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
        this.cognitoUser = this.$helpers.buildCognitoUser(this.username);
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
        this.renderErrorMessage(config.FORM_ERROR_MESSAGES.MISSING_VALUE)
        return false;
      } else {
        if (this.$helpers.isValidUserName(this.username)) {
          this.authenticationData = { Username: this.username, Password: this.password, };
          return true;
        } else {
          // report in valid username
          this.removeSignInInputValues();
          this.renderErrorMessage(config.FORM_ERROR_MESSAGES.INVALID_USERNAME)
        }
      }
      return false;
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

    renderErrorMessage(errorMessage) {
      document.getElementById('unauthorized-reason').style.color = config.COLOR.LIGHT_RED;
      document.getElementById('unauthorized-reason').style.fontSize = config.FONT_SIZE.SMALL;
      document.getElementById('unauthorized-reason').innerHTML = errorMessage;
      this.clearFormInputValues();
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
     * Loads forgot password form from the sign in view, this action removes any sign
     * in attributes or text.
     */
    loadForgotPasswordForm() {
      this.removeSignInFeatures();
      this.showForgotPasswordForm = true;
    },

    /**
     * Removes all sign-in features, including error messages, from the view.
     */
    removeSignInFeatures() {
      // remove register button && resend verification button
      this.showResendVerificationButton = false;
      this.showRegisterButton = false;
      this.showForgotPasswordButton = false;
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
    }
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
    border: 3px solid #8e8d8d;
    box-shadow: 10px 10px #9f9f9f;
    background-color: white;
  }

  /* added for poc styling for forgot-password button
  and this will/should be updated */
  #forgot-password-button {
    background-color: transparent;
    color: cadetblue;
    position: relative;
    top: 20px;
    left: 185px;
    width: 8rem;
    background-repeat: no-repeat;
    text-decoration: underline;
    border: none;
    cursor: pointer;
    outline: none;
  }

  h1 {
    padding-bottom: .8rem;
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
    margin-bottom: .8rem;
  }

  .buttons {
    width: 15rem;
  }

  .buttons > button {
    width: 15rem;
    background-color: transparent;
    color: cadetblue;
    top: 15px;
    left: 185px;
    background-repeat: no-repeat;
    text-decoration: underline;
    border: none;
    cursor: pointer;
    outline: none;
  }

  #register-button {
    position: relative;
    left: -140px;
    top: -15px;
  }

  #resend-verification-button {
    position: relative;
    left: 145px;
    top:-15px;
  }

</style>
