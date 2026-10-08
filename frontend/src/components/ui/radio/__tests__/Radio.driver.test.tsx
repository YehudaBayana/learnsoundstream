import { RadioDriver } from "./Radio.driver";

describe("Radio", () => {
  let driver: RadioDriver;

  beforeEach(() => {
    driver = new RadioDriver();
  });

  it("renders a custom hooked radio and reports selection", () => {
    driver.render({ dataHook: "plan-option", value: "pro", checked: true, label: "Pro plan" });
    expect(driver.isChecked("plan-option")).toBe(true);
  });

  it("fires the change handler when selected", () => {
    const onChange = jest.fn();
    driver.render({ onChange });
    driver.click();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
