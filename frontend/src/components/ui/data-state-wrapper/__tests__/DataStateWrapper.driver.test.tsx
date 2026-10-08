import { DataStateWrapperDriver } from "./DataStateWrapper.driver";

describe("DataStateWrapper", () => {
  let driver: DataStateWrapperDriver;

  beforeEach(() => {
    driver = new DataStateWrapperDriver();
  });

  it("renders the success state through its configurable root hook", () => {
    driver.render({ dataHook: "playlist-results" });
    expect(driver.exists("playlist-results")).toBe(true);
    expect(driver.hasState("content", "playlist-results")).toBe(true);
  });

  it("renders loading and empty states", () => {
    driver.render({ loading: true });
    expect(driver.hasState("loading")).toBe(true);

    driver.render({ empty: true });
    expect(driver.hasState("empty")).toBe(true);
  });

  it("renders errors and invokes retry", () => {
    const onRetry = jest.fn();
    driver.render({ error: "Request failed", onRetry });
    expect(driver.hasState("error")).toBe(true);
    driver.clickRetry();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
