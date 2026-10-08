import { FooterDriver } from "./Footer.driver";

describe("Dashboard Footer", () => {
  it("renders its configurable feature hook", () => {
    const driver = new FooterDriver();
    driver.render("global-footer");
    expect(driver.exists("global-footer")).toBe(true);
  });
});
