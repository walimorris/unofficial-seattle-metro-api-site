<template>
  <div class="unofficial-seattle-metro-spa" :id="REGISTER_COMPONENT_SPA">
    <h2 v-if="showRegistrationForm" class="register-component-title"
        :id="REGISTER_TITLE_HEADER">Register an Account
    </h2>
    <form v-if="showRegistrationForm" :id="REGISTER_FORM">
      <input type="text" class="form-control" :id="PERSONAL_NAME_REGISTER" placeholder="Name">
      <input type="email" class="form-control" :id="EMAIL_INPUT_REGISTER" placeholder="Email">
      <input type="password" class="form-control" :id="PASSWORD_INPUT_REGISTER" placeholder="Password">
      <input type="password" class="form-control" :id="CONFIRM_PASSWORD" placeholder="Confirm Password">
      <h3 v-show="showErrorMessage" :id="REGISTER_ERROR_MESSAGE"></h3>
      <div class="buttons">
        <button type="button" class="register-button" v-on:click="registerUser()">Register</button>
        <p :id="LOAD_SIGN_IN_TAG">Already have an account? <a :id="LOAD_SIGN_IN_BUTTON" href="#">Sign in</a></p>
      </div>
    </form>
    <div v-if="showConfirmationRegistrationForm">
      <confirmation-registration-component :username="username" :cognitoUser="cognitoUser"
                                           :showConfirmationRegistrationForm="showConfirmationRegistrationForm"/>
    </div>
  </div>
</template>

<script>
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
      userPool: null,
      registered: false,
      cognitoUser: null,
      attributeList: [],
      showRegistrationForm: true,
      showConfirmationRegistrationForm: false,
      showErrorMessage: false,
      basicRegisteredCookieSet: false,
      basicRegisteredCookie: null,

      REGISTER_COMPONENT_SPA: 'unofficial-seattle-metro-spa',
      REGISTER_TITLE_HEADER: 'title-header',
      REGISTER_FORM: 'registration-form',
      PERSONAL_NAME_REGISTER: 'personalnameRegister',
      EMAIL_INPUT_REGISTER: 'emailInputRegister',
      PASSWORD_INPUT_REGISTER: 'passwordInputRegister',
      CONFIRM_PASSWORD: 'confirmpass',
      REGISTER_ERROR_MESSAGE: 'registration-error-message',
      LOAD_SIGN_IN_BUTTON: 'load-sign-in-button',
      LOAD_SIGN_IN_TAG: 'load-sign-in-tag',
    };
  },

  mounted() {

    const signInElement = document.getElementById(this.LOAD_SIGN_IN_BUTTON);
    signInElement.addEventListener('click', () => {
      this.loadSignInForm();
    });
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
      this.personalName = document.getElementById(this.PERSONAL_NAME_REGISTER).value;
      this.password = document.getElementById(this.PASSWORD_INPUT_REGISTER).value;
      this.passwordConfirmation = document.getElementById(this.CONFIRM_PASSWORD).value;
      this.username = document.getElementById(this.EMAIL_INPUT_REGISTER).value;

      const errorMessage = this.validateRegistrationInputs(this.username, this.personalName,
        this.password, this.passwordConfirmation);

      if (errorMessage !== config.FORM_VALUE.EMPTY) {
        this.renderErrorMessage(errorMessage);
      } else {
        // hide errors if rendered
        this.showErrorMessage = false;
        this.poolData = this.$helpers.collectUserPoolData();
        this.userPool = this.$helpers.getUserPool(this.poolData);
        const dataEmail = { Name: 'email', Value: this.username, };
        const dataPersonalName = { Name: 'name', Value: this.personalName, };
        const attributeEmail = this.$helpers.getCognitoAttributeEmail(dataEmail);
        const attributePersonalName = this.$helpers.getCognitoAttributePersonalName(dataPersonalName);

        this.attributeList.push(attributeEmail);
        this.attributeList.push(attributePersonalName);
        this.signUpUser(this.username, this.password, this.attributeList, null);
      }
    },

    signUpUser(username, password, attributeList, validationData) {
      // sign user up through user pool
      this.userPool.signUp(username, password, attributeList, validationData, (error, result) => {
        if (error) {
          this.showErrorMessage = true;
          this.renderErrorMessage(error.message);
        } else {
          if (this.showErrorMessage === true) {
            this.showErrorMessage = false;
          }
          this.cognitoUser = result.user;
          document.getElementById(this.REGISTER_TITLE_HEADER).innerHTML = config.FORM_SUCCESS_MESSAGES.CHECK_EMAIL;
          this.registered = true;
          this.setBasicRegisteredCookie();
          this.showConfirmationRegistrationForm = true;
          this.showRegistrationForm = false;
        }
      });
    },

    validateRegistrationInputs(username, personalName, password, passwordConfirmation) {
      let errorMessage = '';
      if (username === '' || personalName === '' || password === '' || passwordConfirmation === '') {
        return errorMessage += `${config.FORM_ERROR_MESSAGES.MISSING_VALUE}`;
      }
      if (!this.$helpers.isValidUserName(username)) {
        errorMessage += this.$helpers.addNonBreakingSpace(6) +
          `${config.FORM_ERROR_MESSAGES.INVALID_USERNAME}`;
      }
      if (password !== passwordConfirmation) {
        errorMessage += `<br/>${config.FORM_ERROR_MESSAGES.PASSWORD_MISMATCH}`;
      }
      return errorMessage;
    },

    renderErrorMessage(errorMessage) {
      this.showErrorMessage = true;
      document.getElementById(this.REGISTER_ERROR_MESSAGE).style.color = config.COLOR.LIGHT_RED;
      document.getElementById(this.REGISTER_ERROR_MESSAGE).style.fontSize = config.FONT_SIZE.SMALL;
      document.getElementById(this.REGISTER_ERROR_MESSAGE).innerHTML = errorMessage;
      this.clearFormInputValues();
    },

    clearFormInputValues() {
      document.getElementById(this.PERSONAL_NAME_REGISTER).value = config.FORM_VALUE.EMPTY;
      document.getElementById(this.PASSWORD_INPUT_REGISTER).value = config.FORM_VALUE.EMPTY;
      document.getElementById(this.CONFIRM_PASSWORD).value = config.FORM_VALUE.EMPTY;
      document.getElementById(this.EMAIL_INPUT_REGISTER).value = config.FORM_VALUE.EMPTY;
    },

    /**
     * Sets a basic registered cookie that determines if a user is returning and has completed
     * registration.
     */
    setBasicRegisteredCookie() {
      if (this.registered === true) {
        const value = this.$helpers.generateRandomId(15);
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
  },
};
</script>

<style>
  .unofficial-seattle-metro-spa {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  #registration-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #registration-form > input {
    margin-bottom: .8rem;
  }

  .register-button {
    background: linear-gradient(#ff6100, rgba(255, 80, 80, 1));
    animation: btn 6.0s 3s infinite ease-in-out;
    transition: all 0.3s;
    border-radius: 4px;
    border: none;
    outline: none;
    margin-top: 2rem;
    width: 100%;
    height: 35px;
    font-size: 15px;
    font-weight: 500;
    color: #fff;
  }

  .register-button:hover {
    opacity: 2;
    cursor: pointer;
    box-shadow: 0 2px 2px -3px #ff6100;
  }

  #load-sign-in-tag {
    font-size: 14px;
  }
</style>
