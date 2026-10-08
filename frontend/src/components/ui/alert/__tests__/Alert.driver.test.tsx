import { AlertDriver } from "./Alert.driver";

describe("Alert", () => {
  let driver: AlertDriver;

  beforeEach(() => {
    driver = new AlertDriver();
  });

  it.each([
    ["info", "bg-blue-50"],
    ["success", "bg-emerald-50"],
    ["warning", "bg-amber-50"],
    ["error", "bg-rose-50"],
  ] as const)("applies %s styling", (variant, expectedClass) => {
    driver.render({ variant });
    expect(driver.getClassName()).toContain(expectedClass);
  });

  it("renders an optional title and dismiss action", () => {
    const onDismiss = jest.fn();
    driver.render({ dataHook: "save-notice", title: "Saved", dismissible: true, onDismiss });
    expect(driver.exists("save-notice")).toBe(true);
    expect(driver.hasDismissButton("save-notice")).toBe(true);
    driver.clickDismiss("save-notice");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
