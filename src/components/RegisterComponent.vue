<template>
  <div class="register-component">
    <h1 v-if="!basicRegisteredCookieSet" class="register-component-title"
        id="title-header">Register an Account
    </h1>
    <form v-if="!basicRegisteredCookieSet" id="registration-form">
      <input type="text" class="form-control" id="personalnameRegister" placeholder="Name">
      <input type="email" class="form-control" id="emailInputRegister" placeholder="Email">
      <input type="password" class="form-control" id="passwordInputRegister" placeholder="Password">
      <input type="password" class="form-control" id="confirmpass" placeholder="Confirm Password">
      <button type="button" class="register-button" v-on:click="registerUser()">Register</button>
    </form>
    <div v-if="cognitoUser !== null">
      <confirmation-registration-component :username="username" :cognitoUser="cognitoUser"/>
    </div>
    <div v-if="basicRegisteredCookieSet && basicVerifiedCookieSet" class="sign-in-component">
      <sign-in-component :basicRegisteredCookieSet="basicRegisteredCookieSet" :cognitoUser="cognitoUser"
                         :basicRegisteredCookie="basicRegisteredCookie"/>
    </div>
  </div>
</template>

<script>
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';
import SignInComponent from '@/components/SignInComponent.vue';
import Cookies from 'js-cookie';
import config from '../../config/config';

export default {
  name: 'RegisterComponent',
  components: { ConfirmationRegistrationComponent, SignInComponent },
  data() {
    return {
      username: null,
      password: null,
      passwordConfirmation: null,
      personalName: null,
      poolData: null,
      registered: false,
      cognitoUser: null,
      attributeList: [],
      basicRegisteredCookieSet: false,
      basicVerifiedCookieSet: false,
      basicRegisteredCookie: null,
      basicVerifiedCookie: null,
    };
  },

  mounted() {
    const amazonCognitoAuthScript = document.createElement('script');
    amazonCognitoAuthScript.setAttribute('src', 'js/amazon-cognito-auth.min.js');

    const amazonSdkScript = document.createElement('script');
    amazonSdkScript.setAttribute('src', 'https://sdk.amazonaws.com/js/aws-sdk-2.7.16.min.js');

    document.head.appendChild(amazonCognitoAuthScript);
    document.head.appendChild(amazonSdkScript);
  },

  created() {
    this.basicRegisteredCookie = this.getBasicRegisteredCookieIfExists();
    this.basicVerifiedCookie = this.getBasicVerifiedCookieIfExists();
    if (this.basicRegisteredCookie !== null && this.basicRegisteredCookie !== undefined) {
      this.basicRegisteredCookieSet = true;
    }
    if (this.basicVerifiedCookie !== null && this.basicVerifiedCookie !== undefined) {
      this.basicVerifiedCookieSet = true;
    }
  },

  methods: {

    /**
     * Register a user based on input from registration form. A Cognito User-Pool is
     * instantiated with user-pool-id and client-id. An attribute list is created to
     * push required user profile attributes. These attributes, along with given
     * form attributes will act as parameters to the user-pool signup function.
     *
     * @see AmazonCognitoIdentity
     * @link https://aws.amazon.com/blogs/mobile/accessing-your-user-pools-using-the-amazon-cognito-identity-sdk-for-javascript/
     */
    registerUser() {
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
      const dataPersonalName = {
        Name: 'name',
        Value: this.personalName,
      };
      const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

      const attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
      this.attributeList.push(attributeEmail);
      this.attributeList.push(attributePersonalName);

      // sign user up through user pool
      userPool.signUp(this.username, this.password, this.attributeList, null, (error, result) => {
        if (error) {
          console.log(error.message || JSON.stringify(error));
        }
        this.cognitoUser = result.user;
        console.log(`user name: ${this.cognitoUser.username}`);
        document.getElementById('title-header').innerHTML = 'Check your email for verification';
        this.registered = true;
        this.setBasicRegisteredCookie();
      });
    },

    /**
     * Sets a basic registered cookie that determines if a user is returning and has completed
     * registration.
     */
    setBasicRegisteredCookie() {
      if (this.registered === true) {
        const value = this.generateRandomId(15);
        const basicRegisteredCookieName = '_Secure-BasicRegisteredCookie';
        Cookies.set(basicRegisteredCookieName, value, { expires: 7, sameSite: 'strict' });
        if (Cookies.get(basicRegisteredCookieName) !== undefined) {
          // eslint-disable-next-line no-console
          console.log(`cookie set: ${basicRegisteredCookieName}`);
          this.basicRegisteredCookieSet = true;
        }
      }
    },

    /**
     * Gets the secure basic registered cookie if it exists.
     *
     * @see Cookies
     * @returns {String}
     */
    getBasicRegisteredCookieIfExists() {
      return Cookies.get('_Secure-BasicRegisteredCookie');
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
     * Generates a random id.
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
