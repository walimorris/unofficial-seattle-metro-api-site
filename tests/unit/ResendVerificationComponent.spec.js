import { mount } from '@vue/test-utils'
import ResendVerificationComponent from '@/components/ResendVerificationComponent.vue'

/**
 * The ResendVerificationComponent Unit Tests focuses on the components state when it is mounted:
 * are the correct elements showing when mounted, test also focus on actions that take place within
 * a component such as: are the correct elements removed upon actions and so on.
 */

describe('ResendVerificationComponent', () => {

  // ensure all resend-verification component elements are in the correct state
  it('renders resend-verification component', () => {
    const wrapper = mount(ResendVerificationComponent);
    const resendVerificationComponent = wrapper.find('#resend-verification');
    expect(resendVerificationComponent.exists()).toBe(true);
    expect(resendVerificationComponent.isVisible()).toBe(true);
  });

  it('renders resend-verification-header', () => {
    const wrapper = mount(ResendVerificationComponent);
    const resendVerificationHeader = wrapper.find('#resend-verification-header');
    expect(resendVerificationHeader.exists()).toBe(true);
    expect(resendVerificationHeader.isVisible()).toBe(true);
  });

  it('renders resend-verification form', () => {
    const wrapper = mount(ResendVerificationComponent);
    const resendVerificationForm = wrapper.find('#resend-verification-form');
    const resendVerificationUsername = wrapper.find('#user-email');
    const resendVerificationButton = wrapper.find('#resend-verification-button');

    expect(resendVerificationForm.exists()).toBe(true);
    expect(resendVerificationForm.isVisible()).toBe(true);

    expect(resendVerificationUsername.exists()).toBe(true);
    expect(resendVerificationUsername.isEmpty()).toBe(true);

    expect(resendVerificationButton.exists()).toBe(true);
    expect(resendVerificationButton.isVisible()).toBe(true);
  });

  it('renders sign-in button to sign-in view component', () => {
    const wrapper = mount(ResendVerificationComponent);
    const signInButton = wrapper.find('#load-sign-button');
    expect(signInButton.exists()).toBe(true);
    expect(signInButton.isVisible()).toBe(true);
  });

  it('renders empty resend-verification message', () => {
    const wrapper = mount(ResendVerificationComponent);
    const resendVerificationMessage = wrapper.find('#resend-verification-message');
    expect(resendVerificationMessage.exists()).toBe(true);
    expect(resendVerificationMessage.isVisible()).toBe(true);
    expect(resendVerificationMessage.isEmpty()).toBe(true);
  });

  // ConfirmationRegistrationForm is a child of ResendVerificationComponent and should render as
  // v-show=false when resend-component renders.
  it('does not render confirmation-registration component', () => {
    const wrapper = mount(ResendVerificationComponent);
    const confirmationRegistrationComponent = wrapper.find('#view-to-confirmation-registration-form');
    expect(confirmationRegistrationComponent.exists()).toBe(false);
  });
});
