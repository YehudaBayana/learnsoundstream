import { FormFieldDriver } from "./FormField.driver";

describe("FormField", () => {
  let driver: FormFieldDriver;

  beforeEach(() => {
    driver = new FormFieldDriver();
  });

  it("renders a control and custom root hook", () => {
    driver.render({ dataHook: "email-field", label: "Email" });
    expect(driver.exists("email-field")).toBe(true);
    expect(driver.hasControl("email-field")).toBe(true);
  });

  it("renders an error message instead of helper text", () => {
    driver.render({ helperText: "Enter an email", error: "Email is required" });
    expect(driver.hasMessage()).toBe(true);
  });
});
