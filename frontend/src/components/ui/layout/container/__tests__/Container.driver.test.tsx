import { ContainerDriver } from "./Container.driver";

describe("Container", () => {
  it("applies size, centering, and horizontal padding", () => {
    const driver = new ContainerDriver();
    driver.render({ dataHook: "page-container", size: "md" });
    expect(driver.getClassName("page-container")).toContain("max-w-screen-md");
    expect(driver.getClassName("page-container")).toContain("mx-auto");
    expect(driver.getClassName("page-container")).toContain("px-4");
  });
});
