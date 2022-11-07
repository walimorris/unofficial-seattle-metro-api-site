<template>
<div class="confirmRegistration" v-show="showConfirmationRegistrationForm_" :id="CONFIRM_REGISTRATION">
  <h1 :id="VERIFIED_HEADER"></h1>
  <input type="password" class="form-control" :id="VERIFICATION_CODE" placeholder="Enter Code">
  <button type="button" class="verification-button" :id="VERIFICATION_BUTTON" v-on:click="verifyUser()">Verify</button>
  <h3 :id="VERIFICATION_MESSAGE"></h3>
</div>
</template>

<script>
import { CognitoUser } from 'amazon-cognito-identity-js';
import Cookies from 'js-cookie';
import config from '../../config/config';

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

      // id attribute constants as exposed in the confirm-registration-form ^
      CONFIRM_REGISTRATION: 'confirm-registration',
      VERIFIED_HEADER: 'verified-header',
      VERIFICATION_CODE: 'verificationCode',
      VERIFICATION_MESSAGE: 'verification-message',
      VERIFICATION_BUTTON: 'verification-button',
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
        this.verificationCode = document.getElementById(this.VERIFICATION_CODE).value;
        if (this.verificationCode !== null) {
          if (this.cognitoUserClone !== null) {
            this.confirmMetroRegistration(this.cognitoUserClone);
          }
        } else {
          // counts as a retry
          document.getElementById(this.VERIFICATION_MESSAGE).innerHTML = `${config.FORM_ERROR_MESSAGES.FAIL}${this.verificationRetry}`;
        }
      } else {
        // reached maximum retry, reload to sign in
        window.location.reload();
      }
      // verification did not work so remove any text in input for any further retry
      if (document.getElementById(this.VERIFICATION_CODE).value !== null) {
        document.getElementById(this.VERIFICATION_CODE).value = config.FORM_VALUE.EMPTY;
      }

    },

    /**
     * Confirms user registration for Cognito Identity Management.
     * @param cognitoUser {CognitoUser}
     * @returns {Promise<void>}
     */
    async confirmMetroRegistration(cognitoUser) {
      document.getElementById(this.VERIFIED_HEADER).innerHTML = config.FORM_SUCCESS_MESSAGES.ENTER_CODE;
      cognitoUser.confirmRegistration(this.verificationCode, true, (error, result) => {
        if (error) {
          document.getElementById(this.VERIFICATION_MESSAGE).style.color = config.COLOR.LIGHT_RED;
          document.getElementById(this.VERIFICATION_MESSAGE).style.fontSize = config.FONT_SIZE.SMALL;
          document.getElementById(this.VERIFICATION_MESSAGE).innerHTML = `${config.FORM_ERROR_MESSAGES.FAIL} x${this.verificationRetry}`;
        } else {
          this.verified = true;
          this.confirmationResult = result;
          this.setBasicVerifiedCookie();
          window.location.reload();
        }
      });
      await (this.$helpers.sleep(3000));
    },

    insertVerificationTextOnMount() {
      document.getElementById(this.VERIFIED_HEADER).innerHTML = config.FORM_SUCCESS_MESSAGES.CHECK_EMAIL;
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

#confirm-registration {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

#verificationCode {
  margin-bottom: 2rem;
  width: 70%;
}

.verification-button {
  background: linear-gradient(#ff6100, rgba(255, 80, 80, 1));
  animation: btn 6.0s 3s infinite ease-in-out;
  transition: all 0.3s;
  border-radius: 4px;
  border: none;
  outline: none;
  width: 70%;
  height: 35px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
}

</style>
