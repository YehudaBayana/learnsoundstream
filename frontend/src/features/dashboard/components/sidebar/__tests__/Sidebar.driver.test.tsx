import { SidebarDriver } from "./Sidebar.driver";
import { screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({ usePathname: () => "/" }));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
jest.mock("@/features/auth/query/useAuth", () => ({
  useGetCurrentUser: () => ({ data: null }),
  useLogout: () => ({ mutate: jest.fn() }),
}));

describe("Sidebar", () => {
  let driver: SidebarDriver;

  beforeEach(() => {
    driver = new SidebarDriver();
  });

  it("renders a configurable root and navigation links", () => {
    driver.render("main-sidebar");
    expect(driver.exists("main-sidebar")).toBe(true);
    expect(driver.hasNavigationItem(0, "main-sidebar")).toBe(true);
    expect(driver.hasNavigationItem(1, "main-sidebar")).toBe(true);
  });

  it("links to the video library", () => {
    driver.render();
    expect(screen.getByRole("link", { name: /Videos/ })).toHaveAttribute("href", "/videos");
  });
});
