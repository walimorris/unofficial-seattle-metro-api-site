<template>
  <div id="forgot-password-component">
    <h1 id="forgot-password-component-header" v-show="showForgotPasswordForm">Forgot Password</h1>
    <div id="update-password-form" v-if="showUpdatePasswordForm">
      <UpdatePasswordComponent></UpdatePasswordComponent>
    </div>
    <form v-show="showForgotPasswordForm" id="forgot-password-form">
      <input type="email" id="forgot-password-username" placeholder="username">
      <button type="button"
              id="forgot-password-execute-button"
              v-on:click="executeForgotPassword()">Submit</button>
    </form>
    <div>
      <button v-show="showSignInButton" type="button" id="sign-in-view-button" v-on:click="loadSignInForm()">Sign In</button>
    </div>
    <h3 id="forgot-password-message"></h3>
    <h3 id="forgot-password-confirm-message"></h3>
  </div>
</template>

<script>
import UpdatePasswordComponent from '@/components/UpdatePasswordComponent';

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
      this.username = document.getElementById('forgot-password-username').value;
      if (this.username !== '') {
        if (this.$helpers.isValidUserName(this.username)) {
          // set up cognito user
          this.cognitoUser = this.$helpers.buildCognitoUser(this.username);
          await this.forgotPassword();
          await this.$helpers.sleep(2000); // can we do a spinner here
          if (document.getElementById('forgot-password-confirm-message').textContent === 'Success') {
            console.log('success content is rendered');
            this.removeForgotPasswordProperties();
            this.showUpdatePasswordForm = true;
          }
        } else {
          this.clearForgotPasswordInput();
          document.getElementById('forgot-password-message').innerHTML = 'invalid username';
        }
      } else {
        this.clearForgotPasswordInput();
        document.getElementById('forgot-password-message').innerHTML = 'empty username';
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
      if (document.getElementById('forgot-password-username').value !== null) {
        document.getElementById('forgot-password-username').value = '';
      }
    },

    /**
     * Removes forgot-password component properties and any text values.
     */
    removeForgotPasswordProperties() {
      console.log('inside remove-forgot-password-properties');
      this.showForgotPasswordForm = false;
      this.showSignInButton = false;
      document.getElementById('forgot-password-confirm-message').innerHTML = '';
      document.getElementById('forgot-password-message').innerHTML = '';
    }
  }
};

</script>

<style>

</style>
