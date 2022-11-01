<template>
  <div id="forgot-password-component">
    <h1 id="forgot-password-component-header" v-show="showForgotPasswordForm">Forgot Password</h1>
    <div id="resend-verification-form" v-if="showResendVerificationForm">
      <ResendVerificationComponent></ResendVerificationComponent>
    </div>
    <form v-show="showForgotPasswordForm" id="forgot-password-form">
      <input type="email" id="forgot-password-username" placeholder="username">
      <button type="button"
              id="forgot-password-execute-button"
              v-on:click="executeForgotPassword()">Submit</button>
    </form>
    <div>
      <button type="button" id="sign-in-view-button" v-on:click="loadSignInForm()">Sign In</button>
    </div>
    <h3 v-show="showPasswordErrorMessage" id="forgot-password-message"></h3>
    <h3 v-show="showPasswordConfirmMessage" id="forgot-password-confirm-message"></h3>
  </div>
</template>

<script>
import ResendVerificationComponent from '@/components/ResendVerificationComponent';
import config from '../../config/config';
import AmazonCognitoIdentity from 'amazon-cognito-identity-js';

export default {
  name: 'ForgotPasswordComponent',
  components: { ResendVerificationComponent },
  data() {
    return {
      username: null,
      poolData: null,
      userPool: null,
      cognitoUser: null,
      userData: null,
      showForgotPasswordForm: true,
      showResendVerificationForm: false,
      showPasswordErrorMessage: false,
      showPasswordConfirmMessage: false,
      codeDeliveryDetails: null,
    }
  },

  methods: {

    executeForgotPassword() {
      this.username = document.getElementById('forgot-password-username').value;
      if (this.username !== '') {
        if (this.isValidUserName(this.username)) {
          // set up cognito user
          this.buildCognitoUser();

          // call forgot password on cognito user
          if (this.cognitoUser !== null) {
            this.cognitoUser.forgotPassword( {
              onSuccess(result) {
                this.clearForgotPasswordInput();
                this.showPasswordErrorMessage = false;
                this.showPasswordConfirmMessage = true;
                document.getElementById('forgot-password-confirm-message').innerHTML = 'Check Email for Code';
                this.codeDeliveryDetails = result;
                console.log(result);
              },
              onFailure(error) {
                console.log(`Error: ${error}`);
                this.clearForgotPasswordInput();
                this.showPasswordErrorMessage = true;
                document.getElementById('forgot-password-message').innerHTML = `${error}`;
                if (document.getElementById('forgot-password-username').value !== null) {
                  document.getElementById('forgot-password-username').value = '';
                }
              }
            });
          }
        } else {
          this.clearForgotPasswordInput();
          this.showPasswordErrorMessage = true;
          document.getElementById('forgot-password-message').innerHTML = 'invalid username';
        }
      } else {
        this.clearForgotPasswordInput();
        this.showPasswordErrorMessage = true;
        document.getElementById('forgot-password-message').innerHTML = 'empty username';
      }
    },

    /**
     * Loads sign-in view.
     */
    loadSignInForm() {
      if (this.showPasswordErrorMessage === true) {
        this.showPasswordErrorMessage = false;
      }
      window.location.reload();
    },

    /**
     * Collects user data from sign in username and user pool data.
     */
    collectUserData() {
      this.userData = { Username: this.username, Pool: this.userPool, };
    },

    clearForgotPasswordInput() {
      if (document.getElementById('forgot-password-username').value !== null) {
        document.getElementById('forgot-password-username').value = '';
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
      this.cognitoUser = new AmazonCognitoIdentity.CognitoUser(this.userData);
    },

    isValidUserName(username) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = new RegExp(emailRegex).test(username.toLowerCase());
      console.log(`valid email address: ${isValid}`);
      return isValid;
    },
  }
};

</script>

<style>

</style>
