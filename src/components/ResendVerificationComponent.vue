<template>
  <div :id="RESEND_VERIFICATION">
    <h1 v-show="showResendVerificationCodeForm" :id="RESEND_VERIFICATION_HEADER">Resend Verification Form</h1>
    <form v-show="showResendVerificationCodeForm" :id="RESEND_VERIFICATION_FORM">
      <input type="email" class="form-control" :id="USER_NAME " placeholder="email">
      <p :id="RESEND_VERIFICATION_MESSAGE"></p>
      <button type="button" class="verify-button"
              :id="RESEND_VERIFICATION_BUTTON"
              v-on:click="resendVerificationCode()">Send Code</button>
    </form>
    <button v-show="showSignInButton"
            :id="LOAD_SIGN_IN_BUTTON"
            type="button"
            class="load-sign-in-button"
            v-on:click="loadSignInForm()">Sign in</button>
    <div :id="VIEW_TO_CONFIRMATION_REG_FORM" v-if="showConfirmationRegistrationForm">
      <confirmation-registration-component :username="username"
                                           :cognitoUser="cognitoUser"
                                           :showConfirmationRegistrationForm="showConfirmationRegistrationForm"/>
    </div>
  </div>
</template>

<script>

import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';
import config from '../../config/config';

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

      // id attribute constants as exposed in the resend-verification-form ^
      USER_NAME: 'user-email',
      RESEND_VERIFICATION: 'resend-verification',
      RESEND_VERIFICATION_FORM: 'resend-verification-form',
      RESEND_VERIFICATION_MESSAGE: 'resend-verification-message',
      RESEND_VERIFICATION_HEADER: 'resend-verification-header',
      RESEND_VERIFICATION_BUTTON: 'resend-verification-button',
      LOAD_SIGN_IN_BUTTON: 'load-sign-button',
      VIEW_TO_CONFIRMATION_REG_FORM: 'view-to-confirmation-registration-form',
    };
  },

  methods: {

    /**
     * Process should be triggered on a user click to resend a user verification code. Given that
     * the resend-verification-form has a valid username, resends a confirmation code to a valid
     * user's email address. Successful codes received by user in email can be used to validate
     * a user's account when the ConfirmRegistrationForm appears.
     */
    resendVerificationCode() {
      this.username = document.getElementById(this.USER_NAME).value;
      if (this.username !== config.FORM_VALUE.EMPTY) {
        if (this.$helpers.isValidUserName(this.username)) {
          this.cognitoUser = this.$helpers.buildCognitoUser(this.username);

          this.cognitoUser.resendConfirmationCode((error, result) => {
            if (error) {
              this.renderErrorMessageWithAttributes(error.message);
              if (document.getElementById(this.USER_NAME).value !== null) {
                document.getElementById(this.USER_NAME).value = config.FORM_VALUE.EMPTY;
              }
            } else {
              this.renderSuccessMessageWithAttributes(config.FORM_SUCCESS_MESSAGES.CHECK_EMAIL);
              this.codeDeliveryDetails = result;
              this.loadConfirmRegistrationForm();
            }
          });
        } else {
          this.renderErrorMessageWithAttributes(config.FORM_ERROR_MESSAGES.INVALID_USERNAME);
        }
      } else {
        this.renderErrorMessageWithAttributes(config.FORM_ERROR_MESSAGES.EMPTY_USERNAME);
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
      if (document.getElementById(this.RESEND_VERIFICATION_MESSAGE).innerHTML !== null) {
        document.getElementById(this.RESEND_VERIFICATION_MESSAGE).innerHTML = config.FORM_VALUE.EMPTY;
      }
      this.showResendVerificationCodeForm = false;
    },

    /**
     * Renders error message on resend-verification-form with clear error attributes such as red
     * font, outlining input element with red color, and rendering a useful error message.
     *
     * @param message error message rendered on form
     */
    renderErrorMessageWithAttributes(message) {
      document.getElementById(this.USER_NAME).style.borderColor = config.COLOR.LIGHT_RED;
      document.getElementById(this.RESEND_VERIFICATION_MESSAGE).style.color = config.COLOR.LIGHT_RED;
      document.getElementById(this.RESEND_VERIFICATION_MESSAGE).style.fontSize = config.FONT_SIZE.SMALL;
      document.getElementById(this.RESEND_VERIFICATION_MESSAGE).innerHTML = message;
      document.getElementById(this.USER_NAME).value = config.FORM_VALUE.EMPTY;
    },

    /**
     * Renders success message on resend-verification-form.
     *
     * @param message success message rendered on form
     */
    renderSuccessMessageWithAttributes(message) {
      document.getElementById(this.USER_NAME).style.borderColor = config.COLOR.BLACK;
      document.getElementById(this.RESEND_VERIFICATION_MESSAGE).style.color = config.COLOR.BLACK;
      document.getElementById(this.RESEND_VERIFICATION_MESSAGE).style.fontSize = config.FONT_SIZE.SMALL;
      document.getElementById(this.RESEND_VERIFICATION_MESSAGE).innerHTML = message;
      document.getElementById(this.USER_NAME).value = config.FORM_VALUE.EMPTY;
    }
  },
};

</script>

<style>

</style>
