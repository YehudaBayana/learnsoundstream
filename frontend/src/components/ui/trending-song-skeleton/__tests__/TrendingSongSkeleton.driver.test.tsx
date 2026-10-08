import { TrendingSongSkeletonDriver } from "./TrendingSongSkeleton.driver";

describe("TrendingSongSkeleton", () => {
  it("renders the requested number of hooked placeholders", () => {
    const driver = new TrendingSongSkeletonDriver();
    driver.render("trending-loading", 2);
    expect(driver.getItemCount("trending-loading")).toBe(2);
  });
});
