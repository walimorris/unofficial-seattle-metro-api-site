<template>
  <div class="unofficial-seattle-metro-spa">
    <h1 v-if="showRegistrationForm" class="register-component-title"
        id="title-header">Register an Account
    </h1>
    <form v-if="showRegistrationForm" id="registration-form">
      <input type="text" class="form-control" id="personalnameRegister" placeholder="Name">
      <input type="email" class="form-control" id="emailInputRegister" placeholder="Email">
      <input type="password" class="form-control" id="passwordInputRegister" placeholder="Password">
      <input type="password" class="form-control" id="confirmpass" placeholder="Confirm Password">
      <div class="buttons">
        <button type="button" class="register-button" v-on:click="registerUser()">Register</button>
        <button type="button" class="load-sign-in-button" v-on:click="loadSignInForm()">Sign in</button>
      </div>
    </form>
    <h3 v-if="showErrorMessage" id="registration-error-message"></h3>
    <div v-if="showConfirmationRegistrationForm">
      <confirmation-registration-component :username="username" :cognitoUser="cognitoUser"
                                           :showConfirmationRegistrationForm="showConfirmationRegistrationForm"/>
    </div>
  </div>
</template>

<script>
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import ConfirmationRegistrationComponent from '@/components/ConfirmRegistrationComponent.vue';
import Cookies from 'js-cookie';
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
      registered: false,
      cognitoUser: null,
      attributeList: [],
      showRegistrationForm: true,
      showConfirmationRegistrationForm: false,
      showErrorMessage: false,
      basicRegisteredCookieSet: false,
      basicRegisteredCookie: null,
    };
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
      this.personalName = document.getElementById('personalnameRegister').value;
      this.password = document.getElementById('passwordInputRegister').value;
      this.passwordConfirmation = document.getElementById('confirmpass').value;
      this.username = document.getElementById('emailInputRegister').value;

      if (this.password !== this.passwordConfirmation) {
        console.log('Passwords do not match!');
        throw new Error('Passwords do not match');
      }
      this.poolData = { UserPoolId: config.cognito.userPoolId, ClientId: config.cognito.clientId, };
      const userPool = new AmazonCognitoIdentity.CognitoUserPool(this.poolData);
      const dataEmail = { Name: 'email', Value: this.username, };
      const dataPersonalName = { Name: 'name', Value: this.personalName, };
      const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

      const attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
      this.attributeList.push(attributeEmail);
      this.attributeList.push(attributePersonalName);

      // sign user up through user pool
      userPool.signUp(this.username, this.password, this.attributeList, null, (error, result) => {
        if (error) {
          console.log(error.message);
          this.showErrorMessage = true;
          document.getElementById('registration-error-message').innerHTML = JSON.stringify(error) + error;
        } else {
          if (this.showErrorMessage === true) {
            this.showErrorMessage = false;
          }
          this.cognitoUser = result.user;
          console.log(`user name: ${this.cognitoUser.username}`);
          document.getElementById('title-header').innerHTML = 'Check your email for verification';
          this.registered = true;
          this.showConfirmationRegistrationForm = true;
          this.showRegistrationForm = false;
          this.setBasicRegisteredCookie();
        }
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

    loadSignInForm() {
      if (this.showErrorMessage === true) {
        this.showErrorMessage = false;
      }
      window.location.reload();
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
  .unofficial-seattle-metro-spa {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 50vw;
    border: 1px solid green;
  }

  #registration-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #registration-form > input {
    margin-bottom: 1rem;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 2rem;
    width: 11rem;
  }

  button {
    background-color: white;
    height: 1.5rem;
    width: 5rem;
    border: 1px solid gray;
    border-radius: 3px;
  }

  button:hover {
    cursor: pointer;
    color: white;
    background-color: #939292;
  }
</style>
