<template>
<div></div>
</template>

<script>
import { CognitoUser } from 'amazon-cognito-identity-js';

export default {
  name: 'ConfirmationRegistrationComponent',
  props: {
    username: { String },
    cognitoUser: { CognitoUser },
  },
};
</script>
