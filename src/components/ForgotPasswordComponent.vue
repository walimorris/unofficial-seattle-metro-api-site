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

export default {
  name: 'ForgotPasswordComponent',
  components: { ResendVerificationComponent },
  data() {
    return {
      username: null,
      cognitoUser: null,
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
        if (this.$helpers.isValidUserName(this.username)) {
          // set up cognito user
          this.cognitoUser = this.$helpers.buildCognitoUser(this.username);

          // call forgot password on cognito user
          if (this.cognitoUser !== null) {
            this.cognitoUser.forgotPassword( {
              onSuccess(result) {
                if (document.getElementById('forgot-password-username').value !== null) {
                  document.getElementById('forgot-password-username').value = '';
                }
                this.showPasswordErrorMessage = false;
                this.codeDeliveryDetails = result;
                console.log(result);
              },
              onFailure(error) {
                console.log(`Error: ${error}`);
                if (document.getElementById('forgot-password-username').value !== null) {
                  document.getElementById('forgot-password-username').value = '';
                }
                this.showPasswordErrorMessage = true;
                document.getElementById('forgot-password-message').innerHTML = error.message;
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

    clearForgotPasswordInput() {
      if (document.getElementById('forgot-password-username').value !== null) {
        document.getElementById('forgot-password-username').value = '';
      }
    },
  }
};

</script>

<style>

</style>
