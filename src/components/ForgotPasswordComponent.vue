<template>
  <div :id="FORGOT_PASSWORD_COMP">
    <h1 :id="FORGOT_PASSWORD_COMP_HEADER" v-show="showForgotPasswordForm">Forgot Password</h1>
    <div :id="UPDATE_PASSWORD_FORM" v-if="showUpdatePasswordForm">
      <UpdatePasswordComponent></UpdatePasswordComponent>
    </div>
    <form v-show="showForgotPasswordForm" :id="FORGOT_PASSWORD_FORM">
      <input type="email" id="forgot-password-username" placeholder="username">
      <h3 :id="FORGOT_PASSWORD_MESSAGE"></h3>
      <button type="button"
              :id="FORGOT_PASSWORD_EXECUTION_BUTTON"
              v-on:click="executeForgotPassword()">Submit</button>
    </form>
    <div>
      <button v-show="showSignInButton"
              type="button"
              :id="SIGN_IN_BUTTON" v-on:click="loadSignInForm()">Sign In</button>
    </div>
    <h3 :id="FORGOT_PASSWORD_CONFIRM_MESSAGE"></h3>
  </div>
</template>

<script>
import UpdatePasswordComponent from '@/components/UpdatePasswordComponent';
import config from '../../config/config';

export default {
  name: 'ForgotPasswordComponent',
  components: { UpdatePasswordComponent },
  data() {
    return {
      username: null,
      cognitoUser: null,
      showForgotPasswordForm: true,
      showUpdatePasswordForm: false,
      showSignInButton: true,
      codeDeliveryDetails: null,

      FORGOT_PASSWORD_COMP: 'forgot-password-component',
      FORGOT_PASSWORD_COMP_HEADER: 'forgot-password-component-header',
      FORGOT_PASSWORD_FORM: 'forgot-password-form',
      FORGOT_PASSWORD_USERNAME: 'forgot-password-username',
      FORGOT_PASSWORD_EXECUTION_BUTTON: 'forgot-password-execute-button',
      FORGOT_PASSWORD_MESSAGE: 'forgot-password-message',
      FORGOT_PASSWORD_CONFIRM_MESSAGE: 'forgot-password-confirm-message',

      SIGN_IN_BUTTON: 'sign-in-view-button',
      UPDATE_PASSWORD_FORM: 'update-password-form',
    }
  },

  methods: {

    /**
     * Executes forgot user functionality on a cognito user and helps validate input parameters before
     * allowing these values to pass to the actual cognito forgot password functionality.
     *
     * @return {Promise<void>}
     */
    async executeForgotPassword() {
      this.username = document.getElementById(this.FORGOT_PASSWORD_USERNAME).value;
      if (this.username !== '') {
        if (this.$helpers.isValidUserName(this.username)) {
          // set up cognito user
          this.cognitoUser = this.$helpers.buildCognitoUser(this.username);
          await this.forgotPassword();
          await this.$helpers.sleep(2000); // can we do a spinner here
          if (document.getElementById(this.FORGOT_PASSWORD_CONFIRM_MESSAGE).textContent === config.FORM_SUCCESS_MESSAGES.SUCCESS) {
            this.removeForgotPasswordProperties();
            this.showUpdatePasswordForm = true;
          }
        } else {
          this.clearForgotPasswordInput();
          document.getElementById(this.FORGOT_PASSWORD_MESSAGE).innerHTML = config.FORM_ERROR_MESSAGES.INVALID_USERNAME;
        }
      } else {
        this.clearForgotPasswordInput();
        document.getElementById(this.FORGOT_PASSWORD_MESSAGE).innerHTML = config.FORM_ERROR_MESSAGES.EMPTY_USERNAME;
      }
    },

    /**
     * Executes forgot password function on cognito usser. Be advised, this function returns a promise,
     * yet sends a confirmation code to the valid user's email address.
     *
     * @see CognitoUser
     * @return {Promise<void>}
     */
    async forgotPassword() {
      // call forgot password on cognito user
      if (this.cognitoUser !== null) {
        this.cognitoUser.forgotPassword({

          onSuccess(result) {
            const forgotPasswordUsername = document.getElementById('forgot-password-username');
            const forgotPasswordMessage = document.getElementById('forgot-password-message');
            const forgotPasswordConfirmMessage = document.getElementById('forgot-password-confirm-message');
            if (forgotPasswordUsername.value !== null) {
              forgotPasswordUsername.value = '';
            }
            if (forgotPasswordConfirmMessage !== null) {
              forgotPasswordMessage.textContent = ''
              forgotPasswordConfirmMessage.textContent = 'Success';
            }
            this.codeDeliveryDetails = result;
          },
          onFailure(error) {
            const forgotPasswordUsername = document.getElementById('forgot-password-username');
            const forgotPasswordMessage = document.getElementById('forgot-password-message');
            if (forgotPasswordUsername.value !== null) {
              forgotPasswordUsername.value = '';
            }
            if (forgotPasswordMessage !== null) {
              forgotPasswordMessage.textContent = error.message;
            }
          },
        });
      }
    },

    /**
     * Loads sign-in view.
     */
    loadSignInForm() {
      window.location.reload();
    },

    /**
     * Clears forgot-password form input values.
     */
    clearForgotPasswordInput() {
      if (document.getElementById(this.FORGOT_PASSWORD_USERNAME).value !== null) {
        document.getElementById(this.FORGOT_PASSWORD_USERNAME).value = config.FORM_VALUE.EMPTY;
      }
    },

    /**
     * Removes forgot-password component properties and any text values.
     */
    removeForgotPasswordProperties() {
      this.showForgotPasswordForm = false;
      this.showSignInButton = false;
      document.getElementById(this.FORGOT_PASSWORD_CONFIRM_MESSAGE).innerHTML = config.FORM_VALUE.EMPTY;
      document.getElementById(this.FORGOT_PASSWORD_MESSAGE).innerHTML = config.FORM_VALUE.EMPTY;
    }
  }
};

</script>

<style>

</style>
