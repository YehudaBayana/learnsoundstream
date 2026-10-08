import { EmptyStateDriver } from "./EmptyState.driver";

jest.mock(
  "framer-motion",
  () => {
    const MockMotionDiv = (props: React.ComponentProps<"div">) => <div {...props} />;
    MockMotionDiv.displayName = "MockMotionDiv";
    return {
      motion: { div: MockMotionDiv },
    };
  },
  { virtual: true },
);

describe("EmptyState", () => {
  it("renders custom title and search guidance through hooks", () => {
    const driver = new EmptyStateDriver();
    driver.render({
      type: "search",
      dataHook: "search-empty",
      customTitle: "No tracks",
      searchQuery: "ambient",
    });
    expect(driver.exists("search-empty")).toBe(true);
    expect(driver.getTitle("search-empty")).toBe("No tracks");
    expect(driver.getMessage("search-empty")).toContain("ambient");
  });

  it("invokes its configured action callback", () => {
    const onAction = jest.fn();
    const driver = new EmptyStateDriver();
    driver.render({ type: "library", actionText: "Explore", onAction });
    driver.clickAction();
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
