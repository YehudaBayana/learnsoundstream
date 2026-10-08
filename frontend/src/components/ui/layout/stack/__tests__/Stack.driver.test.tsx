import { StackDriver } from "./Stack.driver";

describe("Stack", () => {
  it("applies direction, gap, and wrapping classes", () => {
    const driver = new StackDriver();
    driver.render({
      dataHook: "stack-layout",
      direction: "horizontal",
      gap: 6,
      wrap: true,
    });
    expect(driver.getClassName("stack-layout")).toContain("flex-row");
    expect(driver.getClassName("stack-layout")).toContain("gap-6");
    expect(driver.getClassName("stack-layout")).toContain("flex-wrap");
  });
});
