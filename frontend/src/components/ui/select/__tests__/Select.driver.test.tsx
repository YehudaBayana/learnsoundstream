import { SelectDriver } from "./Select.driver";

describe("Select", () => {
  let driver: SelectDriver;

  beforeEach(() => {
    driver = new SelectDriver();
  });

  it("renders options and a placeholder under a custom hook", () => {
    driver.render({
      dataHook: "library-filter",
      placeholder: "All tracks",
      options: [
        { value: "ambient", label: "Ambient" },
        { value: "jazz", label: "Jazz" },
      ],
    });

    expect(driver.getOptionLabels("library-filter")).toEqual(["All tracks", "Ambient", "Jazz"]);
  });

  it("handles selection and disabled, error, and size states", () => {
    const onChange = jest.fn();
    driver.render({
      size: "sm",
      disabled: true,
      error: true,
      options: [{ value: "1", label: "One" }],
      onChange,
    });

    expect(driver.getClassName()).toContain("h-8");
    expect(driver.getClassName()).toContain("border-rose-500");
    expect(driver.isDisabled()).toBe(true);
    driver.changeValue("1");
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
