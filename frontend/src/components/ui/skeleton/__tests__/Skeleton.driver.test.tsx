import { SkeletonDriver } from "./Skeleton.driver";

describe("Skeleton", () => {
  let driver: SkeletonDriver;

  beforeEach(() => {
    driver = new SkeletonDriver();
  });

  it("renders a configurable root with animation by default", () => {
    driver.render({ dataHook: "cover-placeholder" });
    expect(driver.hasAnimation("cover-placeholder")).toBe(true);
  });

  it("supports shape variants and disables animation", () => {
    driver.render({ variant: "circular", width: 48, animate: false });
    expect(driver.getClassName()).toContain("rounded-full");
    expect(driver.hasAnimation()).toBe(false);
    expect(driver.getWidth()).toBe("48px");
  });

  it("renders all requested text lines", () => {
    driver.render({ variant: "text", lines: 3 });
    expect(driver.getLineCount()).toBe(3);
  });
});
