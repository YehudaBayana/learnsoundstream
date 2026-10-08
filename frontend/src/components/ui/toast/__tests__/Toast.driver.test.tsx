import { ToastDriver } from "./Toast.driver";

describe("Toast", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("renders its configurable root and variant style", () => {
    const driver = new ToastDriver();
    driver.render({ dataHook: "save-toast" });
    expect(driver.exists("save-toast")).toBe(true);
    expect(driver.getClassName("save-toast")).toContain("border-l-emerald-500");
  });

  it("calls dismiss after the exit animation delay", () => {
    const onDismiss = jest.fn();
    const driver = new ToastDriver();
    driver.render({ onDismiss });
    driver.clickDismiss();
    driver.advanceDismissAnimation();
    expect(onDismiss).toHaveBeenCalledWith("toast-1");
  });
});
