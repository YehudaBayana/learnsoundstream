import { BreadcrumbDriver } from "./Breadcrumb.driver";

describe("Breadcrumb", () => {
  let driver: BreadcrumbDriver;

  beforeEach(() => {
    driver = new BreadcrumbDriver();
  });

  it("renders a configurable root and navigation links", () => {
    driver.render({ dataHook: "library-crumbs" });
    expect(driver.exists("library-crumbs")).toBe(true);
    expect(driver.getLinkHref(0, "library-crumbs")).toBe("/");
    expect(driver.getLinkHref(1, "library-crumbs")).toBe("/library");
  });

  it("marks the final item as the current page", () => {
    driver.render();
    expect(driver.isCurrentItemMarked()).toBe(true);
  });
});
