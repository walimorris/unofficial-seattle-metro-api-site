<template>
  <div :id="SIGN_IN_COMPONENT">
    <h2 :id="SIGN_IN_DEFAULT_HEADER" v-show="showSignInForm">Sign in to your account</h2>
    <div :id="REGISTRATION_FORM" v-show="showRegistrationForm">
      <RegisterComponent></RegisterComponent>
    </div>
    <div :id="RESEND_VERIFICATION_FORM" v-if="showResendVerificationForm">
      <ResendVerificationComponent></ResendVerificationComponent>
    </div>
    <div :id="FORGOT_PASSWORD_FORM" v-if="showForgotPasswordForm">
      <ForgotPasswordComponent></ForgotPasswordComponent>
    </div>
    <form v-show="showSignInForm" :id="SIGN_IN_FORM">
      <input type="email" class="form-control" :id="SIGN_IN_USERNAME" placeholder="User Name">
      <input type="password" class="form-control" :id="SIGN_IN_PASSWORD" placeholder="Password">
      <p v-show="showForgotPasswordButton" :id="FORGOT_PASSWORD_TAG">Forgot password? <a :id="FORGOT_PASSWORD_BUTTON" href="#">Reset here</a></p>
      <button type="button" class="sign-in-button" :id="SIGN_IN_BUTTON" v-on:click="signIn()">Get started</button>
      <p :id="REGISTER_TAG">Not Registered? <a :id="REGISTER_BUTTON" href="#">Register an account</a></p>
      <h3 :id="AUTHORIZED_TAG"></h3>
      <h3 :id="UNAUTHORIZED_REASON"></h3>
    </form>
    <p v-show="showRegisterButton" :id="RESEND_VERIFICATION_TAG">Failed confirmation? <a :id="RESEND_VERIFICATION_BUTTON" href="#">Resend code</a></p>
    <div :id="UNDER_CONSTRUCTION_COMPONENT" v-if="showUnderConstructionComponent">
      <UnderConstructionComponent :username="username" :cognitoUser="cognitoUser" :cognitoResult="cognitoResult" :cachedCognitoSession="cachedCognitoSession">
      </UnderConstructionComponent>
    </div>
  </div>
</template>

<script>

import RegisterComponent from '@/components/RegisterComponent.vue';
import ResendVerificationComponent from '@/components/ResendVerificationComponent.vue';
import ForgotPasswordComponent from '@/components/ForgotPasswordComponent';
import UnderConstructionComponent from '@/components/UnderConstructionComponent';
import * as CognitoIdentityServiceProvider from 'amazon-cognito-identity-js';
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import Cookies from 'js-cookie';
import config from '../../config/config';

export default {
  name: 'SignInComponent',
  components: {
    UnderConstructionComponent,
    ForgotPasswordComponent,
    RegisterComponent,
    ResendVerificationComponent
  },
  data() {
    return {
      username: null,
      password: null,
      authenticationData: null,
      cognitoUser: null,
      sessionData: null,
      cachedCognitoSession: null,
      cognitoResult: null,
      showSignInForm: true,
      showRegistrationForm: false,
      showRegisterButton: true,
      showResendVerificationForm: false,
      showResendVerificationButton: true,
      showForgotPasswordForm: false,
      showForgotPasswordButton: true,
      showUnderConstructionComponent: false,
      basicRegisteredCookieSet: null,
      basicRegisteredCookie: null,
      basicVerifiedCookieSet: null,
      basicVerifiedCookie: null,
      localStorage: window.localStorage,

      SIGN_IN_COMPONENT: 'sign-in',
      FORGOT_PASSWORD_BUTTON: 'forgot-password-button',
      FORGOT_PASSWORD_TAG: 'forgot-password-tag',
      SIGN_IN_DEFAULT_HEADER: 'sign-in-default-header',
      REGISTRATION_FORM: 'registration-form',
      RESEND_VERIFICATION_FORM: 'resend-verification-form',
      FORGOT_PASSWORD_FORM: 'forgot-password-form',
      SIGN_IN_FORM: 'sign-in-form',
      SIGN_IN_USERNAME: 'sign-in-username',
      SIGN_IN_PASSWORD: 'sign-in-password',
      AUTHORIZED_TAG: 'authorized-tag',
      UNAUTHORIZED_REASON: 'unauthorized-reason',
      SIGN_IN_BUTTON: 'sign-in-button',
      REGISTER_BUTTON: 'register-button',
      REGISTER_TAG: 'register-tag',
      RESEND_VERIFICATION_TAG: 'resend-verification-tag',
      RESEND_VERIFICATION_BUTTON: 'resend-verification-button',
      UNDER_CONSTRUCTION_COMPONENT: 'under-construction-component',
    };
  },

  mounted() {
    const registerElement = document.getElementById(this.REGISTER_BUTTON);
    const forgotPasswordElement = document.getElementById(this.FORGOT_PASSWORD_BUTTON);
    const resendElement = document.getElementById(this.RESEND_VERIFICATION_BUTTON);

    // add if statement to ensure button exists before calling
    if (registerElement) {
      registerElement.addEventListener(config.EVENT.CLICK, () => {
        this.loadRegistrationForm();
      });
    }

    if (forgotPasswordElement) {
      forgotPasswordElement.addEventListener(config.EVENT.CLICK, () => {
        this.loadForgotPasswordForm();
      });
    }

    if (resendElement) {
      resendElement.addEventListener(config.EVENT.CLICK, () => {
        this.loadResendVerificationForm();
      });
    }
  },

  created() {
    this.basicRegisteredCookie = this.getBasicRegisteredCookieIfExists();
    this.basicVerifiedCookie = this.getBasicVerifiedCookieIfExists();
    if (this.basicRegisteredCookie !== null) {
      this.basicRegisteredCookieSet = true;
    }
    if (this.basicVerifiedCookie !== null) {
      this.basicVerifiedCookieSet = true;
    }

    this.sessionData = this.getSessionData();

    if (this.sessionData !== null) {
      const cachedSession = new CognitoUserSession(this.sessionData);
      if (cachedSession.isValid()) {
        this.cachedCognitoSession = cachedSession;
        this.loadUnderConstructionComponent();
      } else {
        console.log('invalid session: must authenticate');
      }
    }
  },

  methods: {

    /**
     * Sign in using username, password, cognito user pool id, client id and using this information
     * to build authentication details to authenticate user with cognito.
     *
     * @see CognitoIdentityServiceProvider
     */
    async signIn() {
      this.toggleAuthorizedTagOff();
      this.removeInputBorderStyle();
      if (this.collectAuthenticationData()) {
        this.cognitoUser = this.$helpers.buildCognitoUser(this.username);
        const authenticationDetails = new CognitoIdentityServiceProvider
          .AuthenticationDetails(this.authenticationData);

        this.cognitoResult = await this.authenticateUser(authenticationDetails);
        this.removeSignInInputValues();
        await this.$helpers.sleep(2000);
        if (document.getElementById('authorized-tag').innerHTML === '*Authorized*') {
          // remove any sign-in elements and show under-construction component
          this.loadUnderConstructionComponent();
        }
      }
    },

    /**
     * Collects authentication data from user sign in credentials: username and password.
     *
     * @return {boolean} collected username and password returns true and false otherwise
     */
    collectAuthenticationData() {
      this.username = document.getElementById(this.SIGN_IN_USERNAME).value;
      this.password = document.getElementById(this.SIGN_IN_PASSWORD).value;

      // checks for any missing sign-in credential
      if (this.username === '' || this.password === '') {
        this.removeSignInInputValues();
        this.renderErrorMessage(config.FORM_ERROR_MESSAGES.MISSING_VALUE)
        return false;
      } else {
        if (this.$helpers.isValidUserName(this.username)) {
          this.authenticationData = { Username: this.username, Password: this.password, };
          return true;
        } else {
          // report in valid username
          this.removeSignInInputValues();
          this.renderErrorMessage(config.FORM_ERROR_MESSAGES.INVALID_USERNAME)
        }
      }
      return false;
    },

    /**
     * Authenticates a CognitoUser with username, password and user pool authentication data.
     * @param authenticationData authentication object consists of username, password, user pool data
     *
     * @see CognitoIdentityServiceProvider
     * @see AmazonCognitoIdentity
     * @see CognitoUser
     */
    async authenticateUser(authenticationData) {
      if (authenticationData !== null) {
        return new Promise((resolve, reject) => {
          this.cognitoUser.authenticateUser(authenticationData, {

            onSuccess: (result) => {
              // console.log(`access token=${result.getAccessToken().getJwtToken()}`);
              // console.log(`accessID=${JSON.stringify(result.getIdToken())}`)
              if (document.getElementById('authorized-tag').innerHTML !== null) {
                document.getElementById('authorized-tag').innerHTML = '*Authorized*';
              }
              if (document.getElementById('unauthorized-reason').innerHTML !== null) {
                document.getElementById('unauthorized-reason').innerHTML = '';
              }
              resolve(result);
            },
            onFailure: (error) => {
              console.log(`Error authenticating user: ${this.username} with ${error}`);
              document.getElementById('authorized-tag').innerHTML = '*Not Authorized*';
              document.getElementById('unauthorized-reason').innerHTML = error.message;
            },
          });
        })
      }
    },

    /**
     * Builds an object that holds user session data as parsed from local storage or null otherwise.
     *
     * @return {null| {
     * IdToken: module:amazon-cognito-identity-js.CognitoIdToken,
     * RefreshToken: module:amazon-cognito-identity-js.CognitoRefreshToken,
     * AccessToken: module:amazon-cognito-identity-js.CognitoAccessToken,
     * ClockDrift: (number|number)
     * }}
     */
    getSessionData() {
      // pull session data and render view based on active session
      const keyPrefix1 = `CognitoIdentityServiceProvider.${config.cognito.clientId}`;
      const lastUserKey = `${keyPrefix1}.LastAuthUser`;
      const username = this.localStorage.getItem(lastUserKey);
      const keyPrefix2 = `${keyPrefix1}.${username}`;

      const idTokenKey = `${keyPrefix2}.idToken`;
      const accessTokenKey = `${keyPrefix2}.accessToken`;
      const refreshTokenKey = `${keyPrefix2}.refreshToken`;
      const clockDriftKey = `${keyPrefix2}.clockDrift`;

      if (this.localStorage.getItem(idTokenKey)) {
        const idToken = new CognitoIdToken({
          IdToken: this.localStorage.getItem(idTokenKey),
        });
        const accessToken = new CognitoAccessToken({
          AccessToken: this.localStorage.getItem(accessTokenKey),
        });
        const refreshToken = new CognitoRefreshToken({
          RefreshToken: this.localStorage.getItem(refreshTokenKey),
        });
        const clockDrift = parseInt(this.localStorage.getItem(clockDriftKey), 0) || 0;

        return {
          IdToken: idToken,
          AccessToken: accessToken,
          RefreshToken: refreshToken,
          ClockDrift: clockDrift,
        };
      }
      return null;
    },

    /**
     * Renders error message, updates form input border style, font size and font color.
     *
     * @param errorMessage error message to render
     */
    renderErrorMessage(errorMessage) {
      document.getElementById(this.UNAUTHORIZED_REASON).style.color = config.COLOR.LIGHT_RED;
      document.getElementById(this.UNAUTHORIZED_REASON).style.fontSize = config.FONT_SIZE.SMALL;
      document.getElementById(this.UNAUTHORIZED_REASON).innerHTML = errorMessage;
      if (errorMessage.includes(config.FORM_ERROR_MESSAGES.MISSING_VALUE)) {
        document.getElementById(this.SIGN_IN_USERNAME).style.borderColor = config.COLOR.LIGHT_RED;
        document.getElementById(this.SIGN_IN_PASSWORD).style.borderColor = config.COLOR.LIGHT_RED;
      } else {
        if (errorMessage.includes(config.FORM_ERROR_MESSAGES.INVALID_USERNAME)) {
          document.getElementById(this.SIGN_IN_USERNAME).style.borderColor = config.COLOR.LIGHT_RED;
        }
      }
      this.clearFormInputValues();
    },

    /**
     * Loads registration form from the sign in view, this action removes any sign in
     * attributes or text.
     */
    loadRegistrationForm() {
      this.removeInputBorderStyle();
      this.removeSignInFeatures();
      this.showRegistrationForm = true;
    },

    /**
     * Loads resend validation code form from the sign in view, this action removes any sign in
     * attributes or text.
     */
    loadResendVerificationForm() {
      this.removeInputBorderStyle();
      this.removeSignInFeatures();
      this.showResendVerificationForm = true;
    },

    /**
     * Loads forgot password form from the sign in view, this action removes any sign
     * in attributes or text.
     */
    loadForgotPasswordForm() {
      this.removeInputBorderStyle();
      this.removeSignInFeatures();
      this.showForgotPasswordForm = true;
    },

    loadUnderConstructionComponent() {
      this.removeInputBorderStyle();
      this.removeSignInFeatures();
      // remove form box and shadow
      if (document.getElementById('sign-in') !== null) {
        document.getElementById('sign-in').style.all = 'unset';
      }
      this.showUnderConstructionComponent = true;
    },

    /**
     * Removes all sign-in features, including error messages, from the view.
     */
    removeSignInFeatures() {
      // remove register button && resend verification button
      this.showResendVerificationButton = false;
      this.showRegisterButton = false;
      this.showForgotPasswordButton = false;
      this.toggleAuthorizedTagOff();
      this.toggleUnAuthorizedReasonOff();
      this.showSignInForm = false;
    },

    /**
     * Clears Sign in form input values.
     */
    clearFormInputValues() {
      document.getElementById(this.SIGN_IN_USERNAME).value = config.FORM_VALUE.EMPTY;
      document.getElementById(this.SIGN_IN_PASSWORD).value = config.FORM_VALUE.EMPTY;
    },

    /**
     * Clears sign-in username and password input values.
     */
    removeSignInInputValues() {
      document.getElementById(this.SIGN_IN_USERNAME).value = '';
      document.getElementById(this.SIGN_IN_PASSWORD).value = '';
    },

    /**
     * Clears unauthorized-reason element of any text content.
     */
    toggleUnAuthorizedReasonOff() {
      if (document.getElementById(this.UNAUTHORIZED_REASON) !== null) {
        if (document.getElementById(this.UNAUTHORIZED_REASON).innerHTML !== null) {
          document.getElementById(this.UNAUTHORIZED_REASON).innerHTML = '';
        }
      }
    },

    /**
     * Removes form input values border styling.
     */
    removeInputBorderStyle() {
      if (document.getElementById(this.SIGN_IN_USERNAME) !== null && document.getElementById(this.SIGN_IN_PASSWORD) !== null) {
        document.getElementById(this.SIGN_IN_USERNAME).style.borderColor = config.COLOR.BLACK;
        document.getElementById(this.SIGN_IN_PASSWORD).style.borderColor = config.COLOR.BLACK;
      }
    },

    /**
     * Clears authorized-tag element of any text content.
     */
    toggleAuthorizedTagOff() {
      if (document.getElementById(this.AUTHORIZED_TAG) !== null) {
        if (document.getElementById(this.AUTHORIZED_TAG).innerHTML !== null) {
          document.getElementById(this.AUTHORIZED_TAG).innerHTML = '';
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
  },
};

</script>

<style>
  #sign-in {
    display: flex;
    margin: auto;
    height: auto;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 40vw;
    border: 3px solid #8e8d8d;
    box-shadow: 10px 10px #9f9f9f;
    background-color: white;
  }

  h2 {
    padding-bottom: .8rem;
  }

  #sign-in-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  input {
    margin-bottom: 2rem;
  }

  .form-control {
    border: 0;
    padding: 0;
    z-index: 1;
    background-color: transparent;
    border-bottom: 1px solid #d3d3d3;
    font: inherit;
    width: 95%;
    font-size: 14px;
    line-height: 30px;
    border-bottom-color: #665856;
    color: #665856;
  }

  .form-control:focus {
    outline: 0;
    border-bottom: 2px solid #665856;
  }

  .form-control::placeholder {
    color: #8597a3;
    top: 20px;
  }

  .form-control:focus::placeholder {
    font-weight: bold;
  }

  .sign-in-button {
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

  .sign-in-button:hover {
    opacity: 2;
    cursor: pointer;
    box-shadow: 0 2px 2px -3px #ff6100;
  }

  #sign-in-password {
    margin-bottom: 0;
  }

  #register-button {
    font-size: 14px;
  }

  #register-tag {
    font-size: 14px;
  }

  #resend-verification-tag {
    font-size: 12px;
  }

  #resend-verification-button {
    font-size: 12px;
  }

  #resend-verification-button:hover {
    font-weight: bold;
  }

  #forgot-password-tag {
    font-size: 12px;
  }

  #forgot-password-button {
    font-size: 12px;
  }

  #forgot-password-button:hover {
    font-weight: bold;
  }

</style>
