import { SwitchDriver } from "./Switch.driver";

describe("Switch", () => {
  let driver: SwitchDriver;

  beforeEach(() => {
    driver = new SwitchDriver();
  });

  it("exposes checked and disabled state through the input hook", () => {
    driver.render({ dataHook: "notifications-switch", checked: true, disabled: true });
    expect(driver.isChecked("notifications-switch")).toBe(true);
    expect(driver.isDisabled("notifications-switch")).toBe(true);
  });

  it("applies label position and emits changes", () => {
    const onChange = jest.fn();
    driver.render({ labelPosition: "left", onChange });
    expect(driver.getRootClassName()).toContain("flex-row-reverse");
    driver.toggle();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
