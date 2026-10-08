import { ButtonGroupDriver } from "./ButtonGroup.driver";

describe("ButtonGroup", () => {
  let driver: ButtonGroupDriver;

  beforeEach(() => {
    driver = new ButtonGroupDriver();
  });

  it("renders a group root with a configurable hook", () => {
    driver.render({ dataHook: "transport-controls" });
    expect(driver.getRole("transport-controls")).toBe("group");
  });

  it("applies orientation, attachment, and full-width classes", () => {
    driver.render({ orientation: "vertical", attached: true, fullWidth: true });
    expect(driver.getClassName()).toContain("flex-col");
    expect(driver.getClassName()).toContain("flex ");
    expect(driver.getClassName()).toContain("[&>*:first-child]:rounded-b-none");
  });
});
