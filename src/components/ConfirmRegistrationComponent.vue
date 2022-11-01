<template>
<div class="confirmRegistration" v-show="showConfirmationRegistrationForm_" id="confirm-registration">
  <h1 id="verified-header"></h1>
  <input type="password" class="form-control" id="verificationCode" placeholder="Enter Code">
  <button type="button" class="verify-button" v-on:click="verifyUser()">Verify</button>
  <h3 id="verification-message"></h3>
</div>
</template>

<script>
import { CognitoUser } from 'amazon-cognito-identity-js';
import Cookies from 'js-cookie';

export default {
  name: 'ConfirmationRegistrationComponent',
  props: {
    username: { String },
    cognitoUser: { CognitoUser },
    showConfirmationRegistrationForm: { Boolean }
  },
  data() {
    return {
      showConfirmationRegistrationForm_: this.showConfirmationRegistrationForm,
      verificationCode: null,
      confirmationResult: null, // possibly needed to re-verify a user
      authenticationDetails: null,
      basicVerifiedCookie: null,
      basicVerifiedCookieSet: false,
      verified: false,
      verificationRetry: 0,
      cognitoUserClone: null,
    };
  },
  created() {
    this.cognitoUserClone = this.$helpers.buildCognitoUser(this.username);
    this.basicVerifiedCookie = this.getBasicVerifiedCookieIfExists();
  },

  mounted() {
    this.insertVerificationTextOnMount();
  },

  methods: {

    /**
     * Verify a user with a given verification code after user registration.
     * @see CognitoUser
     */
    verifyUser() {
      if (this.verificationRetry < 3) {
        this.verificationRetry += 1;
        this.verificationCode = document.getElementById('verificationCode').value;
        if (this.verificationCode !== null) {
          if (this.cognitoUserClone !== null) {
            this.confirmMetroRegistration(this.cognitoUserClone);
          }
        } else {
          // counts as a retry
          document.getElementById('verification-message').innerHTML = `fail x${this.verificationRetry}`;
        }
      } else {
        // reached maximum retry, reload to sign in
        window.location.reload();
      }
      // verification did not work so remove any text in input for any further retry
      if (document.getElementById('verificationCode').value !== null) {
        document.getElementById('verificationCode').value = '';
      }

    },

    /**
     * Confirms user registration for Cognito Identity Management.
     * @param cognitoUser {CognitoUser}
     * @returns {Promise<void>}
     */
    async confirmMetroRegistration(cognitoUser) {
      document.getElementById('verified-header').innerHTML = 'Enter Verification Code';
      cognitoUser.confirmRegistration(this.verificationCode, true, (error, result) => {
        if (error) {
          document.getElementById('verification-message').innerHTML = `fail x${this.verificationRetry}`;
        } else {
          this.verified = true;
          this.confirmationResult = result;
          this.setBasicVerifiedCookie();
          window.location.reload();
        }
      });
      await (this.sleep(3000));
    },

    /**
     * Conducts a timeout in milliseconds.
     * @param ms time in ms
     * @returns {Promise<unknown>}
     */
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    insertVerificationTextOnMount() {
      document.getElementById('verified-header').innerHTML = 'Check email for verification code';
    },

    /**
     * Sets a basic verification cookie to utilize for further verification actions.
     */
    setBasicVerifiedCookie() {
      if (this.basicVerifiedCookie === undefined || this.basicVerifiedCookie === null) {
        const value = this.$helpers.generateRandomId(15);
        const basicVerifiedCookieName = '_Secure-BasicVerifiedCookie';
        Cookies.set(basicVerifiedCookieName, value, { expires: 7, sameSite: 'strict' });
        if (Cookies.get(basicVerifiedCookieName) !== undefined || Cookies.get(basicVerifiedCookieName) !== null) {
          this.basicVerifiedCookieSet = true;
        }
      }
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
.confirmRegistration {
}
</style>
