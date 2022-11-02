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

import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';

export default {
  name: 'ResendVerificationComponent',
  components: { ConfirmationRegistrationComponent },
  data() {
    return {
      username: null,
      cognitoUser: null,
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
      if (this.username !== undefined) {
        this.cognitoUser = this.$helpers.buildCognitoUser(this.username);

        this.cognitoUser.resendConfirmationCode((error, result) => {
          if (error) {
            document.getElementById('resend-verification-message').innerHTML = `${error}`;
            if (document.getElementById('user-email').value !== null) {
              document.getElementById('user-email').value = '';
            }
          } else {
            document.getElementById('resend-verification-message').innerHTML = 'Check Email for Code';
            this.codeDeliveryDetails = result;
            this.loadConfirmRegistrationForm();
          }
        });
      }
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
    },

    removeResendVerificationFeatures() {
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
