import { FlexDriver } from "./Flex.driver";

describe("Flex", () => {
  it("renders configurable direction, gap, and semantic element", () => {
    const driver = new FlexDriver();
    driver.render({
      dataHook: "toolbar-layout",
      direction: "row-reverse",
      gap: 4,
      as: "section",
    });
    expect(driver.getTagName("toolbar-layout")).toBe("SECTION");
    expect(driver.getClassName("toolbar-layout")).toContain("flex-row-reverse");
    expect(driver.getClassName("toolbar-layout")).toContain("gap-4");
  });
});
