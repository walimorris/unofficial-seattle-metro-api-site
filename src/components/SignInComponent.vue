<template>
  <div :id="SIGN_IN_COMPONENT">
    <button v-show="showForgotPasswordButton"
            type="button"
            :id="FORGOT_PASSWORD_BUTTON"
            v-on:click="loadForgotPasswordForm()">Forgot Password</button>

    <h1 :id="SIGN_IN_DEFAULT_HEADER" v-show="showSignInForm">Sign in, eh...</h1>
    <div :id="REGISTRATION_FORM" v-show="showRegistrationForm">
      <RegisterComponent></RegisterComponent>
    </div>
    <div :id="RESEND_VERIFICATION_FORM" v-if="showResendVerificationForm">
      <ResendVerificationComponent></ResendVerificationComponent>
    </div>
    <div :id="FORGOT_PASSWORD_FORM" v-if="showForgotPasswordForm">
      <ForgotPasswordComponent></ForgotPasswordComponent>
    </div>
    <form v-show="showSignInForm" :id="SIGN_IN_FORM">
      <input type="email" class="form-control" :id="SIGN_IN_USERNAME" placeholder="User Name">
      <input type="password" class="form-control" :id="SIGN_IN_PASSWORD" placeholder="Password">
      <button type="button" class="sign-in-button" :id="SIGN_IN_BUTTON" v-on:click="signIn()">Sign In</button>
      <h3 :id="AUTHORIZED_TAG"></h3>
      <h3 :id="UNAUTHORIZED_REASON"></h3>
    </form>
    <div class="buttons">
      <button v-show="showRegisterButton"
              type="button" class="Register"
              :id="REGISTER_BUTTON"
              v-on:click="loadRegistrationForm()">Register Account</button>

      <button v-show="showResendVerificationButton"
              type="button"
              :id="RESEND_VERIFICATION_BUTTON"
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

      SIGN_IN_COMPONENT: 'sign-in',
      FORGOT_PASSWORD_BUTTON: 'forgot-password-button',
      SIGN_IN_DEFAULT_HEADER: 'sign-in-default-header',
      REGISTRATION_FORM: 'registration-form',
      RESEND_VERIFICATION_FORM: 'resend-verification-form',
      FORGOT_PASSWORD_FORM: 'forgot-password-form',
      SIGN_IN_FORM: 'sign-in-form',
      SIGN_IN_USERNAME: 'sign-in-username',
      SIGN_IN_PASSWORD: 'sign-in-password',
      AUTHORIZED_TAG: 'authorized-tag',
      UNAUTHORIZED_REASON: 'unauthorized-reason',
      SIGN_IN_BUTTON: 'sign-in-button',
      REGISTER_BUTTON: 'register-button',
      RESEND_VERIFICATION_BUTTON: 'resend-verification-button',
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
      this.removeInputBorderStyle();
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
      this.username = document.getElementById(this.SIGN_IN_USERNAME).value;
      this.password = document.getElementById(this.SIGN_IN_USERNAME).value;

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

    /**
     * Renders error message, updates form input border style, font size and font color.
     *
     * @param errorMessage error message to render
     */
    renderErrorMessage(errorMessage) {
      document.getElementById(this.UNAUTHORIZED_REASON).style.color = config.COLOR.LIGHT_RED;
      document.getElementById(this.UNAUTHORIZED_REASON).style.fontSize = config.FONT_SIZE.SMALL;
      document.getElementById(this.UNAUTHORIZED_REASON).innerHTML = errorMessage;
      if (errorMessage.includes(config.FORM_ERROR_MESSAGES.MISSING_VALUE)) {
        document.getElementById(this.SIGN_IN_USERNAME).style.borderColor = config.COLOR.LIGHT_RED;
        document.getElementById(this.SIGN_IN_PASSWORD).style.borderColor = config.COLOR.LIGHT_RED;
      } else {
        if (errorMessage.includes(config.FORM_ERROR_MESSAGES.INVALID_USERNAME)) {
          document.getElementById(this.SIGN_IN_USERNAME).style.borderColor = config.COLOR.LIGHT_RED;
        }
      }
      this.clearFormInputValues();
    },

    /**
     * Loads registration form from the sign in view, this action removes any sign in
     * attributes or text.
     */
    loadRegistrationForm() {
      this.removeInputBorderStyle();
      this.removeSignInFeatures();
      this.showRegistrationForm = true;
    },

    /**
     * Loads resend validation code form from the sign in view, this action removes any sign in
     * attributes or text.
     */
    loadResendVerificationForm() {
      this.removeInputBorderStyle();
      this.removeSignInFeatures();
      this.showResendVerificationForm = true;
    },

    /**
     * Loads forgot password form from the sign in view, this action removes any sign
     * in attributes or text.
     */
    loadForgotPasswordForm() {
      this.removeInputBorderStyle();
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
     * Clears Sign in form input values.
     */
    clearFormInputValues() {
      document.getElementById(this.SIGN_IN_USERNAME).value = config.FORM_VALUE.EMPTY;
      document.getElementById(this.SIGN_IN_PASSWORD).value = config.FORM_VALUE.EMPTY;
    },

    /**
     * Clears sign-in username and password input values.
     */
    removeSignInInputValues() {
      document.getElementById(this.SIGN_IN_USERNAME).value = '';
      document.getElementById(this.SIGN_IN_PASSWORD).value = '';
    },

    /**
     * Clears unauthorized-reason element of any text content.
     */
    toggleUnAuthorizedReasonOff() {
      if (document.getElementById(this.UNAUTHORIZED_REASON).innerHTML !== null) {
        document.getElementById(this.UNAUTHORIZED_REASON).innerHTML = '';
      }
    },

    /**
     * Removes form input values border styling.
     */
    removeInputBorderStyle() {
      document.getElementById(this.SIGN_IN_USERNAME).style.borderColor = config.COLOR.BLACK;
      document.getElementById(this.SIGN_IN_PASSWORD).style.borderColor = config.COLOR.BLACK;
    },

    /**
     * Clears authorized-tag element of any text content.
     */
    toggleAuthorizedTagOff() {
      if (document.getElementById(this.AUTHORIZED_TAG).innerHTML !== null) {
        document.getElementById(this.AUTHORIZED_TAG).innerHTML = '';
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
  },
};

</script>

<style>
  #sign-in {
    display: flex;
    margin: auto;
    height: auto;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 40vw;
    border: 3px solid #8e8d8d;
    box-shadow: 10px 10px #9f9f9f;
    background-color: white;
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
    left: -9rem;
    top: .02rem;
  }

  #resend-verification-button {
    position: relative;
    left: 9rem;
    top: .02rem;
  }

  /* added for poc styling for forgot-password button
  and this will/should be updated */
  #forgot-password-button {
    background-color: transparent;
    color: cadetblue;
    top: 1rem;
    left: 12rem;
    width: 8rem;
    background-repeat: no-repeat;
    text-decoration: underline;
    border: none;
    cursor: pointer;
    outline: none;
  }

</style>
