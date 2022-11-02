<template>
  <div id="update-password-component">
    <h1 id="update-password-component-header" v-show="showUpdatePasswordForm">Update Password</h1>
    <form v-show="showUpdatePasswordForm" id="update-password-form">
      <input type="email" id="update-password-username" placeholder="username">
      <input type="password" id="update-password" placeholder="password">
      <input type="password" id="confirmed-update-password" placeholder="confirm password">
      <input type="password" id="confirmation-code" placeholder="confirmation code">
      <button type="button"
              id="update-password-execute-button"
              v-on:click="executeUpdatePassword()">Submit</button>
    </form>
    <div>
      <button type="button" id="sign-in-view-button" v-on:click="loadSignInForm()">Sign In</button>
    </div>
    <h3 id="update-password-message"></h3>
  </div>
</template>

<script>

export default {
  name: 'UpdatePasswordComponent',
  data() {
    return {
      username: null,
      password: null,
      confirmedPassword: null,
      confirmationCode: null,
      cognitoUser: null,
      resultDetails: null,
      showUpdatePasswordForm: true,
      showUpdatePasswordErrorMessage: false,
    }
  },

  methods: {

    /**
     * Executes update password functionality on a cognito user. Be advised, this function returns a
     * promised and validates and clears all user input before passing input values to the confirm
     * password function on a cognito user object.
     *
     * @return {Promise<void>}
     */
    async executeUpdatePassword() {
      this.username = document.getElementById('update-password-username').value;
      this.password = document.getElementById('update-password').value;
      this.confirmedPassword = document.getElementById('confirmed-update-password').value;
      this.confirmationCode = document.getElementById('confirmation-code').value;

      if (this.username !== '' && this.password !== ''
        && this.confirmedPassword !== '' && this.confirmationCode !== '') {

        if (this.$helpers.isValidUserName(this.username)) {
          if (this.password === this.confirmedPassword) {
            // remove any error messages or inputs
            this.removeFormInputValues();
            this.updatePasswordMessage('');

            // set up cognito user
            this.cognitoUser = this.$helpers.buildCognitoUser(this.username);
            await this.confirmPassword();
            await this.$helpers.sleep(2000); // can we do a spinner here
            if (document.getElementById('update-password-message').textContent === 'Success') {
              console.log('loading sign in form');
              this.loadSignInForm();
            }

          } else {
            this.removeFormInputValues();
            this.updatePasswordMessage('passwords do not match');
          }
        } else {
          this.removeFormInputValues();
          this.updatePasswordMessage('invalid username');
        }
      } else {
        this.removeFormInputValues();
        this.updatePasswordMessage('oops missed credential(s)');
      }
    },

    /**
     * Calls the confirmPassword function on a cognito object. Be advised, the user needs to supply
     * the confirmation code sent to their email valid email address in order to confirm a password
     * update.
     *
     * @return {Promise<void>}
     */
    async confirmPassword() {
      if (this.cognitoUser !== null) {
        this.cognitoUser.confirmPassword(this.confirmationCode, this.confirmedPassword, {

          async onSuccess(result) {
            const updatePasswordUsername = document.getElementById('update-password-username');
            const updatePassword = document.getElementById('update-password');
            const updateConfirmedPassword = document.getElementById('confirmed-update-password');
            const confirmationCode = document.getElementById('confirmation-code');
            const updatePasswordMessage = document.getElementById('update-password-message');

            updatePasswordUsername.value = '';
            updatePassword.value = '';
            updateConfirmedPassword.value = '';
            confirmationCode.value = '';

            if (updatePasswordMessage !== null) {
              updatePasswordMessage.textContent = 'Success';
            }
            this.resultDetails = result;
          },

          onFailure(error) {
            const updatePasswordUsername = document.getElementById('update-password-username');
            const updatePassword = document.getElementById('update-password');
            const updateConfirmedPassword = document.getElementById('confirmed-update-password');
            const confirmationCode = document.getElementById('confirmation-code');
            const updatePasswordMessage = document.getElementById('update-password-message');

            updatePasswordUsername.value = '';
            updatePassword.value = '';
            updateConfirmedPassword.value = '';
            confirmationCode.value = '';

            if (updatePasswordMessage !== null) {
              updatePasswordMessage.textContent = error.message;
            }
          }
        })
      }
    },

    /**
     * Loads sign in form.
     */
    loadSignInForm() {
      window.location.reload();
    },

    /**
     * removes input values of the update-password form.
     */
    removeFormInputValues() {
      document.getElementById('update-password-username').value = '';
      document.getElementById('update-password').value = '';
      document.getElementById('confirmed-update-password').value = '';
      document.getElementById('confirmation-code').value = '';
    },

    /**
     * Updates the text content for the update-password-message.
     *
     * @param message the message to display
     */
    updatePasswordMessage(message) {
      document.getElementById('update-password-message').textContent = message;
    },
  }
}

</script>

<style>

</style>
