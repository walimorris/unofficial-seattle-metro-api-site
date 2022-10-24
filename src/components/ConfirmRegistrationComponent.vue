<template>
<div id="confirm-registration">
  <input type="text" class="form-control" id="verificationCode" placeholder="Enter Code">
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
      cognitoUserClone: null,
      authenticationDetails: null,
      userPool: null,
      verified: false,
    };
  },
  created() {
    const authenticationData = {
      Username: this.cognitoUser.username,
      Password: this.cognitoUser.password,
    };

    const poolData = {
      UserPoolId: config.cognito.userPoolId,
      ClientId: config.cognito.clientId,
    };

    // eslint-disable-next-line max-len
    this.authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    this.userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    const userData = {
      Username: this.username,
      Pool: this.userPool,
    };
    this.cognitoUserClone = new CognitoUser(userData);
  },

  methods: {
    verifyUser() {
      // eslint-disable-next-line no-console
      console.log('inside verifyUser()');
      this.verificationCode = document.getElementById('verificationCode').value;
      if (this.verificationCode !== null) {
        if (this.cognitoUserClone !== null) {
          // eslint-disable-next-line max-len
          this.cognitoUserClone.confirmRegistration(this.verificationCode, true, (error, result) => {
            if (error) {
              // eslint-disable-next-line no-console
              console.log(`Error verifying code: ${this.verificationCode}, verifying..`);
            }
            this.confirmationResult = result;
            // eslint-disable-next-line no-console
            console.log(`${this.username} is a registered and verified: ${this.result.text}`);
          });
        } else {
          // eslint-disable-next-line no-console
          console.log('CognitoUser is null');
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('verification-code is null');
      }
    },
  },
};
</script>
