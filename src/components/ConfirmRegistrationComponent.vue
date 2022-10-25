<template>
<div id="confirm-registration">
  <input type="password" class="form-control" id="verificationCode" placeholder="Enter Code">
  <button type="button" class="verify-button" v-on:click="verifyUser()">Verify</button>
</div>
</template>

<script>
import { CognitoUser } from 'amazon-cognito-identity-js';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
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
  },

  methods: {

    /**
     * Verify a user with a given verification code after user registration.
     * @see CognitoUser
     */
    verifyUser() {
      this.verificationCode = document.getElementById('verificationCode').value;
      if (this.verificationCode !== null) {
        if (this.cognitoUserClone !== null) {
          this.confirmMetroRegistration(this.cognitoUserClone);
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('verification-code is null');
      }
    },

    /**
     * Confirm's user registration for Cognito Identity Management.
     * @param cognitoUser {CognitoUser}
     * @returns {Promise<void>}
     */
    async confirmMetroRegistration(cognitoUser) {
      document.getElementById('title-header').innerHTML = 'verifying...';
      cognitoUser.confirmRegistration(this.verificationCode, true, (error, result) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.log(`Error verifying code: ${this.verificationCode}, verifying..`);
        } else {
          this.verified = true;
          this.confirmationResult = result;
        }
      });
      await (this.sleep(3000));
      if (this.verified === true) {
        document.getElementById('title-header').innerHTML = 'Verified!';
      }
    },

    /**
     * Conducts a timeout in milliseconds.
     * @param ms time in ms
     * @returns {Promise<unknown>}
     */
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>
