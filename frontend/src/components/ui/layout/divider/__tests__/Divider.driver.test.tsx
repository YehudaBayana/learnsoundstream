import { DividerDriver } from "./Divider.driver";

describe("Divider", () => {
  it("renders a hookable vertical separator", () => {
    const driver = new DividerDriver();
    driver.render({
      dataHook: "column-divider",
      orientation: "vertical",
      variant: "dashed",
    });
    expect(driver.getTagName("column-divider")).toBe("DIV");
    expect(driver.getClassName("column-divider")).toContain("border-dashed");
  });
});
