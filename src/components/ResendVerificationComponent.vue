<template>
  <div id="resend-verification">
    <h1 v-show="showResendVerificationCodeForm" id="resend-verification-header">Resend Verification Form</h1>
    <form v-show="showResendVerificationCodeForm">
      <input type="email" class="form-control" id="user-email" placeholder="email">
      <button type="button" class="verify-button" v-on:click="resendVerificationCode()">Send Code</button>
    </form>
    <button v-show="showSignInButton" type="button" class="load-sign-in-button" v-on:click="loadSignInForm()">Sign in</button>
    <h3 id="resend-verification-message"></h3>
    <div v-if="showConfirmationRegistrationForm">
      <confirmation-registration-component :username="username" :cognitoUser="cognitoUser"
                                           :showConfirmationRegistrationForm="showConfirmationRegistrationForm"/>
    </div>
  </div>
</template>

<script>

import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';
import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';
import config from '../../config/config';

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
    };
  },

  methods: {

    resendVerificationCode() {
      this.username = document.getElementById('user-email').value;
      if (this.username !== "" && this.isValidUserName(this.username)) {
        if (this.userExists(this.username)) {
          this.poolData = { UserPoolId: config.cognito.userPoolId, ClientId: config.cognito.clientId, };
          this.userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
          const userData = { Username: this.username, Pool: this.userPool, };
          this.cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

          this.cognitoUser.resendConfirmationCode((error, result) => {
            if (error) {
              console.log(`Error: ${error}`);
              document.getElementById('resend-verification-message').innerHTML = `${error}`;
              if (document.getElementById('user-email').value !== null)
                document.getElementById('user-email').value = '';
            } else {
              document.getElementById('resend-verification-message').innerHTML = 'Check Email for Code';
              this.codeDeliveryDetails = result;
              console.log(result);
              this.loadConfirmRegistrationForm();
            }
          });
        } else {
          document.getElementById('user-email').value = '';
          document.getElementById('resend-verification-message').innerHTML = 'User does not exists!';
        }
      } else {
        document.getElementById('user-email').value = '';
        document.getElementById('resend-verification-message').innerHTML = 'Not a valid username';
      }
    },

    async userExists(username) {
      return await Auth.signIn(username.toLowerCase(), '123').then(response => {
        return false;
      }).catch(error => {
        const code = error.code;
        console.log(error);
        switch (code) {
          case 'UserNotFoundException':
            return false;
          case 'UserNotConfirmedException':
            return false;
          case 'PasswordResetRequiredException':
            return true;
          case 'NotAuthorizedException':
            return true;
          default:
            return false;
        }
      })
    },

    isValidUserName(username) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = new RegExp(emailRegex).test(username.toLowerCase());
      console.log(`valid email address: ${isValid}`);
      return isValid;
    },

    loadSignInForm() {
      if (this.showResendVerificationMessage === true) {
        this.showResendVerificationMessage = false;
      }
      window.location.reload();
    },

    loadConfirmRegistrationForm() {
      this.removeResendVerificationFeatures();
      this.showConfirmationRegistrationForm = true;
      console.log('Show confirmation registration form' + this.showConfirmationRegistrationForm);
    },

    removeResendVerificationFeatures() {
      console.log('Removing verification form features!')
      this.showSignInButton = false;
      if (document.getElementById('resend-verification-message').innerHTML !== null) {
        document.getElementById('resend-verification-message').innerHTML = '';
      }
      this.showResendVerificationCodeForm = false;
    }
  },
};

</script>

<style>

</style>
