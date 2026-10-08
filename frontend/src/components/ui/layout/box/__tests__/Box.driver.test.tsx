import { BoxDriver } from "./Box.driver";

describe("Box", () => {
  it("renders its configurable root as the requested element", () => {
    const driver = new BoxDriver();
    driver.render({ dataHook: "content-box", as: "section", p: 4 });
    expect(driver.getTagName("content-box")).toBe("SECTION");
    expect(driver.getClassName("content-box")).toContain("p-4");
  });
});
