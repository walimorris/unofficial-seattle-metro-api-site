import { mount } from '@vue/test-utils'
import SignInComponent from '@/components/SignInComponent.vue'

/**
 * The SignInComponent Unit Tests focuses on the components state when it is mounted: are the correct
 * elements showing when mounted, test also focus on actions that take place within a component such
 * as: are the correct elements removed upon actions and so on.
 */
describe('SignInComponent.vue', () => {

  // ensure all sign-in component elements are in the correct state
  it('renders sign-in form when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const signInForm = wrapper.find('#sign-in');

    // here we use 'isVisible' because we use v-show binding in the component
    // when using v-show, the element is on the markup but not visible
    expect(signInForm.isVisible()).toBe(true);
  })

  it('renders sign-in form header when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const signInDefaultHeader = wrapper.find('#sign-in-default-header');
    expect(signInDefaultHeader.text()).toBe('Sign In');
    expect(signInDefaultHeader.isVisible()).toBe(true);
  });

  it('does not render registration form when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const registrationForm = wrapper.find('#registration-form');
    expect(registrationForm.isVisible()).toBe(false);
  });

  it('does not render resend verification form when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const resendVerificationForm = wrapper.find('#resend-verification-form');

    // here we use 'exists' because we use v-if binding in the component
    // when using v-if, the element is not on the markup and therefore not
    // visible on the view
    expect(resendVerificationForm.exists()).toBe(false);
  });

  it('it renders sign in form when user lands on the sign in view', () => {
    const wrapper = mount(SignInComponent);
    const signInForm = wrapper.find('#sign-in-form');
    expect(signInForm.isVisible()).toBe(true);
  });

  it('it renders sign in form input values as empty when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const signInUserName = wrapper.find('#sign-in-username');
    const signInPassword = wrapper.find('#sign-in-password');
    expect(signInUserName.exists()).toBe(true);
    expect(signInPassword.exists()).toBe(true);
    expect(signInUserName.isEmpty()).toBe(true);
    expect(signInPassword.isEmpty()).toBe(true);
  });

  it('renders the registration button when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const registrationButton = wrapper.find('#register-button');
    expect(registrationButton.isVisible()).toBe(true);
  });

  it('renders the resend verification code button when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const resendVerificationButton = wrapper.find('#resend-verification-button');
    expect(resendVerificationButton.isVisible()).toBe(true);
  });

  it('renders authorized tag and unauthorized reason messages as empty when user lands on sign in view', () => {
    const wrapper = mount(SignInComponent);
    const authorizedTagElement = wrapper.find('#authorized-tag');
    const unauthorizedElement = wrapper.find('#unauthorized-reason');
    expect(authorizedTagElement.isEmpty()).toBe(true);
    expect(unauthorizedElement.isEmpty()).toBe(true);
  });
});
