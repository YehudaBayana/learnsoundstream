import { RegisterDriver } from "./Register.driver";
import * as authModule from "../query/useAuth";

jest.mock("../query/useAuth");

describe("Register", () => {
  let driver: RegisterDriver;
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authModule.useRegister as jest.Mock).mockReturnValue({ mutate: mockMutate });
    jest.spyOn(console, "log").mockImplementation(() => {});
    driver = new RegisterDriver();
  });

  afterEach(() => jest.restoreAllMocks());

  it("submits entered credentials through the registration mutation", () => {
    driver.render({ dataHook: "new-account" });
    driver.typeEmail("new@example.test", "new-account");
    driver.typePassword("secret123", "new-account");
    driver.submit("new-account");
    expect(mockMutate).toHaveBeenCalledWith({ email: "new@example.test", password: "secret123" });
  });

  it("calls the switch-to-login callback", () => {
    const onSwitchToLogin = jest.fn();
    driver.render({ onSwitchToLogin });
    driver.switchToLogin();
    expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
  });
});
