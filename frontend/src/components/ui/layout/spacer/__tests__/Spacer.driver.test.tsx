import { SpacerDriver } from "./Spacer.driver";

describe("Spacer", () => {
  it("supports flexible and fixed-axis spacing", () => {
    const driver = new SpacerDriver();
    driver.render({ dataHook: "toolbar-spacer" });
    expect(driver.getClassName("toolbar-spacer")).toContain("flex-1");
    driver.render({ dataHook: "fixed-spacer", size: 8, axis: "vertical" });
    expect(driver.getClassName("fixed-spacer")).toContain("h-8");
  });
});
