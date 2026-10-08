import { useRouter } from "next/navigation";
import * as authModule from "../../query/useAuth";
import { AuthViewDriver } from "./AuthView.driver";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("../../query/useAuth");

describe("AuthView", () => {
  let driver: AuthViewDriver;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (authModule.useGetCurrentUser as jest.Mock).mockReturnValue({ data: null, isLoading: false });
    (authModule.useLogout as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    (authModule.useLogin as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    (authModule.useRegister as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    driver = new AuthViewDriver();
  });

  it("switches between Login and Register via data hooks", () => {
    driver.render("auth-screen");
    expect(driver.hasLogin("auth-screen")).toBe(true);
    driver.switchToRegister();
    expect(driver.hasRegister("auth-screen")).toBe(true);
    driver.switchToLogin();
    expect(driver.hasLogin("auth-screen")).toBe(true);
  });
});
