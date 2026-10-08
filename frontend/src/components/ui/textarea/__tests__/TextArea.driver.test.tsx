import { TextAreaDriver } from "./TextArea.driver";

describe("TextArea", () => {
  let driver: TextAreaDriver;

  beforeEach(() => {
    driver = new TextAreaDriver();
  });

  it("renders with a configurable hook and reports changes", () => {
    const onChange = jest.fn();
    driver.render({ dataHook: "description-field", onChange });
    driver.changeValue("A track description", "description-field");

    expect(driver.getClassName("description-field")).toContain("resize-y");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("supports custom resize, variant, and disabled states", () => {
    driver.render({ resize: "none", variant: "filled", disabled: true, error: true });

    expect(driver.getClassName()).toContain("resize-none");
    expect(driver.getClassName()).toContain("bg-gray-100");
    expect(driver.isDisabled()).toBe(true);
  });
});
