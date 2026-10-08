import { SpinnerDriver } from "./Spinner.driver";

describe("Spinner", () => {
  let driver: SpinnerDriver;

  beforeEach(() => {
    driver = new SpinnerDriver();
  });

  it.each([
    ["xs", "w-3"],
    ["md", "w-6"],
    ["xl", "w-12"],
  ] as const)("supports %s size", (size, expectedClass) => {
    driver.render({ size });
    expect(driver.getClassName()).toContain(expectedClass);
  });

  it.each([
    ["default", "border-gray-300"],
    ["primary", "border-emerald-200"],
    ["white", "border-t-white"],
  ] as const)("supports %s color variant", (variant, expectedClass) => {
    driver.render({ variant });
    expect(driver.getClassName()).toContain(expectedClass);
  });

  it("exposes its configurable hook and accessible label", () => {
    driver.render({ dataHook: "loading-spinner", label: "Loading tracks" });
    expect(driver.getAccessibleLabel("loading-spinner")).toBe("Loading tracks");
  });
});
