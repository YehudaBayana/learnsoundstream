import { TableRowSkeletonDriver } from "./TableRowSkeleton.driver";

describe("TableRowSkeleton", () => {
  it("renders table rows with stable hooks for each requested row", () => {
    const driver = new TableRowSkeletonDriver();
    driver.render("table-loading", 5);
    expect(driver.getRowCount("table-loading")).toBe(5);
  });
});
