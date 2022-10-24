<template>
  <div class="register-component">
    <h1 class="register-component-title" id="title-header">Register an Account</h1>

    <input type="personalname" class="form-control" id="personalnameRegister" placeholder="Name">
    <input type="email" class="form-control" id="emailInputRegister" placeholder="Email">
    <input type="password" class="form-control" id="passwordInputRegister" placeholder="Password">
    <input type="password" class="form-control" id="confirmpass" placeholder="Confirm Password">
    <button type="button" class="register-button" v-on:click="registerUser()">Register</button>
  </div>
</template>

<script>
export default {
  name: 'RegisterComponent',
  data() {
    return {
      username: null,
      password: null,
      personalName: null,
      poolData: null,
    };
  },

  mounted() {
    // eslint-disable-next-line no-console
    console.log('Register Component is mounted');
    const jqueryScript = document.createElement('script');
    jqueryScript.setAttribute('src', 'https://code.jquery.com/jquery-1.11.3.min.js');

    const amazonCognitoAuthScript = document.createElement('script');
    amazonCognitoAuthScript.setAttribute('src', 'js/amazon-cognito-auth.min.js');

    const amazonSdkScript = document.createElement('script');
    amazonSdkScript.setAttribute('src', 'https://sdk.amazonaws.com/js/aws-sdk-2.7.16.min.js');

    const amazonCognitoIdentityScript = document.createElement('script');
    amazonCognitoIdentityScript.setAttribute('src', 'js/amazon-cognito-identity.min.js');

    const configScript = document.createElement('script');
    configScript.setAttribute('src', 'config.js');

    document.head.appendChild(jqueryScript);
    document.head.appendChild(amazonCognitoAuthScript);
    document.head.appendChild(amazonSdkScript);
    document.head.appendChild(amazonCognitoIdentityScript);
    document.head.appendChild(configScript);
  },

  created() {
    // eslint-disable-next-line no-console
    console.log('Document created!');
  },

  methods: {
    registerUser() {
      // eslint-disable-next-line no-console
      console.log('inside registeruser()');

      this.personalName = document.getElementById('personalnameRegister').value;
      this.username = document.getElementById('emailInputRegister').value;

      if (document.getElementById('passwordInputRegister').value !== document.getElementById('confirmpass').value) {
        // eslint-disable-next-line no-console
        console.log('Passwords do not match!');
        throw new Error('Passwords do not match');
      } else {
        this.password = document.getElementById('passwordInputRegister').value;
      }

      this.poolData = {
        // eslint-disable-next-line no-undef
        UserPoolId: _config.cognito.userPoolId,
        // eslint-disable-next-line no-undef
        ClientId: _config.cognito.clientId,
      };

      // let userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
    },
  },
};
</script>
