import { RequireAuthDriver } from "./RequireAuth.driver";
import { usePathname, useRouter } from "next/navigation";
import * as authModule from "../query/useAuth";

jest.mock("next/navigation", () => ({ usePathname: jest.fn(), useRouter: jest.fn() }));
jest.mock("../query/useAuth");

describe("RequireAuth", () => {
  let driver: RequireAuthDriver;
  const replace = jest.fn();
  const refetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/auth/history");
    (useRouter as jest.Mock).mockReturnValue({ replace });
    (authModule.useGetCurrentUser as jest.Mock).mockReturnValue({
      data: { user: { id: "user-1" } },
      isError: false,
      isPending: false,
      isLoading: false,
      refetch,
    });
    driver = new RequireAuthDriver();
  });

  it("renders children for an authenticated user", () => {
    driver.render("protected-route");
    expect(driver.hasRoot("protected-route")).toBe(true);
    expect(driver.hasChild("protected-route")).toBe(true);
  });

  it("shows verification error and supports retry", () => {
    (authModule.useGetCurrentUser as jest.Mock).mockReturnValue({
      data: null,
      isError: true,
      isPending: false,
      isLoading: false,
      refetch,
    });
    driver.render();
    expect(driver.hasError()).toBe(true);
    driver.clickRetry();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("redirects unauthorized users back to the requested path", () => {
    (authModule.useGetCurrentUser as jest.Mock).mockReturnValue({
      data: null,
      isError: false,
      isPending: false,
      isLoading: false,
      refetch,
    });
    driver.render();
    expect(replace).toHaveBeenCalledWith("/auth?next=%2Fauth%2Fhistory");
  });
});
