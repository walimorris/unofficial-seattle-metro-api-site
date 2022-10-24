<template>
  <div class="register-component">
    <h1 class="register-component-title" id="title-header">Register an Account</h1>

    <input type="text" class="form-control" id="personalnameRegister" placeholder="Name">
    <input type="email" class="form-control" id="emailInputRegister" placeholder="Email">
    <input type="password" class="form-control" id="passwordInputRegister" placeholder="Password">
    <input type="password" class="form-control" id="confirmpass" placeholder="Confirm Password">
    <button type="button" class="register-button" v-on:click="registerUser()">Register</button>
    <div v-if="cognitoUser != null">
      <confirmation-registration-component :username="username" :cognitoUser="cognitoUser"/>
    </div>
  </div>
</template>

<script>
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';
import config from '../../config/config';

export default {
  name: 'RegisterComponent',
  components: { ConfirmationRegistrationComponent },
  data() {
    return {
      username: null,
      password: null,
      passwordConfirmation: null,
      personalName: null,
      poolData: null,
      cognitoUser: null,
      attributeList: [],
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

    const configScript = document.createElement('script');
    configScript.setAttribute('src', 'config.js');

    document.head.appendChild(jqueryScript);
    document.head.appendChild(amazonCognitoAuthScript);
    document.head.appendChild(amazonSdkScript);
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
      this.password = document.getElementById('passwordInputRegister').value;
      this.passwordConfirmation = document.getElementById('confirmpass').value;
      this.username = document.getElementById('emailInputRegister').value;

      if (this.password !== this.passwordConfirmation) {
        // eslint-disable-next-line no-console
        console.log('Passwords do not match!');
        throw new Error('Passwords do not match');
      }

      this.poolData = {
        UserPoolId: config.cognito.userPoolId,
        ClientId: config.cognito.clientId,
      };

      const userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);

      const dataEmail = {
        Name: 'email',
        Value: this.username,
      };
      // eslint-disable-next-line no-unused-vars
      const dataPersonalName = {
        Name: 'name',
        Value: this.personalName,
      };
      const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

      // eslint-disable-next-line max-len
      const attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
      this.attributeList.push(attributeEmail);
      this.attributeList.push(attributePersonalName);

      // sign user up through user pool
      userPool.signUp(this.username, this.password, this.attributeList, null, (error, result) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.log(error.message || JSON.stringify(error));
        }
        this.cognitoUser = result.user;
        // eslint-disable-next-line no-console
        console.log(`user name: ${this.cognitoUser.username}`);
        document.getElementById('title-header').innerHTML = 'Check your email for verification';
      });
    },
  },
};
</script>