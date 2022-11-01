import { mount } from '@vue/test-utils'
import ForgotPasswordComponent from '@/components/ForgotPasswordComponent';

/**
 * The ForgotPasswordComponent Unit Tests focuses on the components state when it is mounted: are
 * the correct elements showing when mounted, test also focus on actions that take place within a
 * component such as: are the correct elements removed upon actions and so on.
 */
describe('ForgotPasswordComponent.vue', () => {

  // ensure all forgot-password component elements are in the correct state
  it('renders forgot-password component when user lands on forgot password view', () => {
    const wrapper = mount(ForgotPasswordComponent);
    const forgotPasswordComponent = wrapper.find('#forgot-password-component');
    expect(forgotPasswordComponent.isVisible()).toBe(true);
    expect(forgotPasswordComponent.exists()).toBe(true);
  });

  it('renders forgot-password component header when user lands on forgot password view', () => {
    const wrapper = mount(ForgotPasswordComponent);
    const forgotPasswordComponentHeader = wrapper.find('#forgot-password-component-header');
    expect(forgotPasswordComponentHeader.isVisible()).toBe(true);
  });

  it('does not render resend-verification-component when user lands on forgot password view', () => {
    const wrapper = mount(ForgotPasswordComponent);
    const resendVerificationComponent = wrapper.find('#resend-verification-form');
    expect(resendVerificationComponent.exists()).toBe(false);
  });

  it('renders forgot-password form when user lands on forgot password view', () => {
    const wrapper = mount(ForgotPasswordComponent);
    const forgotPasswordForm = wrapper.find('#forgot-password-form');
    expect(forgotPasswordForm.isVisible()).toBe(true);
  });
});
