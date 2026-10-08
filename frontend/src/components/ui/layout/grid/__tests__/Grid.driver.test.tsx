import { GridDriver } from "./Grid.driver";

describe("Grid", () => {
  it("applies responsive column and gap classes under a hook", () => {
    const driver = new GridDriver();
    driver.render({ dataHook: "album-grid", cols: 4, colsMobile: 1, gap: 6 });
    expect(driver.getClassName("album-grid")).toContain("grid-cols-1");
    expect(driver.getClassName("album-grid")).toContain("lg:grid-cols-4");
    expect(driver.getClassName("album-grid")).toContain("gap-6");
  });
});
