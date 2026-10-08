import { ProgressDriver } from "./Progress.driver";

describe("Progress", () => {
  let driver: ProgressDriver;

  beforeEach(() => {
    driver = new ProgressDriver();
  });

  it("clamps values and sets fill width", () => {
    driver.render({ dataHook: "upload-progress", value: 150, max: 100 });

    expect(driver.getValue("upload-progress")).toBe("100");
    expect(driver.getFillWidth("upload-progress")).toBe("100%");
  });

  it("supports sizes, variants, and formatted labels", () => {
    driver.render({
      value: 3,
      max: 10,
      size: "xs",
      variant: "danger",
      showLabel: true,
      formatLabel: (value, max) => `${value} of ${max}`,
    });

    expect(driver.getBarClassName()).toContain("h-1");
    expect(driver.getFillClassName()).toContain("bg-rose-500");
    expect(driver.getLabel()).toBe("3 of 10");
  });
});
