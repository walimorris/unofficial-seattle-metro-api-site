<template>
  <div id="resend-verification">
    <h1 v-show="showResendVerificationCodeForm" id="resend-verification-header">Resend Verification Form
    </h1>
    <form v-show="showResendVerificationCodeForm">
      <input type="email" class="form-control" id="user-email" placeholder="email">
      <button type="button" class="verify-button"
              id="verify-button"
              v-on:click="resendVerificationCode()">Send Code
      </button>
    </form>
    <button v-show="showSignInButton" type="button"
            id="load-sign-in-button"
            class="load-sign-in-button"
            v-on:click="loadSignInForm()">Sign in
    </button>
    <h3 id="resend-verification-message"></h3>
    <div v-if="showConfirmationRegistrationForm">
      <confirmation-registration-component :username="username"
                                           :cognitoUser="cognitoUser"
                                           :showConfirmationRegistrationForm="showConfirmationRegistrationForm"/>
    </div>
  </div>
</template>

<script>

import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import { Amplify, Auth } from 'aws-amplify';
import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';
import config from '../../config/config';
import Constants from '../../plugins/Constants.js';

export default {
  name: 'ResendVerificationComponent',
  components: { ConfirmationRegistrationComponent },
  data() {
    return {
      username: null,
      poolData: null,
      userPool: null,
      cognitoUser: null,
      attributeList: [],
      verified: false,
      showSignInButton: true,
      showResendVerificationCodeForm: true,
      showResendVerificationMessage: false,
      showConfirmationRegistrationForm: false,
      codeDeliveryDetails: null,

      userNameElement: null,
      verifyButtonElement: null,
      signInButtonElement: null,
      resendVerificationHeaderElement: null,
      resendVerificationMessageElement: null,
    };
  },

  mounted() {
    // when mounted assign document elements
    this.userNameElement = document.getElementById('user-email');
    this.verifyButtonElement = document.getElementById('verify-button');
    this.signInButtonElement = document.getElementById('load-sign-in-button');
    this.resendVerificationHeaderElement = document.getElementById('resend-verification-header');
    this.resendVerificationMessageElement = document.getElementById('resend-verification-message');

    Amplify.configure({
      Auth: {
        region: config.cognito.region,
        userPoolId: config.cognito.userPoolId,
        userPoolWebClientId: config.cognito.clientId,
      },
    })
  },

  methods: {

    /**
     * Resends verification code to a valid user's email address. Once a resent validation code has
     * sent, the user is redirected to the confirmation registration component that allows the user
     * to input the code. User's has three tries until they are redirected to sign-in.
     *
     * @see AmazonCognitoIdentity
     * @see CognitoUser
     */
    resendVerificationCode() {
      this.username = this.userNameElement.value;
      if (this.username !== Constants.EMPTY_STRING && this.isValidUserName(this.username)) {
        if (this.userExists(this.username)) {
          this.poolData = { UserPoolId: config.cognito.userPoolId, ClientId: config.cognito.clientId, };
          this.userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
          const userData = { Username: this.username, Pool: this.userPool, };
          this.cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

          this.cognitoUser.resendConfirmationCode((error, result) => {
            if (error) {
              console.log(`Error: ${error}`);
              this.resendVerificationMessageElement.innerHTML = `${error}`;
              if (this.userNameElement.value !== null)
                this.userNameElement.value = Constants.EMPTY_STRING;
            } else {
              this.resendVerificationMessageElement.innerHTML = Constants.CODE_CHECK_EMAIL;
              this.codeDeliveryDetails = result;
              console.log(result);
              this.loadConfirmRegistrationForm();
            }
          });
        } else {
          this.userNameElement.value = '';
          this.resendVerificationMessageElement.innerHTML = Constants.NONEXISTENT_USER;
        }
      } else {
        this.userNameElement.value = '';
        this.resendVerificationMessageElement.innerHTML = Constants.INVALID_USERNAME;
      }
    },

    /**
     * Executes the sign-in function of {@link Auth}. If a username is recognized, with improper
     * password passed, this function forces an error. A user can be recognized, depending on the
     * exact exception thrown. If a user is recognized than the user exists, otherwise the user is
     * not recognized and does not exist.
     *
     * @param username user sign-in username
     * @see Auth
     *
     * @returns {Promise<boolean>}
     */
    async userExists(username) {
      try {
        return await Auth.signIn(username.toLowerCase(), '123');
      } catch (error) {
        const code = error.code;
        console.log(error);
        switch (code) {
          case 'UserNotFoundException':
            return false;
          case 'UserNotConfirmedException':
            return true;
          case 'PasswordResetRequiredException':
            return true;
          case 'NotAuthorizedException':
            return true;
          default:
            return false;
        }
      }
    },

    /**
     * Matches a username to a correct email given a regex pattern. Truthy if the email is valid,
     * false otherwise.
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

    /**
     * Removes ResendVerification elements and loads the Sign In interface.
     */
    loadSignInForm() {
      if (this.showResendVerificationMessage === true) {
        this.showResendVerificationMessage = false;
      }
      window.location.reload();
    },

    /**
     * Loads the Confirmation Registration form that allows users to input verification codes.
     */
    loadConfirmRegistrationForm() {
      this.removeResendVerificationFeatures();
      this.showConfirmationRegistrationForm = true;
    },

    /**
     * Removes elements of the Resend Verification interface.
     */
    removeResendVerificationFeatures() {
      this.showSignInButton = false;
      if (this.resendVerificationMessageElement.innerHTML !== null) {
        this.resendVerificationMessageElement.innerHTML = Constants.EMPTY_STRING;
      }
      this.showResendVerificationCodeForm = false;
    }
  },
};

</script>

<style>

</style>
