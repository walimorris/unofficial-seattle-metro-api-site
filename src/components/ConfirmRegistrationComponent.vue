<template>
<div v-if="!this.verified" id="confirm-registration">
  <h1 id="verified-header"></h1>
  <input type="password" class="form-control" id="verificationCode" placeholder="Enter Code">
  <button type="button" class="verify-button" v-on:click="verifyUser()">Verify</button>
</div>
</template>

<script>
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import { CognitoUser } from 'amazon-cognito-identity-js';
import Cookies from 'js-cookie';
import config from '../../config/config';

export default {
  name: 'ConfirmationRegistrationComponent',
  props: {
    username: { String },
    cognitoUser: { CognitoUser },
  },
  data() {
    return {
      verificationCode: null,
      confirmationResult: null, // possibly needed to re-verify a user
      authenticationDetails: null,
      basicVerifiedCookie: null,
      basicVerifiedCookieSet: false,
      userPool: null,
      userData: null,
      verified: false,
      cognitoUserClone: null,
    };
  },
  created() {
    const poolData = {
      UserPoolId: config.cognito.userPoolId,
      ClientId: config.cognito.clientId,
    };
    this.userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    const userData = {
      Username: this.username,
      Pool: this.userPool,
    };
    this.cognitoUserClone = new AmazonCognitoIdentity.CognitoUser(userData);
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
      // should add a limit to verification retry
      this.verificationCode = document.getElementById('verificationCode').value;
      if (this.verificationCode !== null) {
        if (this.cognitoUserClone !== null) {
          this.confirmMetroRegistration(this.cognitoUserClone);
        }
      } else {
        console.log('verification-code is null');
      }
    },

    /**
     * Confirm's user registration for Cognito Identity Management.
     * @param cognitoUser {CognitoUser}
     * @returns {Promise<void>}
     */
    async confirmMetroRegistration(cognitoUser) {
      document.getElementById('verified-header').innerHTML = 'verifying...';
      cognitoUser.confirmRegistration(this.verificationCode, true, (error, result) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.log(`Error verifying code: ${this.verificationCode}, verifying..`);
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

    setBasicVerifiedCookie() {
      if (this.basicVerifiedCookie === undefined || this.basicVerifiedCookie === null) {
        const value = this.generateRandomId(15);
        const basicVerifiedCookieName = '_Secure-BasicVerifiedCookie';
        Cookies.set(basicVerifiedCookieName, value, { expires: 7, sameSite: 'strict' });
        // eslint-disable-next-line max-len
        if (Cookies.get(basicVerifiedCookieName) !== undefined || Cookies.get(basicVerifiedCookieName) !== null) {
          // eslint-disable-next-line no-console
          console.log(`cookie set: ${basicVerifiedCookieName}`);
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

    /**
     * Generates a random id. Note: add to a shared utility folder to reuse.
     *
     * @param length the generated id length
     * @returns {string}
     */
    generateRandomId(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
  },
};
</script>

<style>
</style>
