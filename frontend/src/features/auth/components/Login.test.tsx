import { LoginDriver } from './Login.driver';
import * as useAuthModule from '../query/useAuth';

jest.mock('../query/useAuth');

describe('Login Feature Component', () => {
  let driver: LoginDriver;
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthModule.useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });
    driver = new LoginDriver();
  });

  describe('rendering and layout', () => {
    it('renders login form and headings properly via driver', () => {
      driver.render();

      expect(driver.exists()).toBe(true);
      expect(driver.getHeadingText()).toBe('Welcome Back');
      expect(driver.getEmailValue()).toBe('');
      expect(driver.getPasswordValue()).toBe('');
    });

    it('renders with custom data-hook identifier', () => {
      const customHook = 'sign-in-box';
      driver.render({ dataHook: customHook });

      expect(driver.exists(customHook)).toBe(true);
    });
  });

  describe('user input and form submission', () => {
    it('updates input values and calls login mutation on submit', () => {
      driver.render();

      driver.typeEmail('user@soundstream.com');
      driver.typePassword('password123');

      expect(driver.getEmailValue()).toBe('user@soundstream.com');
      expect(driver.getPasswordValue()).toBe('password123');

      driver.submit();

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'user@soundstream.com',
        password: 'password123',
      });
    });

    it('triggers switch to register callback', () => {
      const onSwitchToRegister = jest.fn();
      driver.render({ onSwitchToRegister });

      driver.clickSwitchToRegister();

      expect(onSwitchToRegister).toHaveBeenCalledTimes(1);
    });
  });
});
