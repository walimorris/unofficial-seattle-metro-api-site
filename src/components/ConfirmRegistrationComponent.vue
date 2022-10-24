<template>
<div id="confirm-registration">
  <input type="text" class="form-control" id="verificationCode" placeholder="Enter Code">
  <button type="button" class="verify-button" v-on:click="verifyUser()">Verify</button>
</div>
</template>

<script>
import { CognitoUser } from 'amazon-cognito-identity-js';

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
    };
  },

  methods: {
    verifyUser() {
      // eslint-disable-next-line no-console
      console.log('inside verifyUser()');
      this.verificationCode = document.getElementById('verificationCode').value;
      if (this.verificationCode !== null) {
        this.cognitoUser.confirmRegistration(this.verificationCode, true, (error, result) => {
          if (error) {
            throw new Error(`Error verifying code: ${this.verificationCode}`);
          }
          this.confirmationResult = result;
          // eslint-disable-next-line no-console
          console.log(`${this.username} is a registered and verified: ${this.result.text}`);
        });
      } else {
        // eslint-disable-next-line no-console
        console.log('verification-code is null');
      }
    },
  },
};
</script>
