import { CommentSkeletonDriver } from "./CommentSkeleton.driver";

describe("CommentSkeleton", () => {
  it("renders the configured number of hooked comment placeholders", () => {
    const driver = new CommentSkeletonDriver();
    driver.render("comment-loading", 4);
    expect(driver.hasRoot("comment-loading")).toBe(true);
    expect(driver.getItemCount("comment-loading")).toBe(4);
  });
});
