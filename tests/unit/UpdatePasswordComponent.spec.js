import { mount } from '@vue/test-utils'
import UpdatePasswordComponent from '@/components/UpdatePasswordComponent';

/**
 * The UpdatePasswordComponent Unit Tests focuses on the components state when it is mounted: are
 * the correct elements showing when mounted, test also focus on actions that take place within a
 * component such as: are the correct elements removed upon actions and so on.
 */
describe('UpdatePasswordComponent.vue', () => {

  // ensure all forgot-password component elements are in the correct state
  it('renders update-password component when user lands on update password view', () => {
    const wrapper = mount(UpdatePasswordComponent);
    const updatePasswordComponent = wrapper.find('#update-password-component');
    expect(updatePasswordComponent.isVisible()).toBe(true);
    expect(updatePasswordComponent.exists()).toBe(true);
  });

  it('renders update-password-component-header when user lands on update password view', () => {
    const wrapper = mount(UpdatePasswordComponent);
    const updatePasswordHeader = wrapper.find('#update-password-component-header');
    expect(updatePasswordHeader.exists()).toBe(true);
    expect(updatePasswordHeader.isVisible()).toBe(true);
  });

  it('renders update-password-form when user lands on update password view', () => {
    const wrapper = mount(UpdatePasswordComponent);
    const updatePasswordForm = wrapper.find('#update-password-form');
    expect(updatePasswordForm.exists()).toBe(true);
    expect(updatePasswordForm.isVisible()).toBe(true);
  });

  it('renders update-password-form input values when user lands on update password view', () => {
    const wrapper = mount(UpdatePasswordComponent);
    const updatePasswordUsername = wrapper.find('#update-password-username');
    const updatePassword = wrapper.find('#update-password');
    const updatePasswordConfirmed = wrapper.find('#confirmed-update-password');
    const confirmationCode = wrapper.find('#confirmation-code');
    const updatePasswordButton = wrapper.find('#update-password-execute-button');

    expect(updatePassword.exists()).toBe(true);
    expect(updatePassword.isVisible()).toBe(true);

    expect(updatePasswordUsername.exists()).toBe(true);
    expect(updatePasswordUsername.isVisible()).toBe(true);

    expect(updatePasswordConfirmed.exists()).toBe(true);
    expect(updatePasswordConfirmed.isVisible()).toBe(true);

    expect(confirmationCode.exists()).toBe(true);
    expect(confirmationCode.isVisible()).toBe(true);

    expect(updatePasswordButton.exists()).toBe(true);
    expect(updatePasswordButton.isVisible()).toBe(true);
  });

  it('renders the load-sign-in button when user lands on update password view', () => {
    const wrapper = mount(UpdatePasswordComponent);
    const signInButton = wrapper.find('#sign-in-view-button');
    expect(signInButton.exists()).toBe(true);
    expect(signInButton.isVisible()).toBe(true);
  });

  it('renders empty update-password-message when user lands on update password view', () => {
    const wrapper = mount(UpdatePasswordComponent);
    const updatePasswordMessage = wrapper.find('#update-password-message');
    expect(updatePasswordMessage.exists()).toBe(true);
    expect(updatePasswordMessage.isVisible()).toBe(true);
    expect(updatePasswordMessage.isEmpty()).toBe(true);
  });

});
