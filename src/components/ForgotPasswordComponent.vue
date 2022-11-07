<template>
  <div :id="FORGOT_PASSWORD_COMP">
    <h2 :id="FORGOT_PASSWORD_COMP_HEADER" v-show="showForgotPasswordForm">Forgot Password</h2>
    <div :id="UPDATE_PASSWORD_FORM" v-if="showUpdatePasswordForm">
      <UpdatePasswordComponent></UpdatePasswordComponent>
    </div>
    <form v-show="showForgotPasswordForm" :id="FORGOT_PASSWORD_FORM">
      <input class="form-control" type="email" id="forgot-password-username" placeholder="username">
      <h3 :id="FORGOT_PASSWORD_MESSAGE"></h3>
      <button type="button"
              :id="FORGOT_PASSWORD_EXECUTION_BUTTON"
              v-on:click="executeForgotPassword()">Submit</button>
      <p :id="SIGN_IN_BUTTON_TAG">Change your mind? <a :id="SIGN_IN_BUTTON" href="#">Sign in</a></p>
    </form>
    <h2 :id="FORGOT_PASSWORD_CONFIRM_MESSAGE"></h2>
  </div>
</template>

<script>
import UpdatePasswordComponent from '@/components/UpdatePasswordComponent';
import config from '../../config/config';

export default {
  name: 'ForgotPasswordComponent',
  components: { UpdatePasswordComponent },
  data() {
    return {
      username: null,
      cognitoUser: null,
      showForgotPasswordForm: true,
      showUpdatePasswordForm: false,
      showSignInButton: true,
      codeDeliveryDetails: null,

      FORGOT_PASSWORD_COMP: 'forgot-password-component',
      FORGOT_PASSWORD_COMP_HEADER: 'forgot-password-component-header',
      FORGOT_PASSWORD_FORM: 'forgot-password-form',
      FORGOT_PASSWORD_USERNAME: 'forgot-password-username',
      FORGOT_PASSWORD_EXECUTION_BUTTON: 'forgot-password-execute-button',
      FORGOT_PASSWORD_MESSAGE: 'forgot-password-message',
      FORGOT_PASSWORD_CONFIRM_MESSAGE: 'forgot-password-confirm-message',

      SIGN_IN_BUTTON: 'sign-in-view-button',
      SIGN_IN_BUTTON_TAG: 'sign-in-button-tag',
      UPDATE_PASSWORD_FORM: 'update-password-form',
    }
  },

  mounted() {
    const signInButton = document.getElementById(this.SIGN_IN_BUTTON);
    signInButton.addEventListener('click', () => {
      this.loadSignInForm();
    });
  },

  methods: {

    /**
     * Executes forgot user functionality on a cognito user and helps validate input parameters before
     * allowing these values to pass to the actual cognito forgot password functionality.
     *
     * @return {Promise<void>}
     */
    async executeForgotPassword() {
      this.username = document.getElementById(this.FORGOT_PASSWORD_USERNAME).value;
      if (this.username !== '') {
        if (this.$helpers.isValidUserName(this.username)) {
          // set up cognito user
          this.cognitoUser = this.$helpers.buildCognitoUser(this.username);
          await this.forgotPassword();
          await this.$helpers.sleep(2000); // can we do a spinner here
          if (document.getElementById(this.FORGOT_PASSWORD_CONFIRM_MESSAGE).textContent === config.FORM_SUCCESS_MESSAGES.SUCCESS) {
            this.removeForgotPasswordProperties();
            this.showUpdatePasswordForm = true;
          }
        } else {
          this.renderErrorMessage(config.FORM_ERROR_MESSAGES.INVALID_USERNAME)
        }
      } else {
        this.renderErrorMessage(config.FORM_ERROR_MESSAGES.EMPTY_USERNAME)
      }
    },

    /**
     * Executes forgot password function on cognito usser. Be advised, this function returns a promise,
     * yet sends a confirmation code to the valid user's email address.
     *
     * @see CognitoUser
     * @return {Promise<void>}
     */
    async forgotPassword() {
      // call forgot password on cognito user
      if (this.cognitoUser !== null) {
        this.cognitoUser.forgotPassword({

          onSuccess(result) {
            const forgotPasswordUsername = document.getElementById('forgot-password-username');
            const forgotPasswordMessage = document.getElementById('forgot-password-message');
            const forgotPasswordConfirmMessage = document.getElementById('forgot-password-confirm-message');
            if (forgotPasswordUsername.value !== null) {
              forgotPasswordUsername.value = '';
            }
            if (forgotPasswordConfirmMessage !== null) {
              forgotPasswordMessage.textContent = ''
              forgotPasswordMessage.style.color = config.COLOR.BLACK;
              forgotPasswordConfirmMessage.textContent = 'Success';
            }
            this.codeDeliveryDetails = result;
          },
          onFailure(error) {
            const forgotPasswordUsername = document.getElementById('forgot-password-username');
            const forgotPasswordMessage = document.getElementById('forgot-password-message');
            if (forgotPasswordUsername.value !== null) {
              forgotPasswordUsername.value = '';
            }
            if (forgotPasswordMessage !== null) {
              forgotPasswordMessage.textContent = error.message;
              forgotPasswordMessage.style.color = config.COLOR.LIGHT_RED;
              forgotPasswordMessage.style.fontSize = config.FONT_SIZE.SMALL;
            }
          },
        });
      }
    },

    /**
     * Loads sign-in view.
     */
    loadSignInForm() {
      window.location.reload();
    },

    /**
     * Clears forgot-password form input values.
     */
    clearForgotPasswordInput() {
      if (document.getElementById(this.FORGOT_PASSWORD_USERNAME).value !== null) {
        document.getElementById(this.FORGOT_PASSWORD_USERNAME).value = config.FORM_VALUE.EMPTY;
      }
    },

    /**
     * Removes forgot-password component properties and any text values.
     */
    removeForgotPasswordProperties() {
      this.showForgotPasswordForm = false;
      this.showSignInButton = false;
      document.getElementById(this.FORGOT_PASSWORD_CONFIRM_MESSAGE).innerHTML = config.FORM_VALUE.EMPTY;
      document.getElementById(this.FORGOT_PASSWORD_MESSAGE).innerHTML = config.FORM_VALUE.EMPTY;
    },

    renderErrorMessage(message) {
      this.clearForgotPasswordInput();
      document.getElementById(this.FORGOT_PASSWORD_MESSAGE).innerHTML = message;
      document.getElementById(this.FORGOT_PASSWORD_MESSAGE).style.color = config.COLOR.LIGHT_RED;
      document.getElementById(this.FORGOT_PASSWORD_MESSAGE).style.fontSize = config.FONT_SIZE.SMALL;
    }
  }
};

</script>

<style>

#forgot-password-component {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

#forgot-password-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#forgot-password-execute-button {
  background: linear-gradient(#ff6100, rgba(255, 80, 80, 1));
  animation: btn 6.0s 3s infinite ease-in-out;
  transition: all 0.3s;
  border-radius: 4px;
  border: none;
  outline: none;
  width: 100%;
  height: 35px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
}

#forgot-password-execute-button:hover {
  opacity: 2;
  cursor: pointer;
  box-shadow: 0 2px 2px -3px #ff6100;
}

#sign-in-button-tag {
  font-size: 14px;
}

#forgot-password-username {
  margin-bottom: .01rem;
  width: 100%;
}

</style>
