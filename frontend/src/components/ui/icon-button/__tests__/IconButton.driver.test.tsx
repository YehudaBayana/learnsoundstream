import { IconButtonDriver } from "./IconButton.driver";

describe("IconButton", () => {
  let driver: IconButtonDriver;

  beforeEach(() => {
    driver = new IconButtonDriver();
  });

  it("supports a custom root hook and invokes its action", () => {
    const onClick = jest.fn();
    driver.render({ dataHook: "play-control", onClick });
    driver.click("play-control");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables while loading and applies variant, size, and rounded styles", () => {
    driver.render({ loading: true, variant: "danger", size: "lg", rounded: true });
    expect(driver.isDisabled()).toBe(true);
    expect(driver.getClassName()).toContain("bg-rose-600");
    expect(driver.getClassName()).toContain("w-12 h-12");
    expect(driver.getClassName()).toContain("rounded-full");
  });
});
