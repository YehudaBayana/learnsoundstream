import { InputDriver } from "./Input.driver";

describe("Input", () => {
  let driver: InputDriver;

  beforeEach(() => {
    driver = new InputDriver();
  });

  it("renders its root and input hooks, including a custom hook", () => {
    driver.render({ dataHook: "search-field", placeholder: "Search" });

    expect(driver.exists("search-field")).toBe(true);
    expect(driver.hasPlaceholder("Search", "search-field")).toBe(true);
  });

  it("reports its current value and emits changes", () => {
    const onChange = jest.fn();
    driver.render({ value: "initial", onChange });

    expect(driver.getValue()).toBe("initial");
    driver.changeValue("updated");

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("exposes disabled and validation states through the input hook", () => {
    driver.render({ disabled: true, error: true });

    expect(driver.isDisabled()).toBe(true);
    expect(driver.isInvalid()).toBe(true);
  });
});
